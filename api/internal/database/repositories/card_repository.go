package repositories

import (
	"context"
	"fmt"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
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

func (boxRepository *BoxRepository) GetAllCardsOfTheBox(ctx context.Context, box *models.Box) ([]*models.CardWithStage, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "box_id", Value: box.ID}}}},

		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "stages"},
			{Key: "localField", Value: "stage_id"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "stage"},
		}}},

		{{Key: "$unwind", Value: bson.D{{Key: "path", Value: "$stage"}, {Key: "preserveNullAndEmptyArrays", Value: true}}}},

		{{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 1},
			{Key: "front", Value: 1},
			{Key: `back`, Value: 1},
			{Key: "extra", Value: 1},
			{Key: "stage_id", Value: 1},
			{Key: "stage_name", Value: "$stage.name"},
		}}},
	}

	cursor, err := boxRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error executing aggregation: %v", err)
	}
	defer cursor.Close(ctx)

	var cards []*models.CardWithStage
	for cursor.Next(ctx) {
		var card models.CardWithStage
		if err := cursor.Decode(&card); err != nil {
			return nil, fmt.Errorf("error decoding card: %v", err)
		}
		cards = append(cards, &card)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor iteration error: %v", err)
	}

	return cards, nil
}
