package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const DefaultInteval int = 1
const DefaultEaseFactor float64= 2.5

type Card struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty"`
	BoxID     primitive.ObjectID   `bson:"box_id"`
	LabelIDs  []primitive.ObjectID `bson:"label_ids"`
	Front     string               `bson:"front"`
	Back      string               `bson:"back"`
	Extra     string               `bson:"extra"`
	Review    Review               `bson:"review"`
	CreatedAt time.Time            `bson:"created_at"`
	UpdatedAt time.Time            `bson:"updated_at"`

	//embeded
	Box    *Box     `bson:box,omitempty`
	Labels *[]Label `bson:labels,omitempty`
}

type Review struct {
	LastReviewDate *time.Time            `bson:"last_review_date"`
	NextDueDate    *time.Time            `bson:"next_due_date"`
	Interval       int                  `bson:"current_interval"`
	EaseFactor     float64              `bson:"ease_factor"`
	ReviewsCount   int                   `bson:"reviews_count"`
	ReviewHistory  []ReviewHistoryRecord `bson:"review_history"`
}

type ReviewHistoryRecord struct {
	Date          time.Time `bson:"date"`
	Difficulty    string    `bson:"difficulty"`
	OldInterval   int       `bson:"old_interval"`
	OldEaseFactor float64   `bson:"old_ease_factor"`
	NewInterval   int       `bson:"new_interval"`
	NewEaseFactor float64   `bson:"new_ease_factor"`
}

func NewCard(
	boxID string,
	labelIDs []string,
	front string,
	back string,
	Extra string,
) (*Card, error) {
	boxObjectId, err := StringToObjectID(boxID)
	if err != nil {
		return nil, err
	}

	labelObjectIds := []primitive.ObjectID{}
	for _, labelId := range labelIDs {
		objectid, err := StringToObjectID(labelId)
		if err != nil {
			return nil, err
		}
		labelObjectIds = append(labelObjectIds, objectid)
	}

	nextDueDate := time.Now().Add(24 * time.Hour)
	defaultInterval := DefaultInteval
	defaultEaseFactor := DefaultEaseFactor
	return &Card{
		ID:        primitive.NewObjectID(),
		BoxID:     boxObjectId,
		LabelIDs:  labelObjectIds,
		Front:     front,
		Back:      back,
		Extra:     Extra,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Review: Review{
			LastReviewDate: nil,
			NextDueDate:    &nextDueDate,
			Interval:       defaultInterval,
			EaseFactor:     defaultEaseFactor,
			ReviewsCount:   0,
			ReviewHistory:  []ReviewHistoryRecord{},
		},
	}, nil
}

func (model *Card) IDString() string {
	return model.ID.Hex()
}
