package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ActivityType represents different types of activities in the feed
type ActivityType string

const (
	ActivityTypeBoxCreated    ActivityType = "box_created"
	ActivityTypeBoxForked     ActivityType = "box_forked"
	ActivityTypeBoxRated      ActivityType = "box_rated"
	ActivityTypeUserFollowed  ActivityType = "user_followed"
	ActivityTypeBoxMadePublic ActivityType = "box_made_public"
)

// ActivityFeed represents an activity in the social feed
type ActivityFeed struct {
	ID           primitive.ObjectID     `bson:"_id,omitempty"`
	UserID       primitive.ObjectID     `bson:"user_id"` // User who performed the action
	ActivityType ActivityType           `bson:"activity_type"`
	TargetID     primitive.ObjectID     `bson:"target_id"`   // ID of the target (box, user, etc.)
	TargetType   string                 `bson:"target_type"` // "box", "user", etc.
	Metadata     map[string]interface{} `bson:"metadata"`    // Additional activity data
	CreatedAt    time.Time              `bson:"created_at"`
	IsPublic     bool                   `bson:"is_public"` // Whether this activity should be visible to followers

	// Embedded data for efficient queries
	User   *User       `bson:"user,omitempty"`
	Target interface{} `bson:"target,omitempty"` // Could be Box, User, etc.
}

func NewActivityFeed(userID primitive.ObjectID, activityType ActivityType, targetID primitive.ObjectID, targetType string, metadata map[string]interface{}, isPublic bool) *ActivityFeed {
	return &ActivityFeed{
		ID:           primitive.NewObjectID(),
		UserID:       userID,
		ActivityType: activityType,
		TargetID:     targetID,
		TargetType:   targetType,
		Metadata:     metadata,
		CreatedAt:    time.Now(),
		IsPublic:     isPublic,
	}
}

func (af *ActivityFeed) IDString() string {
	return af.ID.Hex()
}
