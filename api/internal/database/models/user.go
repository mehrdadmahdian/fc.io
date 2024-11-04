package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Name           string             `bson:"name"`
	Email          string             `bson:"email"`
	HashedPassword string             `bson:"hashed_password"`
}

func NewUser(name, email, hashedPassword string) *User {
	return &User{
		ID:             primitive.NewObjectID(),
		Name:           name,
		Email:          email,
		HashedPassword: hashedPassword,
	}
}

func (user *User) IDString() string {
    return user.ID.Hex()
}
