package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Label struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	BoxID     primitive.ObjectID `bson:"box_id"`
	Name      string             `bson:"name"`
	Color     string             `bson:"color"` // Hex color code for the label
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`

	//embedded
	Box *Box `bson:"box,omitempty"`
}

func NewLabel(name string, boxID string, color string) (*Label, error) {
	boxObjectId, err := StringToObjectID(boxID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	return &Label{
		ID:        primitive.NewObjectID(),
		BoxID:     boxObjectId,
		Name:      name,
		Color:     color,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

func (model *Label) IDString() string {
	return model.ID.Hex()
}
