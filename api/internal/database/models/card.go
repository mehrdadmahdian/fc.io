package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Card struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	BoxID   primitive.ObjectID `bson:"box_id"`
	StageID primitive.ObjectID `bson:"stage_id"`
	Front   string             `bson:"front"`
	Back    string             `bson:"back"`
	Extra   string             `bson:"extra"`
}

func NewCard(
	boxID string,
	stageID string,
	front string,
	back string,
	Extra string,
) (*Card, error) {
	stageObjectId, err := StringToObjectID(stageID)
	if err != nil {
		return nil, err
	}

	boxObjectId, err := StringToObjectID(boxID)
	if err != nil {
		return nil, err
	}

	return &Card{
		ID:      primitive.NewObjectID(),
		BoxID:   stageObjectId,
		StageID: boxObjectId,
		Front:   front,
		Back:    back,
		Extra:   Extra,
	}, nil
}

func (model *Card) IDString() string {
	return model.ID.Hex()
}

type CardWithStage struct {
	ID        primitive.ObjectID `bson:"_id"`
	Front     string             `bson:"front"`
	Back      string             `bson:"back"`
	Extra     string             `bson:"extra"`
	StageName string             `bson:"stage_name"`
}
