package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Name           string             `bson:"name"`
	Email          string             `bson:"email"`
	HashedPassword string             `bson:"hashed_password"`

	// Social features
	Username    string    `bson:"username"`     // Unique username for social features
	DisplayName string    `bson:"display_name"` // Public display name
	Bio         string    `bson:"bio"`          // User biography
	AvatarURL   string    `bson:"avatar_url"`   // Profile picture URL
	IsPublic    bool      `bson:"is_public"`    // Whether profile is public
	CreatedAt   time.Time `bson:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"`

	// Social stats (can be computed or cached)
	FollowerCount  int `bson:"follower_count"`
	FollowingCount int `bson:"following_count"`
	PublicBoxCount int `bson:"public_box_count"`
}

func NewUser(name, email, hashedPassword string) *User {
	now := time.Now()
	return &User{
		ID:             primitive.NewObjectID(),
		Name:           name,
		Email:          email,
		HashedPassword: hashedPassword,
		Username:       "", // Will be set separately
		DisplayName:    name,
		Bio:            "",
		AvatarURL:      "",
		IsPublic:       true, // Default to public profile
		CreatedAt:      now,
		UpdatedAt:      now,
		FollowerCount:  0,
		FollowingCount: 0,
		PublicBoxCount: 0,
	}
}

func (user *User) IDString() string {
	return user.ID.Hex()
}
