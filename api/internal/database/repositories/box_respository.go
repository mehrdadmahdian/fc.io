package repositories

import (
	"context"

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
	// If this box is being set as active, deactivate all other boxes for this user first
	if box.IsActive {
		err := boxRepository.DeactivateAllBoxesForUser(ctx, box.UserID)
		if err != nil {
			return nil, err
		}
	}

	_, err := boxRepository.collection.InsertOne(ctx, box)
	if err != nil {
		return nil, err
	}

	return box, nil
}

func (boxRepository *BoxRepository) GetAllBoxesForUser(ctx context.Context, user *models.User) ([]*models.Box, error) {
	var boxes []*models.Box
	cursor, err := boxRepository.collection.Find(ctx, bson.M{"user_id": user.ID}, options.Find().SetProjection(bson.M{
		"_id":         1,
		"name":        1,
		"description": 1,
		"is_active":   1,
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

func (boxRepository *BoxRepository) UpdateBox(ctx context.Context, boxID string, name string, description string) error {
	objectID, err := primitive.ObjectIDFromHex(boxID)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"name":        name,
			"description": description,
		},
	}

	_, err = boxRepository.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

func (boxRepository *BoxRepository) DeleteBox(ctx context.Context, boxID string) error {
	objectID, err := primitive.ObjectIDFromHex(boxID)
	if err != nil {
		return err
	}

	_, err = boxRepository.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}

// DeactivateAllBoxesForUser sets all boxes for a user to inactive
func (boxRepository *BoxRepository) DeactivateAllBoxesForUser(ctx context.Context, userID primitive.ObjectID) error {
	update := bson.M{
		"$set": bson.M{
			"is_active": false,
		},
	}

	_, err := boxRepository.collection.UpdateMany(ctx, bson.M{"user_id": userID}, update)
	return err
}

// SetActiveBox sets one box as active and deactivates all others for the user
func (boxRepository *BoxRepository) SetActiveBox(ctx context.Context, boxID string, userID primitive.ObjectID) error {
	// First deactivate all boxes for this user
	err := boxRepository.DeactivateAllBoxesForUser(ctx, userID)
	if err != nil {
		return err
	}

	// Then activate the specified box
	objectID, err := primitive.ObjectIDFromHex(boxID)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"is_active": true,
		},
	}

	_, err = boxRepository.collection.UpdateOne(ctx, bson.M{"_id": objectID, "user_id": userID}, update)
	return err
}

// GetActiveBoxForUser returns the active box for a user
func (boxRepository *BoxRepository) GetActiveBoxForUser(ctx context.Context, userID primitive.ObjectID) (*models.Box, error) {
	var box models.Box

	err := boxRepository.collection.FindOne(ctx, bson.M{"user_id": userID, "is_active": true}).Decode(&box)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &box, nil
}
