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

type UserFollowingRepository struct {
	collection *mongo.Collection
}

func NewUserFollowingRepository(database *mongo.Database) *UserFollowingRepository {
	return &UserFollowingRepository{
		collection: database.Collection("user_followings"),
	}
}

// FollowUser creates a follow relationship
func (r *UserFollowingRepository) FollowUser(followerID, followingID primitive.ObjectID) (*models.UserFollowing, error) {
	// Check if already following
	existing, err := r.IsFollowing(followerID, followingID)
	if err != nil {
		return nil, err
	}
	if existing {
		return nil, errors.New("already following this user")
	}

	// Prevent self-following
	if followerID == followingID {
		return nil, errors.New("cannot follow yourself")
	}

	following := models.NewUserFollowing(followerID, followingID)

	_, err = r.collection.InsertOne(context.Background(), following)
	if err != nil {
		return nil, err
	}

	return following, nil
}

// UnfollowUser removes a follow relationship
func (r *UserFollowingRepository) UnfollowUser(followerID, followingID primitive.ObjectID) error {
	filter := bson.M{
		"follower_id":  followerID,
		"following_id": followingID,
	}

	result, err := r.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("follow relationship not found")
	}

	return nil
}

// IsFollowing checks if follower is following the user
func (r *UserFollowingRepository) IsFollowing(followerID, followingID primitive.ObjectID) (bool, error) {
	filter := bson.M{
		"follower_id":  followerID,
		"following_id": followingID,
	}

	count, err := r.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetFollowers returns users who follow the given user
func (r *UserFollowingRepository) GetFollowers(userID primitive.ObjectID, limit, skip int) ([]*models.UserFollowing, error) {
	filter := bson.M{"following_id": userID}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var followers []*models.UserFollowing
	if err = cursor.All(context.Background(), &followers); err != nil {
		return nil, err
	}

	return followers, nil
}

// GetFollowing returns users that the given user follows
func (r *UserFollowingRepository) GetFollowing(userID primitive.ObjectID, limit, skip int) ([]*models.UserFollowing, error) {
	filter := bson.M{"follower_id": userID}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var following []*models.UserFollowing
	if err = cursor.All(context.Background(), &following); err != nil {
		return nil, err
	}

	return following, nil
}

// GetFollowerCount returns the number of followers for a user
func (r *UserFollowingRepository) GetFollowerCount(userID primitive.ObjectID) (int64, error) {
	filter := bson.M{"following_id": userID}
	return r.collection.CountDocuments(context.Background(), filter)
}

// GetFollowingCount returns the number of users that the given user follows
func (r *UserFollowingRepository) GetFollowingCount(userID primitive.ObjectID) (int64, error) {
	filter := bson.M{"follower_id": userID}
	return r.collection.CountDocuments(context.Background(), filter)
}

// GetMutualFollows returns users that both users follow
func (r *UserFollowingRepository) GetMutualFollows(userID1, userID2 primitive.ObjectID, limit int) ([]*models.UserFollowing, error) {
	// Find users that userID1 follows
	following1, err := r.GetFollowing(userID1, 1000, 0) // Get a large set
	if err != nil {
		return nil, err
	}

	// Extract the IDs of users that userID1 follows
	followingIDs := make([]primitive.ObjectID, len(following1))
	for i, f := range following1 {
		followingIDs[i] = f.FollowingID
	}

	// Find users that userID2 follows and are in the followingIDs list
	filter := bson.M{
		"follower_id":  userID2,
		"following_id": bson.M{"$in": followingIDs},
	}

	opts := options.Find().SetLimit(int64(limit))
	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var mutualFollows []*models.UserFollowing
	if err = cursor.All(context.Background(), &mutualFollows); err != nil {
		return nil, err
	}

	return mutualFollows, nil
}
