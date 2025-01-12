package repositories

import (
	"context"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
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

	sort := bson.D{{"review.next_due_date", 1}}

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

func (cardRepository *CardRepository) GetBoxCardsToReview(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	currentTime := time.Now()

	filter := bson.M{
		"box_id": box.ID,
		"review": bson.M{"$ne": nil},
		"review.next_due_date": bson.M{
			"$ne":  nil,
			"$lte": currentTime,
		},
	}

	sort := bson.D{{"review.next_due_date", 1}}

	cursor, err := cardRepository.collection.Find(
		context.Background(),
		filter,
		options.Find().SetSort(sort),
	)
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
			"review.next_due_date": nil,
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
