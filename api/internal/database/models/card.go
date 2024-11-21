package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Card struct {
	ID       primitive.ObjectID   `bson:"_id,omitempty"`
	BoxID    primitive.ObjectID   `bson:"box_id"`
	StageID  primitive.ObjectID   `bson:"stage_id"`
	LabelIDs []primitive.ObjectID `bson:"label_ids"`
	Front    string               `bson:"front"`
	Back     string               `bson:"back"`
	Extra    string               `bson:"extra"`

	//embeded
	Box    *Box     `bson:box,omitempty`
	Stage  *Stage   `bson:stage,omitempty`
	Labels *[]Label `bson:labels,omitempty`
}

func NewCard(
	boxID string,
	stageID string,
	labelIDs []string,
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

	labelObjectIds := []primitive.ObjectID{}
	for _, labelId := range labelIDs {
		objectid, err := StringToObjectID(labelId)
		if (err != nil) {
			return nil, err
		}
		labelObjectIds = append(labelObjectIds, objectid)
	}

	return &Card{
		ID:      primitive.NewObjectID(),
		BoxID:   boxObjectId,
		StageID: stageObjectId,
		LabelIDs: labelObjectIds,
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

func (model *CardWithStage) IDString() string {
	return model.ID.Hex()
}
