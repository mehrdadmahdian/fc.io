package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CardRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewCardRepository(mongoService *internal_mongo.MongoService) (*CardRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("cards")

	return &CardRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (cardRepository *CardRepository) FindById(ctx context.Context, id string) (*models.Card, error) {
	objectId, err := models.StringToObjectID(id)
	if err != nil {
		return nil, err
	}

	var card models.Card
	err = cardRepository.collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&card)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &card, nil
}

func (cardRepository *CardRepository) Insert(ctx context.Context, card *models.Card) (*models.Card, error) {
	_, err := cardRepository.collection.InsertOne(ctx, card)
	if err != nil {
		return nil, err
	}

	return card, nil
}

func (cardRepository *CardRepository) GetAllCardsOfTheBox(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"box_id": box.ID}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "boxes",
			"localField":   "box_id",
			"foreignField": "_id",
			"as":           "box",
		}}},
		// {{Key: "$lookup", Value: bson.M{
		// 	"from":         "stages",
		// 	"localField":   "stage_id",
		// 	"foreignField": "_id",
		// 	"as":           "stage",
		// }}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "labels",
			"localField":   "label_ids",
			"foreignField": "_id",
			"as":           "labels",
		}}},
		{{Key: "$unwind", Value: bson.M{
			"path":                       "$box",
			"preserveNullAndEmptyArrays": true,
		}}},
		{{Key: "$unwind", Value: bson.M{
			"path":                       "$stage",
			"preserveNullAndEmptyArrays": true,
		}}},
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}
	return cards, nil
}

// PaginatedCardsResult contains paginated card results and metadata
type PaginatedCardsResult struct {
	Cards      []*models.Card
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// GetBoxCardsPaginated retrieves cards with pagination, filtering, search, and sorting
func (cardRepository *CardRepository) GetBoxCardsPaginated(
	ctx context.Context,
	box *models.Box,
	page int,
	pageSize int,
	statusFilter string,
	searchQuery string,
	sortBy string,
	sortOrder int,
) (*PaginatedCardsResult, error) {
	// Build match filter
	matchFilter := bson.M{"box_id": box.ID}

	// Apply status filter
	if statusFilter != "" {
		switch statusFilter {
		case "new":
			matchFilter["review.reviews_count"] = 0
		case "learning":
			matchFilter["review.reviews_count"] = bson.M{"$gt": 0}
			matchFilter["review.interval"] = bson.M{"$lt": 7}
		case "review":
			matchFilter["review.interval"] = bson.M{"$gte": 7}
		case "archived":
			matchFilter["review.next_due_date"] = nil
		}
	}

	// Apply search filter (search in front, back, and extra fields)
	if searchQuery != "" {
		matchFilter["$or"] = []bson.M{
			{"front": bson.M{"$regex": searchQuery, "$options": "i"}},
			{"back": bson.M{"$regex": searchQuery, "$options": "i"}},
			{"extra": bson.M{"$regex": searchQuery, "$options": "i"}},
		}
	}

	// Count total documents matching the filter
	total, err := cardRepository.collection.CountDocuments(ctx, matchFilter)
	if err != nil {
		return nil, err
	}

	// Calculate pagination
	skip := (page - 1) * pageSize
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	// Build sort order
	sortField := "updated_at"
	if sortBy != "" {
		sortField = sortBy
	}
	if sortOrder != -1 && sortOrder != 1 {
		sortOrder = -1 // Default to descending
	}

	// Build aggregation pipeline
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: matchFilter}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "labels",
			"localField":   "label_ids",
			"foreignField": "_id",
			"as":           "labels",
		}}},
		{{Key: "$sort", Value: bson.D{{Key: sortField, Value: sortOrder}}}},
		{{Key: "$skip", Value: skip}},
		{{Key: "$limit", Value: pageSize}},
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}

	return &PaginatedCardsResult{
		Cards:      cards,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (cardRepository *CardRepository) GetFirstEligibleCardToReview(ctx context.Context, box *models.Box) (*models.Card, error) {
	currentTime := time.Now()

	filter := bson.M{
		"box_id": box.ID,
		"review": bson.M{"$ne": nil},
		"review.next_due_date": bson.M{
			"$ne":  nil,
			"$lte": currentTime,
		},
	}

	sort := bson.D{{Key: "review.next_due_date", Value: 1}}

	var card models.Card
	err := cardRepository.collection.FindOne(
		ctx,
		filter,
		options.FindOne().SetSort(sort),
	).Decode(&card)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &card, nil
}

func (cardRepository *CardRepository) GetBoxCardsToReview(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	currentTime := time.Now()

	// Use aggregation pipeline to include labels lookup
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"box_id": box.ID,
			"review": bson.M{"$ne": nil},
			"review.next_due_date": bson.M{
				"$ne":  nil,
				"$lte": currentTime,
			},
		}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "labels",
			"localField":   "label_ids",
			"foreignField": "_id",
			"as":           "labels",
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "review.next_due_date", Value: 1}}}},
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}
	return cards, nil
}

