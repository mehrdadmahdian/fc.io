package repositories

import (
	"context"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type LabelRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewLabelRepository(mongoService *internal_mongo.MongoService) (*LabelRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("labels")

	return &LabelRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (labelRepository *LabelRepository) CreateLabel(ctx context.Context, label *models.Label) error {
	_, err := labelRepository.collection.InsertOne(ctx, label)
	return err
}

func (labelRepository *LabelRepository) GetBoxLabels(ctx context.Context, boxID string) ([]*models.Label, error) {
	boxObjectId, err := models.StringToObjectID(boxID)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"box_id": boxObjectId}
	cursor, err := labelRepository.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var labels []*models.Label
	if err := cursor.All(ctx, &labels); err != nil {
		return nil, err
	}

	return labels, nil
}

func (labelRepository *LabelRepository) GetLabel(ctx context.Context, labelID string) (*models.Label, error) {
	objectId, err := models.StringToObjectID(labelID)
	if err != nil {
		return nil, err
	}

	var label models.Label
	err = labelRepository.collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&label)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &label, nil
}

func (labelRepository *LabelRepository) UpdateLabel(ctx context.Context, labelID string, name string, color string) error {
	objectId, err := models.StringToObjectID(labelID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objectId}
	update := bson.M{
		"$set": bson.M{
			"name":       name,
			"color":      color,
			"updated_at": time.Now(),
		},
	}

	_, err = labelRepository.collection.UpdateOne(ctx, filter, update)
	return err
}

func (labelRepository *LabelRepository) DeleteLabel(ctx context.Context, labelID string) error {
	objectId, err := models.StringToObjectID(labelID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objectId}
	_, err = labelRepository.collection.DeleteOne(ctx, filter)
	return err
}
