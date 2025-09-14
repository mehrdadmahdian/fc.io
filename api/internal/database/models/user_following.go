package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserFollowing represents a follow relationship between users
type UserFollowing struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	FollowerID  primitive.ObjectID `bson:"follower_id"`  // User who is following
	FollowingID primitive.ObjectID `bson:"following_id"` // User being followed
	CreatedAt   time.Time          `bson:"created_at"`

	// Embedded user data for efficient queries
	Follower  *User `bson:"follower,omitempty"`
	Following *User `bson:"following,omitempty"`
}

func NewUserFollowing(followerID, followingID primitive.ObjectID) *UserFollowing {
	return &UserFollowing{
		ID:          primitive.NewObjectID(),
		FollowerID:  followerID,
		FollowingID: followingID,
		CreatedAt:   time.Now(),
	}
}

func (uf *UserFollowing) IDString() string {
	return uf.ID.Hex()
}
