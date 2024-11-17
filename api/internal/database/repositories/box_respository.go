package repositories

import (
	"context"
	"fmt"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

func (BoxRepository *BoxRepository) AddCardToBox(ctx context.Context, boxID primitive.ObjectID, card *models.Card) error {
	filter := bson.M{"_id": boxID}
	update := bson.M{
		"$push": bson.M{
			"cards": card,
		},
	}

	_, err := BoxRepository.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	return nil
}

func (boxRepository *BoxRepository) GetAllBoxesForUser(ctx context.Context, user *models.User) ([]*models.Box, error) {
	var boxes []*models.Box
	cursor, err := boxRepository.collection.Find(ctx, bson.M{"user_id": user.ID}, options.Find().SetProjection(bson.M{
		"_id":  1,
		"name": 1,
	}))

	if err != nil {
		return nil, err
	}

	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		box := new(models.Box)
		if err := cursor.Decode(box); err != nil {
			return nil, err
		}
		boxes = append(boxes, box)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return boxes, nil
}

func (boxRepository *BoxRepository) GetBoxByID(ctx context.Context, boxID string) (*models.Box, error) {
	var box models.Box

	objectID, err := primitive.ObjectIDFromHex(boxID)
	if err != nil {
		return nil, err
	}

	projection := bson.M{
		"_id":    1,
		"name":   1,
		"stages": 1,
	}
	err = boxRepository.collection.FindOne(ctx, bson.M{"_id": objectID}, &options.FindOneOptions{Projection: projection}).Decode(&box)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &box, nil
}

func (boxRepository *BoxRepository) GetAllCardsOfTheBox(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "_id", Value: box.ID}}}},
		{{Key: "$unwind", Value: "$cards"}},
		{{Key: "$addFields", Value: bson.D{
			{Key: "cards.stage_name", Value: bson.D{
				{Key: "$let", Value: bson.D{
					{Key: "vars", Value: bson.D{
						{Key: "stage", Value: bson.D{
							{Key: "$arrayElemAt", Value: bson.A{
								bson.D{{Key: "$filter", Value: bson.D{
									{Key: "input", Value: "$stages"},
									{Key: "as", Value: "stage"},
									{Key: "cond", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$$stage._id", "$cards.stage_id"}},
									}},
								}}},
								0,
							}},
						}},
					}},
					{Key: "in", Value: bson.D{{Key: "$ifNull", Value: bson.A{"$$stage.name", "Unknown"}}}},
				}},
			}},
		}}},
		{{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 0},
			{Key: "card_id", Value: "$cards._id"},
			{Key: "front", Value: "$cards.front"},
			{Key: "back", Value: "$cards.back"},
			{Key: "extra", Value: "$cards.extra"},
			{Key: "stage_name", Value: "$cards.stage_name"},
		}}},
	}

	cursor, err := boxRepository.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error executing aggregation: %v", err)
	}
	defer cursor.Close(ctx)

	var cards []*models.Card
	for cursor.Next(ctx) {
		var card models.Card
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
