package repositories

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type StageRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewStageRepository(mongoService *internal_mongo.MongoService) (*StageRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("stages")

	return &StageRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (stageRepository *StageRepository) Insert(ctx context.Context, stage *models.Stage) (*models.Stage, error) {
	_, err := stageRepository.collection.InsertOne(ctx, stage)
	if err != nil {
		return nil, err
	}

	return stage, nil
}

func (stageRepository *StageRepository) GetAllForBox(ctx context.Context, box *models.Box) ([]*models.Stage, error) {
    var stages []*models.Stage

    filter := bson.M{"box_id": box.ID}

    cursor, err := stageRepository.collection.Find(ctx, filter)
    if err != nil {
        return nil, err
    }
    defer cursor.Close(ctx)

    for cursor.Next(ctx) {
        var stage models.Stage
        if err := cursor.Decode(&stage); err != nil {
            return nil, err
        }
        stages = append(stages, &stage)
    }

    if err := cursor.Err(); err != nil {
        return nil, err
    }

    return stages, nil
}


