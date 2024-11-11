package repositories

import (
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/mongo"
)

type CardRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewCardRepository(mongoService *internal_mongo.MongoService) (*CardRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("boxes")

	return &CardRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (cardRepository *CardRepository) FindById(id int) (*models.Card, error) {
	var card models.Card

	return &card, nil
}