func (cardRepository *CardRepository) GetCountOfRemainingCardsForReview(ctx context.Context, box *models.Box) (*int64, error) {
	currentTime := time.Now()

	filter := bson.M{
		"box_id": box.ID,
		"review": bson.M{"$ne": nil},
		"review.next_due_date": bson.M{
			"$ne":  nil,
			"$lte": currentTime,
		},
	}

	count, err := cardRepository.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return nil, err
	}

	return &count, nil
}

func (repository *CardRepository) GetCountOfNeedingReviewCount(ctx context.Context, box *models.Box) (*int64, error) {
	filter := bson.M{
		"box_id": box.ID,
		"review": bson.M{"$ne": nil},
		"review.next_due_date": bson.M{
			"$ne": nil,
		},
	}

	count, err := repository.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return nil, err
	}

	return &count, nil
}

func (cardRepository *CardRepository) GetCountOfAllCardsOfTheBox(ctx context.Context, box *models.Box) (*int64, error) {

	filter := bson.M{
		"box_id": box.ID,
	}

	count, err := cardRepository.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return nil, err
	}

	return &count, nil
}

func (cardRepository *CardRepository) UpdateCardReview(
	ctx context.Context,
	card *models.Card,
	nextReviewDate *time.Time,
	interval int,
	easeFactor float64,
	reviewRecord *models.ReviewHistoryRecord,
) error {
	update := bson.M{
		"$set": bson.M{
			"review.next_due_date": nextReviewDate,
			"review.interval":      interval,
			"review.ease_factor":   easeFactor,
			"review.reviews_count": card.Review.ReviewsCount + 1,
		},
		"$push": bson.M{
			"review.review_history": reviewRecord,
		},
		"$setOnInsert": bson.M{
			"review.last_review_date": time.Now(),
		},
		"$currentDate": bson.M{
			"updated_at": true,
		},
	}
	filter := bson.M{"_id": card.ID}
	_, err := cardRepository.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (cardRepository *CardRepository) SetArchived(ctx context.Context, cardID string) error {
	objectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{
		"$set": bson.M{
			"review.next_due_date":         nil,
			"reverse_review.next_due_date": nil,
		},
	}
	_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (cardRepository *CardRepository) UpdateCard(ctx context.Context, card *models.Card) error {
	filter := bson.M{"_id": card.ID}
	update := bson.M{
		"$set": card,
	}
	_, err := cardRepository.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (cardRepository *CardRepository) GetCardsByStatus(ctx context.Context, box *models.Box, status string) ([]*models.Card, error) {
	var filter bson.M

	switch status {
	case "new":
		filter = bson.M{
			"box_id":               box.ID,
			"review.reviews_count": 0,
		}
	case "learning":
		filter = bson.M{
			"box_id":               box.ID,
			"review.reviews_count": bson.M{"$gt": 0},
			"review.interval":      bson.M{"$lt": 7},
		}
	case "review":
		filter = bson.M{
			"box_id":          box.ID,
			"review.interval": bson.M{"$gte": 7},
		}
	case "archived":
		filter = bson.M{
			"box_id":               box.ID,
			"review.next_due_date": nil,
		}
	default:
		filter = bson.M{"box_id": box.ID}
	}

	cursor, err := cardRepository.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}
	return cards, nil
}

func (cardRepository *CardRepository) UpdateCardContent(ctx context.Context, cardID string, front string, back string, extra string, hint string, labelIds []string, isBookmarked bool, difficulty string) error {
	objectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	// Convert label IDs to ObjectIDs
	labelObjectIds := []primitive.ObjectID{}
	for _, labelId := range labelIds {
		objectid, err := models.StringToObjectID(labelId)
		if err != nil {
			return err
		}
		labelObjectIds = append(labelObjectIds, objectid)
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{
		"$set": bson.M{
			"front":         front,
			"back":          back,
			"extra":         extra,
			"hint":          hint,
			"label_ids":     labelObjectIds,
			"is_bookmarked": isBookmarked,
			"difficulty":    difficulty,
			"updated_at":    time.Now(),
		},
	}

	_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
	return err
}

func (cardRepository *CardRepository) DeleteCard(ctx context.Context, cardID string) error {
	objectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objectId}
	_, err = cardRepository.collection.DeleteOne(ctx, filter)
	return err
}

// Reverse review methods

func (cardRepository *CardRepository) GetFirstEligibleCardToReverseReview(ctx context.Context, box *models.Box) (*models.Card, error) {
	currentTime := time.Now()

	filter := bson.M{
		"box_id":         box.ID,
		"reverse_review": bson.M{"$ne": nil},
		"reverse_review.next_due_date": bson.M{
			"$ne":  nil,
			"$lte": currentTime,
		},
	}

	sort := bson.D{{Key: "reverse_review.next_due_date", Value: 1}}

	var card models.Card
	err := cardRepository.collection.FindOne(
		context.Background(),
		filter,
		options.FindOne().SetSort(sort),
	).Decode(&card)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &card, nil
}

func (cardRepository *CardRepository) GetBoxCardsToReverseReview(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	currentTime := time.Now()

	// Use aggregation pipeline to include labels lookup
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"box_id":         box.ID,
			"reverse_review": bson.M{"$ne": nil},
			"reverse_review.next_due_date": bson.M{
				"$ne":  nil,
				"$lte": currentTime,
			},
		}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "labels",
			"localField":   "label_ids",
			"foreignField": "_id",
			"as":           "labels",
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "reverse_review.next_due_date", Value: 1}}}},
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}
	return cards, nil
}

