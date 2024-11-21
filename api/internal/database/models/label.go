package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Label struct {
	ID    primitive.ObjectID `bson:"_id,omitempty"`
	BoxID primitive.ObjectID `bson:"box_id"`
	Name  string             `bson:"name"`

	Box Box `bson:box,omitempty`
}

func NewLabel(name string, boxID string) (*Stage, error) {
	boxObjectId, err := StringToObjectID(boxID)
	if err != nil {
		return nil, err
	}

	return &Stage{
		ID:    primitive.NewObjectID(),
		BoxID: boxObjectId,
		Name:  name,
	}, nil
}

func (model *Label) IDString() string {
	return model.ID.Hex()
}
