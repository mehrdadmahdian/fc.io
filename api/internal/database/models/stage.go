package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Stage struct {
	ID   primitive.ObjectID `bson:"_id,omitempty"`
	Name string             `bson:"name"`
}

const (
	StageNew        = "new"
	StageLearning   = "learning"
	StageProficient = "proficient"
	StageMastered   = "mastered"
	StageReview     = "review"
	StageArchived   = "archived"
)

func NewStage(name string) *Stage {
	return &Stage{
		ID:   primitive.NewObjectID(),
		Name: name,
	}
}

func GetListOfBasicStages() []Stage {
	return []Stage{
		*NewStage(StageNew),
		*NewStage(StageLearning),
		*NewStage(StageProficient),
		*NewStage(StageMastered),
		*NewStage(StageReview),
		*NewStage(StageArchived),
	}
}
