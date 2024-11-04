package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Stage struct {
	ID    primitive.ObjectID `bson:"_id,omitempty"`
	Name  string             `bson:"name"`
}

func NewStage(name string) *Stage {
    return &Stage{
        ID:    primitive.NewObjectID(),
        Name:  name,
    }
}