func (cardRepository *CardRepository) GetCountOfRemainingCardsForReverseReview(ctx context.Context, box *models.Box) (*int64, error) {
	currentTime := time.Now()

	filter := bson.M{
		"box_id":         box.ID,
		"reverse_review": bson.M{"$ne": nil},
		"reverse_review.next_due_date": bson.M{
			"$ne":  nil,
			"$lte": currentTime,
		},
	}

	count, err := cardRepository.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return nil, err
	}

	return &count, nil
}

func (repository *CardRepository) GetCountOfNeedingReverseReviewCount(ctx context.Context, box *models.Box) (*int64, error) {
	filter := bson.M{
		"box_id":         box.ID,
		"reverse_review": bson.M{"$ne": nil},
		"reverse_review.next_due_date": bson.M{
			"$ne": nil,
		},
	}

	count, err := repository.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return nil, err
	}

	return &count, nil
}

func (cardRepository *CardRepository) UpdateCardReverseReview(
	ctx context.Context,
	card *models.Card,
	nextReviewDate *time.Time,
	interval int,
	easeFactor float64,
	reviewRecord *models.ReviewHistoryRecord,
) error {
	update := bson.M{
		"$set": bson.M{
			"reverse_review.next_due_date": nextReviewDate,
			"reverse_review.interval":      interval,
			"reverse_review.ease_factor":   easeFactor,
			"reverse_review.reviews_count": card.ReverseReview.ReviewsCount + 1,
		},
		"$push": bson.M{
			"reverse_review.review_history": reviewRecord,
		},
		"$setOnInsert": bson.M{
			"reverse_review.last_review_date": time.Now(),
		},
		"$currentDate": bson.M{
			"updated_at": true,
		},
	}
	filter := bson.M{"_id": card.ID}
	_, err := cardRepository.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (cardRepository *CardRepository) SetReverseArchived(ctx context.Context, cardID string) error {
	objectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{
		"$set": bson.M{
			"reverse_review.next_due_date": nil,
		},
	}
	_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

// Card Migration Methods

func (cardRepository *CardRepository) MigrateCard(ctx context.Context, cardID string, targetBoxID string, preserveProgress bool) error {
	cardObjectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	targetBoxObjectId, err := models.StringToObjectID(targetBoxID)
	if err != nil {
		return err
	}

	// Check if card exists and get current data
	var card models.Card
	err = cardRepository.collection.FindOne(ctx, bson.M{"_id": cardObjectId}).Decode(&card)
	if err != nil {
		return err
	}

	// Check for duplicate content in target box
	duplicateFilter := bson.M{
		"box_id": targetBoxObjectId,
		"front":  card.Front,
		"back":   card.Back,
	}

	var existingCard models.Card
	err = cardRepository.collection.FindOne(ctx, duplicateFilter).Decode(&existingCard)
	if err == nil {
		// Duplicate found
		return fmt.Errorf("duplicate card found in target box")
	}

	// Prepare update data
	updateData := bson.M{
		"box_id":     targetBoxObjectId,
		"updated_at": time.Now(),
	}

	// Reset progress if not preserving
	if !preserveProgress {
		nextDueDate := time.Now().Add(24 * time.Hour)
		reverseNextDueDate := time.Now().Add(24 * time.Hour)
		defaultInterval := models.DefaultInteval
		defaultEaseFactor := models.DefaultEaseFactor

		updateData["review"] = models.Review{
			LastReviewDate: nil,
			NextDueDate:    &nextDueDate,
			Interval:       defaultInterval,
			EaseFactor:     defaultEaseFactor,
			ReviewsCount:   0,
			ReviewHistory:  []models.ReviewHistoryRecord{},
		}
		updateData["reverse_review"] = models.Review{
			LastReviewDate: nil,
			NextDueDate:    &reverseNextDueDate,
			Interval:       defaultInterval,
			EaseFactor:     defaultEaseFactor,
			ReviewsCount:   0,
			ReviewHistory:  []models.ReviewHistoryRecord{},
		}
	}

	// Perform the migration
	filter := bson.M{"_id": cardObjectId}
	update := bson.M{"$set": updateData}

	_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
	return err
}

func (cardRepository *CardRepository) BulkMigrateCards(ctx context.Context, cardIDs []string, targetBoxID string, preserveProgress bool) ([]string, []string, error) {
	var successfulMigrations []string
	var failedMigrations []string

	targetBoxObjectId, err := models.StringToObjectID(targetBoxID)
	if err != nil {
		return nil, nil, err
	}

	for _, cardID := range cardIDs {
		cardObjectId, err := models.StringToObjectID(cardID)
		if err != nil {
			failedMigrations = append(failedMigrations, cardID)
			continue
		}

		// Check if card exists
		var card models.Card
		err = cardRepository.collection.FindOne(ctx, bson.M{"_id": cardObjectId}).Decode(&card)
		if err != nil {
			failedMigrations = append(failedMigrations, cardID)
			continue
		}

		// Check for duplicates
		duplicateFilter := bson.M{
			"box_id": targetBoxObjectId,
			"front":  card.Front,
			"back":   card.Back,
		}

		var existingCard models.Card
		err = cardRepository.collection.FindOne(ctx, duplicateFilter).Decode(&existingCard)
		if err == nil {
			// Duplicate found, skip this card
			failedMigrations = append(failedMigrations, cardID)
			continue
		}

		// Prepare update data
		updateData := bson.M{
			"box_id":     targetBoxObjectId,
			"updated_at": time.Now(),
		}

		// Reset progress if not preserving
		if !preserveProgress {
			nextDueDate := time.Now().Add(24 * time.Hour)
			reverseNextDueDate := time.Now().Add(24 * time.Hour)
			defaultInterval := models.DefaultInteval
			defaultEaseFactor := models.DefaultEaseFactor

			updateData["review"] = models.Review{
				LastReviewDate: nil,
				NextDueDate:    &nextDueDate,
				Interval:       defaultInterval,
				EaseFactor:     defaultEaseFactor,
				ReviewsCount:   0,
				ReviewHistory:  []models.ReviewHistoryRecord{},
			}
			updateData["reverse_review"] = models.Review{
				LastReviewDate: nil,
				NextDueDate:    &reverseNextDueDate,
				Interval:       defaultInterval,
				EaseFactor:     defaultEaseFactor,
				ReviewsCount:   0,
				ReviewHistory:  []models.ReviewHistoryRecord{},
			}
		}

		// Perform the migration
		filter := bson.M{"_id": cardObjectId}
		update := bson.M{"$set": updateData}

		_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
		if err != nil {
			failedMigrations = append(failedMigrations, cardID)
		} else {
			successfulMigrations = append(successfulMigrations, cardID)
		}
	}

	return successfulMigrations, failedMigrations, nil
}

func (cardRepository *CardRepository) ValidateCardOwnership(ctx context.Context, cardID string, userID primitive.ObjectID) error {
	cardObjectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": cardObjectId}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "boxes",
			"localField":   "box_id",
			"foreignField": "_id",
			"as":           "box",
		}}},
		{{Key: "$unwind", Value: "$box"}},
		{{Key: "$match", Value: bson.M{"box.user_id": userID}}},
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	if !cursor.Next(ctx) {
		return fmt.Errorf("card not found or user does not have access")
	}

	return nil
}

