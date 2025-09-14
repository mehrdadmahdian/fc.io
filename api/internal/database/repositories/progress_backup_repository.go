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

type ProgressBackupRepository struct {
	collection *mongo.Collection
}

func NewProgressBackupRepository(mongoService *mongo_service.MongoService) (*ProgressBackupRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("progress_backups")

	// Create indexes
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "user_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "created_at", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "expires_at", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "backup_type", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "box_id", Value: 1}},
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		return nil, err
	}

	return &ProgressBackupRepository{
		collection: collection,
	}, nil
}

// Create a new progress backup
func (repo *ProgressBackupRepository) CreateBackup(ctx context.Context, backup *models.ProgressBackup) error {
	_, err := repo.collection.InsertOne(ctx, backup)
	return err
}

// Get backup by ID
func (repo *ProgressBackupRepository) GetBackupByID(ctx context.Context, backupID string) (*models.ProgressBackup, error) {
	objectID, err := models.StringToObjectID(backupID)
	if err != nil {
		return nil, err
	}

	var backup models.ProgressBackup
	err = repo.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&backup)
	if err != nil {
		return nil, err
	}

	return &backup, nil
}

// Get all backups for a user
func (repo *ProgressBackupRepository) GetBackupsForUser(ctx context.Context, userID primitive.ObjectID, limit int, offset int) ([]*models.ProgressBackup, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := repo.collection.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var backups []*models.ProgressBackup
	if err := cursor.All(ctx, &backups); err != nil {
		return nil, err
	}

	return backups, nil
}

// Get backups by type for a user
func (repo *ProgressBackupRepository) GetBackupsByType(ctx context.Context, userID primitive.ObjectID, backupType string, limit int) ([]*models.ProgressBackup, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit))

	filter := bson.M{
		"user_id":     userID,
		"backup_type": backupType,
	}

	cursor, err := repo.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var backups []*models.ProgressBackup
	if err := cursor.All(ctx, &backups); err != nil {
		return nil, err
	}

	return backups, nil
}

// Get backups for a specific box
func (repo *ProgressBackupRepository) GetBackupsForBox(ctx context.Context, userID primitive.ObjectID, boxID primitive.ObjectID, limit int) ([]*models.ProgressBackup, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
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

	var backups []*models.ProgressBackup
	if err := cursor.All(ctx, &backups); err != nil {
		return nil, err
	}

	return backups, nil
}

// Mark backup as restored
func (repo *ProgressBackupRepository) MarkAsRestored(ctx context.Context, backupID string, restoredBy primitive.ObjectID) error {
	objectID, err := models.StringToObjectID(backupID)
	if err != nil {
		return err
	}

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"is_restored": true,
			"restored_at": now,
			"restored_by": restoredBy,
		},
	}

	_, err = repo.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

// Delete backup
func (repo *ProgressBackupRepository) DeleteBackup(ctx context.Context, backupID string) error {
	objectID, err := models.StringToObjectID(backupID)
	if err != nil {
		return err
	}

	_, err = repo.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}

// Delete expired backups
func (repo *ProgressBackupRepository) DeleteExpiredBackups(ctx context.Context) (int64, error) {
	now := time.Now()
	filter := bson.M{
		"expires_at": bson.M{"$lt": now},
	}

	result, err := repo.collection.DeleteMany(ctx, filter)
	if err != nil {
		return 0, err
	}

	return result.DeletedCount, nil
}

// Update backup description
func (repo *ProgressBackupRepository) UpdateDescription(ctx context.Context, backupID string, description string) error {
	objectID, err := models.StringToObjectID(backupID)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"description": description,
		},
	}

	_, err = repo.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

// Get backup statistics for a user
func (repo *ProgressBackupRepository) GetBackupStats(ctx context.Context, userID primitive.ObjectID) (*BackupStats, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userID}},
		{"$group": bson.M{
			"_id":         "$backup_type",
			"count":       bson.M{"$sum": 1},
			"total_cards": bson.M{"$sum": "$total_cards"},
			"latest":      bson.M{"$max": "$created_at"},
		}},
	}

	cursor, err := repo.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	stats := &BackupStats{
		TotalBackups: 0,
		TotalCards:   0,
		ByType:       make(map[string]BackupTypeStat),
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

		stats.TotalBackups += result.Count
		stats.TotalCards += result.TotalCards
		stats.ByType[result.ID] = BackupTypeStat{
			Count:      result.Count,
			TotalCards: result.TotalCards,
			Latest:     result.Latest,
		}
	}

	return stats, nil
}

// BackupStats represents backup statistics
type BackupStats struct {
	TotalBackups int                       `json:"total_backups"`
	TotalCards   int                       `json:"total_cards"`
	ByType       map[string]BackupTypeStat `json:"by_type"`
}

type BackupTypeStat struct {
	Count      int       `json:"count"`
	TotalCards int       `json:"total_cards"`
	Latest     time.Time `json:"latest"`
}

// Backup cards for a specific card
func (repo *ProgressBackupRepository) BackupCard(ctx context.Context, userID primitive.ObjectID, card *models.Card, reason string) (*models.ProgressBackup, error) {
	backup := models.NewProgressBackup(userID, "card", "Single card backup", reason)
	backup.AddCardBackup(card)

	err := repo.CreateBackup(ctx, backup)
	if err != nil {
		return nil, err
	}

	return backup, nil
}

// Backup cards for an entire box
func (repo *ProgressBackupRepository) BackupBox(ctx context.Context, userID primitive.ObjectID, boxID primitive.ObjectID, cards []*models.Card, reason string) (*models.ProgressBackup, error) {
	backup := models.NewProgressBackup(userID, "box", "Box backup", reason)
	backup.BoxID = &boxID

	for _, card := range cards {
		backup.AddCardBackup(card)
	}

	err := repo.CreateBackup(ctx, backup)
	if err != nil {
		return nil, err
	}

	return backup, nil
}

// Backup multiple cards (bulk operation)
func (repo *ProgressBackupRepository) BackupBulkCards(ctx context.Context, userID primitive.ObjectID, cards []*models.Card, reason string, description string) (*models.ProgressBackup, error) {
	backup := models.NewProgressBackup(userID, "bulk", description, reason)

	for _, card := range cards {
		backup.AddCardBackup(card)
	}

	err := repo.CreateBackup(ctx, backup)
	if err != nil {
		return nil, err
	}

	return backup, nil
}
