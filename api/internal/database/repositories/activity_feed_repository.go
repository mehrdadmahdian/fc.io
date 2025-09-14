package repositories

import (
	"context"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ActivityFeedRepository struct {
	collection *mongo.Collection
}

func NewActivityFeedRepository(database *mongo.Database) *ActivityFeedRepository {
	return &ActivityFeedRepository{
		collection: database.Collection("activity_feeds"),
	}
}

// CreateActivity creates a new activity in the feed
func (r *ActivityFeedRepository) CreateActivity(userID primitive.ObjectID, activityType models.ActivityType, targetID primitive.ObjectID, targetType string, metadata map[string]interface{}, isPublic bool) (*models.ActivityFeed, error) {
	activity := models.NewActivityFeed(userID, activityType, targetID, targetType, metadata, isPublic)

	_, err := r.collection.InsertOne(context.Background(), activity)
	if err != nil {
		return nil, err
	}

	return activity, nil
}

// GetUserFeed returns the personalized feed for a user (activities from users they follow)
func (r *ActivityFeedRepository) GetUserFeed(userID primitive.ObjectID, followingIDs []primitive.ObjectID, limit, skip int) ([]*models.ActivityFeed, error) {
	// Include the user's own activities and activities from users they follow
	allUserIDs := append(followingIDs, userID)

	filter := bson.M{
		"user_id":   bson.M{"$in": allUserIDs},
		"is_public": true,
	}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var activities []*models.ActivityFeed
	if err = cursor.All(context.Background(), &activities); err != nil {
		return nil, err
	}

	return activities, nil
}

// GetPublicFeed returns the global public feed
func (r *ActivityFeedRepository) GetPublicFeed(limit, skip int) ([]*models.ActivityFeed, error) {
	filter := bson.M{"is_public": true}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var activities []*models.ActivityFeed
	if err = cursor.All(context.Background(), &activities); err != nil {
		return nil, err
	}

	return activities, nil
}

// GetUserActivities returns all activities by a specific user
func (r *ActivityFeedRepository) GetUserActivities(userID primitive.ObjectID, includePrivate bool, limit, skip int) ([]*models.ActivityFeed, error) {
	filter := bson.M{"user_id": userID}

	if !includePrivate {
		filter["is_public"] = true
	}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var activities []*models.ActivityFeed
	if err = cursor.All(context.Background(), &activities); err != nil {
		return nil, err
	}

	return activities, nil
}

// GetActivitiesByType returns activities of a specific type
func (r *ActivityFeedRepository) GetActivitiesByType(activityType models.ActivityType, limit, skip int) ([]*models.ActivityFeed, error) {
	filter := bson.M{
		"activity_type": activityType,
		"is_public":     true,
	}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var activities []*models.ActivityFeed
	if err = cursor.All(context.Background(), &activities); err != nil {
		return nil, err
	}

	return activities, nil
}

// GetActivitiesForTarget returns activities related to a specific target (e.g., all activities for a box)
func (r *ActivityFeedRepository) GetActivitiesForTarget(targetID primitive.ObjectID, targetType string, limit, skip int) ([]*models.ActivityFeed, error) {
	filter := bson.M{
		"target_id":   targetID,
		"target_type": targetType,
		"is_public":   true,
	}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var activities []*models.ActivityFeed
	if err = cursor.All(context.Background(), &activities); err != nil {
		return nil, err
	}

	return activities, nil
}

// GetTrendingActivities returns trending activities based on recent engagement
func (r *ActivityFeedRepository) GetTrendingActivities(since time.Time, limit int) ([]*models.ActivityFeed, error) {
	filter := bson.M{
		"is_public":  true,
		"created_at": bson.M{"$gte": since},
	}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var activities []*models.ActivityFeed
	if err = cursor.All(context.Background(), &activities); err != nil {
		return nil, err
	}

	return activities, nil
}

// DeleteActivity removes an activity from the feed
func (r *ActivityFeedRepository) DeleteActivity(activityID primitive.ObjectID) error {
	filter := bson.M{"_id": activityID}

	_, err := r.collection.DeleteOne(context.Background(), filter)
	return err
}

// DeleteActivitiesForTarget removes all activities related to a specific target
func (r *ActivityFeedRepository) DeleteActivitiesForTarget(targetID primitive.ObjectID, targetType string) error {
	filter := bson.M{
		"target_id":   targetID,
		"target_type": targetType,
	}

	_, err := r.collection.DeleteMany(context.Background(), filter)
	return err
}

// DeleteUserActivities removes all activities by a specific user
func (r *ActivityFeedRepository) DeleteUserActivities(userID primitive.ObjectID) error {
	filter := bson.M{"user_id": userID}

	_, err := r.collection.DeleteMany(context.Background(), filter)
	return err
}

// GetActivityStats returns statistics about activities
func (r *ActivityFeedRepository) GetActivityStats(since time.Time) (map[string]interface{}, error) {
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"created_at": bson.M{"$gte": since},
				"is_public":  true,
			},
		},
		{
			"$group": bson.M{
				"_id":   "$activity_type",
				"count": bson.M{"$sum": 1},
			},
		},
		{
			"$group": bson.M{
				"_id":              nil,
				"total_activities": bson.M{"$sum": "$count"},
				"activity_breakdown": bson.M{
					"$push": bson.M{
						"type":  "$_id",
						"count": "$count",
					},
				},
			},
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

	if len(results) == 0 {
		return map[string]interface{}{
			"total_activities":   0,
			"activity_breakdown": []interface{}{},
		}, nil
	}

	return results[0], nil
}
