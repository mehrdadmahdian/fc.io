package repositories

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/mongo"
)

type CardRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewCardRepository(mongoService *internal_mongo.MongoService) (*CardRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("cards")

	return &CardRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (cardRepository *CardRepository) FindById(id int) (*models.Card, error) {
	var card models.Card

	return &card, nil
}

func (cardRepository *CardRepository) Insert(ctx context.Context, card *models.Card) (*models.Card, error) {
	_, err := cardRepository.collection.InsertOne(ctx, card)
	if err != nil {
		return nil, err
	}

	return card, nil
}
