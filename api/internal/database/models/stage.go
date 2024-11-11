package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Stage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `bson:"name"`
	IsDefault bool               `bson:"isDefault"`
}

const (
	StageNew        = "new"
	StageLearning   = "learning"
	StageProficient = "proficient"
	StageMastered   = "mastered"
	StageReview     = "review"
	StageArchived   = "archived"
)

func NewStage(name string, isDefault bool) *Stage {
	return &Stage{
		ID:        primitive.NewObjectID(),
		Name:      name,
		IsDefault: isDefault,
	}
}

func GetListOfBasicStages() []Stage {
	return []Stage{
		*NewStage(StageNew, false),
		*NewStage(StageLearning, true),
		*NewStage(StageProficient, false),
		*NewStage(StageMastered, false),
		*NewStage(StageReview, false),
		*NewStage(StageArchived, false),
	}
}

func (model *Stage) IDString() string {
	return model.ID.Hex()
}
