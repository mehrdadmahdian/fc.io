package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// BoxVisibility represents the visibility level of a box
type BoxVisibility string

const (
	BoxVisibilityPrivate  BoxVisibility = "private"  // Only owner can see
	BoxVisibilityPublic   BoxVisibility = "public"   // Anyone can discover and view
	BoxVisibilityUnlisted BoxVisibility = "unlisted" // Only accessible via direct link
)

type Box struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	IsActive    bool               `bson:"is_active"`

	// Social features
	Visibility BoxVisibility `bson:"visibility"` // private, public, unlisted
	Tags       []string      `bson:"tags"`       // Tags for categorization
	Language   string        `bson:"language"`   // Language of the content
	Difficulty string        `bson:"difficulty"` // beginner, intermediate, advanced
	CreatedAt  time.Time     `bson:"created_at"`
	UpdatedAt  time.Time     `bson:"updated_at"`

	// Social stats (can be computed or cached)
	ForkCount     int     `bson:"fork_count"`     // Number of times forked
	RatingCount   int     `bson:"rating_count"`   // Number of ratings
	AverageRating float64 `bson:"average_rating"` // Average rating (1-5)
	ViewCount     int     `bson:"view_count"`     // Number of views

	// Fork information (if this box is a fork)
	IsForked        bool               `bson:"is_forked"`
	OriginalBoxID   primitive.ObjectID `bson:"original_box_id,omitempty"`
	ForkDescription string             `bson:"fork_description,omitempty"`

	//embedded
	User *User `bson:"user,omitempty"`
}

func NewBox(name string, userID primitive.ObjectID) *Box {
	now := time.Now()
	return &Box{
		ID:          primitive.NewObjectID(),
		Name:        name,
		Description: "",
		UserID:      userID,
		IsActive:    true, // New boxes are active by default

		// Social defaults
		Visibility:    BoxVisibilityPrivate, // Default to private
		Tags:          []string{},
		Language:      "en",
		Difficulty:    "beginner",
		CreatedAt:     now,
		UpdatedAt:     now,
		ForkCount:     0,
		RatingCount:   0,
		AverageRating: 0.0,
		ViewCount:     0,
		IsForked:      false,
	}
}

func (model *Box) IDString() string {
	return model.ID.Hex()
}
