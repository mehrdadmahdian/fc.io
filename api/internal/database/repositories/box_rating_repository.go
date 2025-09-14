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

type BoxRatingRepository struct {
	collection *mongo.Collection
}

func NewBoxRatingRepository(database *mongo.Database) *BoxRatingRepository {
	return &BoxRatingRepository{
		collection: database.Collection("box_ratings"),
	}
}

// CreateOrUpdateRating creates a new rating or updates an existing one
func (r *BoxRatingRepository) CreateOrUpdateRating(boxID, userID primitive.ObjectID, rating int, review string) (*models.BoxRating, error) {
	// Validate rating
	if rating < 1 || rating > 5 {
		return nil, errors.New("rating must be between 1 and 5")
	}

	filter := bson.M{
		"box_id":  boxID,
		"user_id": userID,
	}

	// Check if rating already exists
	var existingRating models.BoxRating
	err := r.collection.FindOne(context.Background(), filter).Decode(&existingRating)

	if err == mongo.ErrNoDocuments {
		// Create new rating
		newRating := models.NewBoxRating(boxID, userID, rating, review)
		_, err = r.collection.InsertOne(context.Background(), newRating)
		if err != nil {
			return nil, err
		}
		return newRating, nil
	} else if err != nil {
		return nil, err
	}

	// Update existing rating
	update := bson.M{
		"$set": bson.M{
			"rating":     rating,
			"review":     review,
			"updated_at": primitive.NewDateTimeFromTime(existingRating.UpdatedAt),
		},
	}

	_, err = r.collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return nil, err
	}

	// Return updated rating
	existingRating.Rating = rating
	existingRating.Review = review
	return &existingRating, nil
}

// GetRating returns a specific user's rating for a box
func (r *BoxRatingRepository) GetRating(boxID, userID primitive.ObjectID) (*models.BoxRating, error) {
	filter := bson.M{
		"box_id":  boxID,
		"user_id": userID,
	}

	var rating models.BoxRating
	err := r.collection.FindOne(context.Background(), filter).Decode(&rating)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &rating, nil
}

// GetBoxRatings returns all ratings for a specific box
func (r *BoxRatingRepository) GetBoxRatings(boxID primitive.ObjectID, limit, skip int) ([]*models.BoxRating, error) {
	filter := bson.M{"box_id": boxID}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var ratings []*models.BoxRating
	if err = cursor.All(context.Background(), &ratings); err != nil {
		return nil, err
	}

	return ratings, nil
}

// GetUserRatings returns all ratings by a specific user
func (r *BoxRatingRepository) GetUserRatings(userID primitive.ObjectID, limit, skip int) ([]*models.BoxRating, error) {
	filter := bson.M{"user_id": userID}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var ratings []*models.BoxRating
	if err = cursor.All(context.Background(), &ratings); err != nil {
		return nil, err
	}

	return ratings, nil
}

// GetBoxRatingStats calculates rating statistics for a box
func (r *BoxRatingRepository) GetBoxRatingStats(boxID primitive.ObjectID) (*models.BoxRatingStats, error) {
	pipeline := []bson.M{
		{
			"$match": bson.M{"box_id": boxID},
		},
		{
			"$group": bson.M{
				"_id":            "$box_id",
				"total_ratings":  bson.M{"$sum": 1},
				"average_rating": bson.M{"$avg": "$rating"},
				"rating_counts": bson.M{
					"$push": bson.M{
						"rating": "$rating",
						"count":  1,
					},
				},
			},
		},
		{
			"$project": bson.M{
				"box_id":         "$_id",
				"total_ratings":  1,
				"average_rating": 1,
				"rating_counts": bson.M{
					"$arrayToObject": bson.M{
						"$map": bson.M{
							"input": []int{1, 2, 3, 4, 5},
							"as":    "rating",
							"in": bson.M{
								"k": bson.M{"$toString": "$$rating"},
								"v": bson.M{
									"$size": bson.M{
										"$filter": bson.M{
											"input": "$rating_counts",
											"cond":  bson.M{"$eq": []interface{}{"$$this.rating", "$$rating"}},
										},
									},
								},
							},
						},
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

	var results []models.BoxRatingStats
	if err = cursor.All(context.Background(), &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		// Return empty stats if no ratings exist
		return &models.BoxRatingStats{
			BoxID:         boxID,
			TotalRatings:  0,
			AverageRating: 0.0,
			RatingCounts:  make(map[int]int),
		}, nil
	}

	return &results[0], nil
}

// DeleteRating removes a rating
func (r *BoxRatingRepository) DeleteRating(boxID, userID primitive.ObjectID) error {
	filter := bson.M{
		"box_id":  boxID,
		"user_id": userID,
	}

	result, err := r.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("rating not found")
	}

	return nil
}

// GetTopRatedBoxes returns boxes with highest average ratings
func (r *BoxRatingRepository) GetTopRatedBoxes(limit int, minRatings int) ([]bson.M, error) {
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":            "$box_id",
				"total_ratings":  bson.M{"$sum": 1},
				"average_rating": bson.M{"$avg": "$rating"},
			},
		},
		{
			"$match": bson.M{
				"total_ratings": bson.M{"$gte": minRatings},
			},
		},
		{
			"$sort": bson.M{
				"average_rating": -1,
				"total_ratings":  -1,
			},
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

// HasUserRatedBox checks if a user has rated a specific box
func (r *BoxRatingRepository) HasUserRatedBox(userID, boxID primitive.ObjectID) (bool, error) {
	filter := bson.M{
		"user_id": userID,
		"box_id":  boxID,
	}

	count, err := r.collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
