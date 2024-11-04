package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Box struct {
	ID     primitive.ObjectID   `bson:"_id,omitempty"`
	Name   string   `bson:"name"`
	UserID primitive.ObjectID   `bson:"user_id"`
	Stages []Stage  `bson:"stages"`
	Cards  []Card `bson:"cards"`
}

func NewBox(name string, userID primitive.ObjectID) *Box {
    return &Box{
        ID:     primitive.NewObjectID(),
        Name:   name,
        UserID: userID,
        Stages: []Stage{},
        Cards:  []Card{},
    }
}
