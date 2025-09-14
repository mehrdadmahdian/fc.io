package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// BoxRating represents a user's rating of a box
type BoxRating struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	BoxID     primitive.ObjectID `bson:"box_id"`
	UserID    primitive.ObjectID `bson:"user_id"`
	Rating    int                `bson:"rating"` // 1-5 stars
	Review    string             `bson:"review"` // Optional text review
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`

	// Embedded data for efficient queries
	Box  *Box  `bson:"box,omitempty"`
	User *User `bson:"user,omitempty"`
}

func NewBoxRating(boxID, userID primitive.ObjectID, rating int, review string) *BoxRating {
	now := time.Now()
	return &BoxRating{
		ID:        primitive.NewObjectID(),
		BoxID:     boxID,
		UserID:    userID,
		Rating:    rating,
		Review:    review,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func (br *BoxRating) IDString() string {
	return br.ID.Hex()
}

// BoxRatingStats represents aggregated rating statistics for a box
type BoxRatingStats struct {
	BoxID         primitive.ObjectID `bson:"box_id"`
	TotalRatings  int                `bson:"total_ratings"`
	AverageRating float64            `bson:"average_rating"`
	RatingCounts  map[int]int        `bson:"rating_counts"` // Count of each rating (1-5)
	UpdatedAt     time.Time          `bson:"updated_at"`
}
