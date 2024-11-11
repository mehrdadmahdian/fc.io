package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Card struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Front   string `bson:"front"`
	Back    string `bson:"back"`
	Extra    string `bson:"extra"`
	StageID primitive.ObjectID `bson:"stage_id"`
}

func NewCard(front string, back string, stageID primitive.ObjectID) *Card {
    return &Card{
        ID:      primitive.NewObjectID(),
        Front:   front,
        Back:    back,
        StageID: stageID,
    }
}

func (model *Card) IDString() string {
    return model.ID.Hex()
}