func (cardRepository *CardRepository) CheckDuplicateInBox(ctx context.Context, boxID string, front string, back string) (bool, error) {
	boxObjectId, err := models.StringToObjectID(boxID)
	if err != nil {
		return false, err
	}

	filter := bson.M{
		"box_id": boxObjectId,
		"front":  front,
		"back":   back,
	}

	count, err := cardRepository.collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// Progress Reset Methods

// ResetCardProgress resets the learning progress for a single card
func (cardRepository *CardRepository) ResetCardProgress(ctx context.Context, cardID string, resetLevel string) error {
	objectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	// Prepare reset data
	nextDueDate := time.Now().Add(24 * time.Hour)
	defaultInterval := models.DefaultInteval
	defaultEaseFactor := models.DefaultEaseFactor

	resetReview := models.Review{
		LastReviewDate: nil,
		NextDueDate:    &nextDueDate,
		Interval:       defaultInterval,
		EaseFactor:     defaultEaseFactor,
		ReviewsCount:   0,
		ReviewHistory:  []models.ReviewHistoryRecord{},
	}

	updateData := bson.M{
		"updated_at": time.Now(),
	}

	// Apply reset based on level
	switch resetLevel {
	case "review":
		updateData["review"] = resetReview
	case "reverse_review":
		updateData["reverse_review"] = resetReview
	case "both":
		updateData["review"] = resetReview
		updateData["reverse_review"] = resetReview
	default:
		return fmt.Errorf("invalid reset level: %s", resetLevel)
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{"$set": updateData}

	_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
	return err
}

// ResetBoxProgress resets the learning progress for all cards in a box
func (cardRepository *CardRepository) ResetBoxProgress(ctx context.Context, boxID string, resetLevel string) (int64, error) {
	boxObjectId, err := models.StringToObjectID(boxID)
	if err != nil {
		return 0, err
	}

	// Prepare reset data
	nextDueDate := time.Now().Add(24 * time.Hour)
	defaultInterval := models.DefaultInteval
	defaultEaseFactor := models.DefaultEaseFactor

	resetReview := models.Review{
		LastReviewDate: nil,
		NextDueDate:    &nextDueDate,
		Interval:       defaultInterval,
		EaseFactor:     defaultEaseFactor,
		ReviewsCount:   0,
		ReviewHistory:  []models.ReviewHistoryRecord{},
	}

	updateData := bson.M{
		"updated_at": time.Now(),
	}

	// Apply reset based on level
	switch resetLevel {
	case "review":
		updateData["review"] = resetReview
	case "reverse_review":
		updateData["reverse_review"] = resetReview
	case "both":
		updateData["review"] = resetReview
		updateData["reverse_review"] = resetReview
	default:
		return 0, fmt.Errorf("invalid reset level: %s", resetLevel)
	}

	filter := bson.M{"box_id": boxObjectId}
	update := bson.M{"$set": updateData}

	result, err := cardRepository.collection.UpdateMany(ctx, filter, update)
	if err != nil {
		return 0, err
	}

	return result.ModifiedCount, nil
}

// BulkResetCardsProgress resets progress for multiple specific cards
func (cardRepository *CardRepository) BulkResetCardsProgress(ctx context.Context, cardIDs []string, resetLevel string) ([]string, []string, error) {
	var successfulResets []string
	var failedResets []string

	// Prepare reset data
	nextDueDate := time.Now().Add(24 * time.Hour)
	defaultInterval := models.DefaultInteval
	defaultEaseFactor := models.DefaultEaseFactor

	resetReview := models.Review{
		LastReviewDate: nil,
		NextDueDate:    &nextDueDate,
		Interval:       defaultInterval,
		EaseFactor:     defaultEaseFactor,
		ReviewsCount:   0,
		ReviewHistory:  []models.ReviewHistoryRecord{},
	}

	updateData := bson.M{
		"updated_at": time.Now(),
	}

	// Apply reset based on level
	switch resetLevel {
	case "review":
		updateData["review"] = resetReview
	case "reverse_review":
		updateData["reverse_review"] = resetReview
	case "both":
		updateData["review"] = resetReview
		updateData["reverse_review"] = resetReview
	default:
		return nil, nil, fmt.Errorf("invalid reset level: %s", resetLevel)
	}

	// Process each card individually
	for _, cardID := range cardIDs {
		objectId, err := models.StringToObjectID(cardID)
		if err != nil {
			failedResets = append(failedResets, cardID)
			continue
		}

		filter := bson.M{"_id": objectId}
		update := bson.M{"$set": updateData}

		result, err := cardRepository.collection.UpdateOne(ctx, filter, update)
		if err != nil || result.ModifiedCount == 0 {
			failedResets = append(failedResets, cardID)
		} else {
			successfulResets = append(successfulResets, cardID)
		}
	}

	return successfulResets, failedResets, nil
}

// GetCardsForBackup retrieves cards with full progress data for backup purposes
func (cardRepository *CardRepository) GetCardsForBackup(ctx context.Context, cardIDs []string) ([]*models.Card, error) {
	var objectIds []primitive.ObjectID
	for _, cardID := range cardIDs {
		objectId, err := models.StringToObjectID(cardID)
		if err != nil {
			continue // Skip invalid IDs
		}
		objectIds = append(objectIds, objectId)
	}

	if len(objectIds) == 0 {
		return []*models.Card{}, nil
	}

	filter := bson.M{"_id": bson.M{"$in": objectIds}}
	cursor, err := cardRepository.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}

	return cards, nil
}

// GetAllCardsInBox retrieves all cards in a box for backup purposes
func (cardRepository *CardRepository) GetAllCardsInBox(ctx context.Context, boxID string) ([]*models.Card, error) {
	boxObjectId, err := models.StringToObjectID(boxID)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"box_id": boxObjectId}
	cursor, err := cardRepository.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}

	return cards, nil
}

