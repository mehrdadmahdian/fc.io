package repositories

import (
	"context"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ProgressResetRepository struct {
	collection *mongo.Collection
}

func NewProgressResetRepository(mongoService *mongo_service.MongoService) (*ProgressResetRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("progress_reset_logs")

	// Create indexes
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "user_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "timestamp", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "action_type", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "box_id", Value: 1}},
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		return nil, err
	}

	return &ProgressResetRepository{
		collection: collection,
	}, nil
}

// Log a reset operation
func (repo *ProgressResetRepository) LogReset(ctx context.Context, resetLog *models.ProgressResetLog) error {
	_, err := repo.collection.InsertOne(ctx, resetLog)
	return err
}

// Get reset history for a user
func (repo *ProgressResetRepository) GetResetHistory(ctx context.Context, userID primitive.ObjectID, limit int, offset int) ([]*models.ProgressResetLog, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "timestamp", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := repo.collection.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*models.ProgressResetLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// Get reset history by action type
func (repo *ProgressResetRepository) GetResetHistoryByType(ctx context.Context, userID primitive.ObjectID, actionType string, limit int) ([]*models.ProgressResetLog, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "timestamp", Value: -1}}).
		SetLimit(int64(limit))

	filter := bson.M{
		"user_id":     userID,
		"action_type": actionType,
	}

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*models.ProgressResetLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// Get reset history for a specific box
func (repo *ProgressResetRepository) GetResetHistoryForBox(ctx context.Context, userID primitive.ObjectID, boxID primitive.ObjectID, limit int) ([]*models.ProgressResetLog, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "timestamp", Value: -1}}).
		SetLimit(int64(limit))

	filter := bson.M{
		"user_id": userID,
		"box_id":  boxID,
	}

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*models.ProgressResetLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// Get reset history for a specific card
func (repo *ProgressResetRepository) GetResetHistoryForCard(ctx context.Context, userID primitive.ObjectID, cardID primitive.ObjectID, limit int) ([]*models.ProgressResetLog, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "timestamp", Value: -1}}).
		SetLimit(int64(limit))

	filter := bson.M{
		"user_id":  userID,
		"card_ids": bson.M{"$in": []primitive.ObjectID{cardID}},
	}

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*models.ProgressResetLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// Get reset statistics for a user
func (repo *ProgressResetRepository) GetResetStats(ctx context.Context, userID primitive.ObjectID) (*ResetStats, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userID}},
		{"$group": bson.M{
			"_id":         "$action_type",
			"count":       bson.M{"$sum": 1},
			"total_cards": bson.M{"$sum": "$total_cards"},
			"latest":      bson.M{"$max": "$timestamp"},
		}},
	}

	cursor, err := repo.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	stats := &ResetStats{
		TotalResets: 0,
		TotalCards:  0,
		ByType:      make(map[string]ResetTypeStat),
	}

	for cursor.Next(ctx) {
		var result struct {
			ID         string    `bson:"_id"`
			Count      int       `bson:"count"`
			TotalCards int       `bson:"total_cards"`
			Latest     time.Time `bson:"latest"`
		}

		if err := cursor.Decode(&result); err != nil {
			continue
		}

		stats.TotalResets += result.Count
		stats.TotalCards += result.TotalCards
		stats.ByType[result.ID] = ResetTypeStat{
			Count:      result.Count,
			TotalCards: result.TotalCards,
			Latest:     result.Latest,
		}
	}

	return stats, nil
}

// Delete old reset logs (cleanup)
func (repo *ProgressResetRepository) DeleteOldLogs(ctx context.Context, olderThan time.Time) (int64, error) {
	filter := bson.M{
		"timestamp": bson.M{"$lt": olderThan},
	}

	result, err := repo.collection.DeleteMany(ctx, filter)
	if err != nil {
		return 0, err
	}

	return result.DeletedCount, nil
}

// ResetStats represents reset operation statistics
type ResetStats struct {
	TotalResets int                      `json:"total_resets"`
	TotalCards  int                      `json:"total_cards"`
	ByType      map[string]ResetTypeStat `json:"by_type"`
}

type ResetTypeStat struct {
	Count      int       `json:"count"`
	TotalCards int       `json:"total_cards"`
	Latest     time.Time `json:"latest"`
}
