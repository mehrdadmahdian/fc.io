package repositories

import (
	"context"

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

func (LabelRepository *LabelRepository) Insert(ctx context.Context, stage *models.Label) (*models.Label, error) {
	_, err := LabelRepository.collection.InsertOne(ctx, stage)
	if err != nil {
		return nil, err
	}

	return stage, nil
}

func (LabelRepository *LabelRepository) GetAllForBox(ctx context.Context, box *models.Box) ([]*models.Label, error) {
	var labels []*models.Label

	filter := bson.M{"box_id": box.ID}

	cursor, err := LabelRepository.collection.Find(ctx, filter)
	defer cursor.Close(ctx)
	if err != nil {
		return nil, err
	}

	for cursor.Next(ctx) {
		var label models.Label
		if err := cursor.Decode(&label); err != nil {
			return nil, err
		}
		labels = append(labels, &label)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return labels, nil
}
