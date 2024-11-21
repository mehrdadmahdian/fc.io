package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Stage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	BoxID     primitive.ObjectID `bson:"box_id"`
	Name      string             `bson:"name"`
	IsDefault bool               `bson:"isDefault"`

	//embeded
	Box    *Box     `bson:box,omitempty`
}

const (
	StageNew        = "new"
	StageLearning   = "learning"
	StageProficient = "proficient"
	StageMastered   = "mastered"
	StageReview     = "review"
	StageArchived   = "archived"
)

func NewStage(name string, boxID string, isDefault bool) (*Stage, error) {
	boxObjectId, err := StringToObjectID(boxID)
	if err != nil {
		return nil, err
	}

	return &Stage{
		ID:        primitive.NewObjectID(),
		BoxID:     boxObjectId,
		Name:      name,
		IsDefault: isDefault,
	}, nil
}

func GetListOfBasicStages(boxId string) ([]Stage, error) {
	stage1, err := NewStage(StageNew, boxId, false)
	stage2, err := NewStage(StageLearning, boxId, true)
	stage3, err := NewStage(StageProficient, boxId, false)
	stage4, err := NewStage(StageMastered, boxId, false)
	stage5, err := NewStage(StageReview, boxId, false)
	stage6, err := NewStage(StageArchived, boxId, false)

	if err != nil {
		return nil, err
	}

	return []Stage{*stage1, *stage2, *stage3, *stage4, *stage5, *stage6}, nil
}

func (model *Stage) IDString() string {
	return model.ID.Hex()
}
