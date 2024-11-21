package repositories

import (
	"context"

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

func (cardRepository *CardRepository) GetAllCardsOfTheBox(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"box_id": box.ID}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "boxes",
			"localField":   "box_id",
			"foreignField": "_id",
			"as":           "box",
		}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "stages",
			"localField":   "stage_id",
			"foreignField": "_id",
			"as":           "stage",
		}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "labels",
			"localField":   "label_ids",
			"foreignField": "_id",
			"as":           "labels",
		}}},
		{{Key: "$unwind", Value: bson.M{
			"path": "$box",
			"preserveNullAndEmptyArrays": true,
		}}},
		{{Key: "$unwind", Value: bson.M{
			"path": "$stage",
			"preserveNullAndEmptyArrays": true,
		}}},
	}

	cursor, err := cardRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	if err := cursor.All(ctx, &cards); err != nil {
		return nil, err
	}
	return cards, nil
}
