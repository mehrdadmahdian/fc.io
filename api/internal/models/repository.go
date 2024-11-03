package models

import (
	"github.com/mehrdadmahdian/fc.io/internal/db"
)

type UserRepository struct {
	mongoService *db.MongoService
}

func NewUserRepository(mongoService *db.MongoService) (*UserRepository, error) {
	return &UserRepository{
		mongoService: mongoService,
	}, nil
}

func (userRepository *UserRepository) FindUserByEmail(email string) (*User, error){
	return nil, nil
}
