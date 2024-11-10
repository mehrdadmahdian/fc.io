package repositories

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	newUser := &models.User{
		Email:          email,
		Name:           name,
		HashedPassword: string(hashedPassword),
	}

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
