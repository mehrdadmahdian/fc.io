package repositories

import (
	"context"
	"errors"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BoxForkRepository struct {
	collection *mongo.Collection
}

func NewBoxForkRepository(database *mongo.Database) *BoxForkRepository {
	return &BoxForkRepository{
		collection: database.Collection("box_forks"),
	}
}

// CreateFork creates a new fork relationship
func (r *BoxForkRepository) CreateFork(originalBoxID, forkedBoxID, forkedByUserID, originalOwnerID primitive.ObjectID, description string) (*models.BoxFork, error) {
	fork := models.NewBoxFork(originalBoxID, forkedBoxID, forkedByUserID, originalOwnerID, description)

	_, err := r.collection.InsertOne(context.Background(), fork)
	if err != nil {
		return nil, err
	}

	return fork, nil
}

// GetForksByOriginalBox returns all forks of a specific box
func (r *BoxForkRepository) GetForksByOriginalBox(originalBoxID primitive.ObjectID, limit, skip int) ([]*models.BoxFork, error) {
	filter := bson.M{"original_box_id": originalBoxID}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var forks []*models.BoxFork
	if err = cursor.All(context.Background(), &forks); err != nil {
		return nil, err
	}

	return forks, nil
}

// GetForksByUser returns all forks created by a specific user
func (r *BoxForkRepository) GetForksByUser(userID primitive.ObjectID, limit, skip int) ([]*models.BoxFork, error) {
	filter := bson.M{"forked_by_user_id": userID}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var forks []*models.BoxFork
	if err = cursor.All(context.Background(), &forks); err != nil {
		return nil, err
	}

	return forks, nil
}

// GetForkByForkedBox returns the fork information for a forked box
func (r *BoxForkRepository) GetForkByForkedBox(forkedBoxID primitive.ObjectID) (*models.BoxFork, error) {
	filter := bson.M{"forked_box_id": forkedBoxID}

	var fork models.BoxFork
	err := r.collection.FindOne(context.Background(), filter).Decode(&fork)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &fork, nil
}

// GetForkCount returns the number of forks for a specific box
func (r *BoxForkRepository) GetForkCount(originalBoxID primitive.ObjectID) (int64, error) {
	filter := bson.M{"original_box_id": originalBoxID}
	return r.collection.CountDocuments(context.Background(), filter)
}

// HasUserForkedBox checks if a user has already forked a specific box
func (r *BoxForkRepository) HasUserForkedBox(userID, originalBoxID primitive.ObjectID) (bool, error) {
	filter := bson.M{
		"forked_by_user_id": userID,
		"original_box_id":   originalBoxID,
	}

	count, err := r.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetForkChain returns the fork chain for a box (original -> fork -> fork of fork, etc.)
func (r *BoxForkRepository) GetForkChain(boxID primitive.ObjectID) ([]*models.BoxFork, error) {
	var chain []*models.BoxFork
	currentBoxID := boxID

	// First, find if this box is a fork
	fork, err := r.GetForkByForkedBox(currentBoxID)
	if err != nil {
		return nil, err
	}

	// If it's a fork, trace back to the original
	for fork != nil {
		chain = append([]*models.BoxFork{fork}, chain...) // Prepend to maintain order
		currentBoxID = fork.OriginalBoxID
		fork, err = r.GetForkByForkedBox(currentBoxID)
		if err != nil {
			return nil, err
		}
	}

	return chain, nil
}

// GetPopularForks returns the most forked boxes
func (r *BoxForkRepository) GetPopularForks(limit int) ([]bson.M, error) {
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":   "$original_box_id",
				"count": bson.M{"$sum": 1},
			},
		},
		{
			"$sort": bson.M{"count": -1},
		},
		{
			"$limit": limit,
		},
	}

	cursor, err := r.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var results []bson.M
	if err = cursor.All(context.Background(), &results); err != nil {
		return nil, err
	}

	return results, nil
}

// DeleteFork removes a fork relationship (used when a forked box is deleted)
func (r *BoxForkRepository) DeleteFork(forkID primitive.ObjectID) error {
	filter := bson.M{"_id": forkID}

	result, err := r.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("fork not found")
	}

	return nil
}
