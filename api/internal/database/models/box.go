package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Box struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
}

func NewBox(name string, userID primitive.ObjectID) *Box {
	return &Box{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Name:        name,
		Description: "",
	}
}

func (model *Box) IDString() string {
    return model.ID.Hex()
}