// RestoreCardProgress restores progress for a single card from backup
func (cardRepository *CardRepository) RestoreCardProgress(ctx context.Context, cardBackup *models.CardProgressBackup) error {
	filter := bson.M{"_id": cardBackup.CardID}
	update := bson.M{
		"$set": bson.M{
			"review":         cardBackup.Review,
			"reverse_review": cardBackup.ReverseReview,
			"updated_at":     time.Now(),
		},
	}

	_, err := cardRepository.collection.UpdateOne(ctx, filter, update)
	return err
}

// BulkRestoreCardsProgress restores progress for multiple cards from backup
func (cardRepository *CardRepository) BulkRestoreCardsProgress(ctx context.Context, cardBackups []models.CardProgressBackup) ([]string, []string, error) {
	var successfulRestores []string
	var failedRestores []string

	for _, cardBackup := range cardBackups {
		err := cardRepository.RestoreCardProgress(ctx, &cardBackup)
		if err != nil {
			failedRestores = append(failedRestores, cardBackup.CardID.Hex())
		} else {
			successfulRestores = append(successfulRestores, cardBackup.CardID.Hex())
		}
	}

	return successfulRestores, failedRestores, nil
}

// BoxStats represents aggregated statistics for a box
type BoxStats struct {
	BoxID                     primitive.ObjectID `bson:"_id"`
	TotalCards                int64              `bson:"totalCards"`
	CardsDueToday             int64              `bson:"cardsDueToday"`
	CardsNeedingReview        int64              `bson:"cardsNeedingReview"`
	CardsDueTodayReverse      int64              `bson:"cardsDueTodayReverse"`
	CardsNeedingReverseReview int64              `bson:"cardsNeedingReverseReview"`
}

