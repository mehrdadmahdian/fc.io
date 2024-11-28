package models

import (
	"time"

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

	// Review Data
	Review Review `bson:"review"`

	// Metadata
	CreatedAt time.Time `bson:"created_at"`
	UpdatedAt time.Time `bson:"updated_at"`
}
	
type Review struct {
	LastReviewDate  *time.Time `bson:"last_review_date"`
	NextDueDate     *time.Time `bson:"next_due_date"`
	CurrentInterval int      `bson:"current_interval"`
	EaseFactor      float64  `bson:"ease_factor"`
	ReviewsCount    int      `bson:"reviews_count"`
	ReviewHistory   []ReviewRecord `bson:"review_history"`
}
	
type ReviewRecord struct {
	Date   time.Time `bson:"date"`
	Action int       `bson:"action"`
	OldInterval  int       `bson:"old_interval"`
	OldEaseFactor  float64       `bson:"old_ease_factor"`
	NewInterval  int       `bson:"new_interval"`
	NewEaseFactor  float64       `bson:"old_ease_factor"`
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

	nextDueDate := time.Now().Add(24 * time.Hour)
	return &Card{
		ID:           primitive.NewObjectID(),
		BoxID:        boxObjectId,
		StageID:      stageObjectId,
		LabelIDs: 	  labelObjectIds,
		Front:        front,
		Back:         back,
		Extra:        Extra,
		CreatedAt:    time.Now(),
		UpdatedAt:   time.Now(),
		Review: Review{
			LastReviewDate: nil,
			NextDueDate:    &nextDueDate,
			CurrentInterval: 0,
			EaseFactor:      2.5,
			ReviewsCount:    0,
			ReviewHistory:   []ReviewRecord{},
		},
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
