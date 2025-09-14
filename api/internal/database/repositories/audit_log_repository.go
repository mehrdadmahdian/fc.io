package repositories

import (
	"context"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AuditLogRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewAuditLogRepository(mongoService *internal_mongo.MongoService) (*AuditLogRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("audit_logs")

	// Create indexes for better query performance
	indexModels := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "entity_id", Value: 1}, {Key: "created_at", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "action", Value: 1}, {Key: "created_at", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "created_at", Value: -1}},
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexModels)
	if err != nil {
		// Log error but don't fail - indexes are for performance
		// In production, you might want to handle this differently
	}

	return &AuditLogRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (repo *AuditLogRepository) Insert(ctx context.Context, auditLog *models.AuditLog) error {
	_, err := repo.collection.InsertOne(ctx, auditLog)
	return err
}

func (repo *AuditLogRepository) GetByUserID(ctx context.Context, userID primitive.ObjectID, limit int, offset int) ([]*models.AuditLog, error) {
	filter := bson.M{"user_id": userID}
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var auditLogs []*models.AuditLog
	if err := cursor.All(ctx, &auditLogs); err != nil {
		return nil, err
	}

	return auditLogs, nil
}

func (repo *AuditLogRepository) GetByEntityID(ctx context.Context, entityID primitive.ObjectID, limit int, offset int) ([]*models.AuditLog, error) {
	filter := bson.M{"entity_id": entityID}
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var auditLogs []*models.AuditLog
	if err := cursor.All(ctx, &auditLogs); err != nil {
		return nil, err
	}

	return auditLogs, nil
}

func (repo *AuditLogRepository) GetByAction(ctx context.Context, action models.AuditLogAction, limit int, offset int) ([]*models.AuditLog, error) {
	filter := bson.M{"action": action}
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var auditLogs []*models.AuditLog
	if err := cursor.All(ctx, &auditLogs); err != nil {
		return nil, err
	}

	return auditLogs, nil
}

func (repo *AuditLogRepository) GetByDateRange(ctx context.Context, userID primitive.ObjectID, startDate, endDate time.Time, limit int, offset int) ([]*models.AuditLog, error) {
	filter := bson.M{
		"user_id": userID,
		"created_at": bson.M{
			"$gte": startDate,
			"$lte": endDate,
		},
	}
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var auditLogs []*models.AuditLog
	if err := cursor.All(ctx, &auditLogs); err != nil {
		return nil, err
	}

	return auditLogs, nil
}

func (repo *AuditLogRepository) CountByUserID(ctx context.Context, userID primitive.ObjectID) (int64, error) {
	filter := bson.M{"user_id": userID}
	return repo.collection.CountDocuments(ctx, filter)
}

func (repo *AuditLogRepository) DeleteOldLogs(ctx context.Context, olderThan time.Time) (int64, error) {
	filter := bson.M{
		"created_at": bson.M{
			"$lt": olderThan,
		},
	}
	result, err := repo.collection.DeleteMany(ctx, filter)
	if err != nil {
		return 0, err
	}
	return result.DeletedCount, nil
}
