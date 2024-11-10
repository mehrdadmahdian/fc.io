package repositories

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/mongo"
)

type BoxRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewBoxRepository(mongoService *internal_mongo.MongoService) (*BoxRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("boxes")

	return &BoxRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (boxRepository *BoxRepository) InsertBox(ctx context.Context, box *models.Box) (*models.Box, error) {
	_, err := boxRepository.collection.InsertOne(ctx, box)
	if err != nil {
		return nil, err
	}

	return box, nil
}