// GetBoxesStatistics returns aggregated statistics for multiple boxes in a single query
func (cardRepository *CardRepository) GetBoxesStatistics(ctx context.Context, boxIDs []primitive.ObjectID) (map[primitive.ObjectID]*BoxStats, error) {
	currentTime := time.Now()

	// Create aggregation pipeline
	pipeline := mongo.Pipeline{
		// Match cards from the specified boxes
		{{Key: "$match", Value: bson.M{"box_id": bson.M{"$in": boxIDs}}}},

		// Group by box_id and calculate all statistics
		{{Key: "$group", Value: bson.M{
			"_id":        "$box_id",
			"totalCards": bson.M{"$sum": 1},
			"cardsDueToday": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if": bson.M{
							"$and": []bson.M{
								{"$ne": []interface{}{"$review", nil}},
								{"$ne": []interface{}{"$review.next_due_date", nil}},
								{"$lte": []interface{}{"$review.next_due_date", currentTime}},
							},
						},
						"then": 1,
						"else": 0,
					},
				},
			},
			"cardsNeedingReview": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if": bson.M{
							"$and": []bson.M{
								{"$ne": []interface{}{"$review", nil}},
								{"$ne": []interface{}{"$review.next_due_date", nil}},
							},
						},
						"then": 1,
						"else": 0,
					},
				},
			},
			"cardsDueTodayReverse": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if": bson.M{
							"$and": []bson.M{
								{"$ne": []interface{}{"$reverse_review", nil}},
								{"$ne": []interface{}{"$reverse_review.next_due_date", nil}},
								{"$lte": []interface{}{"$reverse_review.next_due_date", currentTime}},
							},
						},
						"then": 1,
						"else": 0,
					},
				},
			},
			"cardsNeedingReverseReview": bson.M{
				"$sum": bson.M{
					"$cond": bson.M{
						"if": bson.M{
							"$and": []bson.M{
								{"$ne": []interface{}{"$reverse_review", nil}},
								{"$ne": []interface{}{"$reverse_review.next_due_date", nil}},
							},
						},
						"then": 1,
						"else": 0,
					},
				},
			},
		}}},
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	statsMap := make(map[primitive.ObjectID]*BoxStats)

	// Initialize all boxes with zero stats
	for _, boxID := range boxIDs {
		statsMap[boxID] = &BoxStats{
			BoxID: boxID,
		}
	}

	// Process aggregation results
	for cursor.Next(ctx) {
		var stats BoxStats
		if err := cursor.Decode(&stats); err != nil {
			return nil, err
		}
		statsMap[stats.BoxID] = &stats
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return statsMap, nil
}

