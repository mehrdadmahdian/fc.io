package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Box struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	IsActive    bool               `bson:"is_active"`

	//embeded
	User *User `bson:user,omitempty`
}

func NewBox(name string, userID primitive.ObjectID) *Box {
	return &Box{
		ID:          primitive.NewObjectID(),
		Name:        name,
		Description: "",
		UserID:      userID,
		IsActive:    true, // New boxes are active by default
	}
}

func (model *Box) IDString() string {
	return model.ID.Hex()
}
