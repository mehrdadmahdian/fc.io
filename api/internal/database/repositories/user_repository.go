package repositories

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
	mongoService *internal_mongo.MongoService
	collection   *mongo.Collection
}

func NewUserRepository(mongoService *internal_mongo.MongoService) (*UserRepository, error) {
	collection := mongoService.Client().Database("flashcards").Collection("users")

	return &UserRepository{
		mongoService: mongoService,
		collection:   collection,
	}, nil
}

func (userRepository *UserRepository) FindUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := userRepository.collection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // or return an appropriate error
		}
		return nil, err
	}

	return &user, nil
}

func (userRepository *UserRepository) CreateNewUser(name, email, password string) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	newUser := models.NewUser(name, email, string(hashedPassword))

	_, err = userRepository.collection.InsertOne(context.TODO(), newUser)
	if err != nil {
		return nil, err
	}

	return newUser, nil
}

func (userRepository *UserRepository) FindUserById(userID string) (*models.User, error) {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	var user models.User
	err = userRepository.collection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// SearchUsers searches for users by username, display name, or email
func (userRepository *UserRepository) SearchUsers(ctx context.Context, query string, limit, skip int) ([]*models.User, error) {
	var users []*models.User

	// Build search filter using regex for partial matches
	// Search across username, display_name, and email fields
	filter := bson.M{
		"$and": []bson.M{
			{
				"$or": []bson.M{
					{"username": bson.M{"$regex": query, "$options": "i"}},
					{"display_name": bson.M{"$regex": query, "$options": "i"}},
					{"email": bson.M{"$regex": query, "$options": "i"}},
				},
			},
			{
				// Only return public profiles or users who haven't set privacy (default public)
				"$or": []bson.M{
					{"is_public": true},
					{"is_public": bson.M{"$exists": false}},
				},
			},
		},
	}

	// Build find options
	limitVal := int64(limit)
	skipVal := int64(skip)
	findOptions := &options.FindOptions{
		Sort:  bson.D{{Key: "display_name", Value: 1}, {Key: "username", Value: 1}},
		Limit: &limitVal,
		Skip:  &skipVal,
		// Project only public fields for search results
		Projection: bson.M{
			"_id":          1,
			"username":     1,
			"display_name": 1,
			"bio":          1,
			"avatar_url":   1,
			"is_public":    1,
			"created_at":   1,
		},
	}

	cursor, err := userRepository.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, &user)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
