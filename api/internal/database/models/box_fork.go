package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// BoxFork represents a forked box relationship
type BoxFork struct {
	ID              primitive.ObjectID `bson:"_id,omitempty"`
	OriginalBoxID   primitive.ObjectID `bson:"original_box_id"`   // The box that was forked
	ForkedBoxID     primitive.ObjectID `bson:"forked_box_id"`     // The new forked box
	ForkedByUserID  primitive.ObjectID `bson:"forked_by_user_id"` // User who created the fork
	OriginalOwnerID primitive.ObjectID `bson:"original_owner_id"` // Original box owner
	CreatedAt       time.Time          `bson:"created_at"`
	ForkDescription string             `bson:"fork_description"` // Optional description of changes made

	// Embedded data for efficient queries
	OriginalBox   *Box  `bson:"original_box,omitempty"`
	ForkedBox     *Box  `bson:"forked_box,omitempty"`
	ForkedByUser  *User `bson:"forked_by_user,omitempty"`
	OriginalOwner *User `bson:"original_owner,omitempty"`
}

func NewBoxFork(originalBoxID, forkedBoxID, forkedByUserID, originalOwnerID primitive.ObjectID, description string) *BoxFork {
	return &BoxFork{
		ID:              primitive.NewObjectID(),
		OriginalBoxID:   originalBoxID,
		ForkedBoxID:     forkedBoxID,
		ForkedByUserID:  forkedByUserID,
		OriginalOwnerID: originalOwnerID,
		CreatedAt:       time.Now(),
		ForkDescription: description,
	}
}

func (bf *BoxFork) IDString() string {
	return bf.ID.Hex()
}