// New feature methods

func (cardRepository *CardRepository) ToggleBookmark(ctx context.Context, cardID string) error {
	objectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	// First get the current bookmark status
	var card models.Card
	err = cardRepository.collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&card)
	if err != nil {
		return err
	}

	// Toggle the bookmark status
	newBookmarkStatus := !card.IsBookmarked

	filter := bson.M{"_id": objectId}
	update := bson.M{
		"$set": bson.M{
			"is_bookmarked": newBookmarkStatus,
			"updated_at":    time.Now(),
		},
	}

	_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
	return err
}

func (cardRepository *CardRepository) UpdateDifficulty(ctx context.Context, cardID string, difficulty string) error {
	objectId, err := models.StringToObjectID(cardID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{
		"$set": bson.M{
			"difficulty": difficulty,
			"updated_at": time.Now(),
		},
	}

	_, err = cardRepository.collection.UpdateOne(ctx, filter, update)
	return err
}

func (cardRepository *CardRepository) GetCustomReviewCards(ctx context.Context, user *models.User, request *requests.CustomReviewRequest) ([]*models.Card, error) {
	// Build the base filter for user's cards
	pipeline := mongo.Pipeline{
		// First, get all boxes belonging to the user
		{{Key: "$lookup", Value: bson.M{
			"from":         "boxes",
			"localField":   "box_id",
			"foreignField": "_id",
			"as":           "box",
		}}},
		{{Key: "$unwind", Value: "$box"}},
		{{Key: "$match", Value: bson.M{"box.user_id": user.ID}}},
	}

	// Add label lookup
	pipeline = append(pipeline, bson.D{
		{Key: "$lookup", Value: bson.M{
			"from":         "labels",
			"localField":   "label_ids",
			"foreignField": "_id",
			"as":           "labels",
		}},
	})

	// Build match conditions
	matchConditions := bson.M{}

	// Filter by specific box if provided
	if request.BoxID != "" {
		boxObjectId, err := models.StringToObjectID(request.BoxID)
		if err == nil {
			matchConditions["box_id"] = boxObjectId
		}
	}

	// Filter by labels if provided
	if len(request.LabelIds) > 0 {
		var labelObjectIds []primitive.ObjectID
		for _, labelId := range request.LabelIds {
			if objectId, err := models.StringToObjectID(labelId); err == nil {
				labelObjectIds = append(labelObjectIds, objectId)
			}
		}
		if len(labelObjectIds) > 0 {
			matchConditions["label_ids"] = bson.M{"$in": labelObjectIds}
		}
	}

	// Filter by bookmark status if provided
	if request.Bookmarked {
		matchConditions["is_bookmarked"] = true
	}

	// Filter by difficulty if provided
	if len(request.Difficulty) > 0 {
		matchConditions["difficulty"] = bson.M{"$in": request.Difficulty}
	}

	// Add match stage if we have conditions
	if len(matchConditions) > 0 {
		pipeline = append(pipeline, bson.D{{Key: "$match", Value: matchConditions}})
	}

	// Add shuffle if requested
	if request.Shuffle {
		pipeline = append(pipeline, bson.D{{Key: "$sample", Value: bson.M{"size": 1000}}})
	}

	// Add limit if provided
	if request.Limit > 0 {
		pipeline = append(pipeline, bson.D{{Key: "$limit", Value: request.Limit}})
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}

	return cards, nil
}
