package models

import "go.mongodb.org/mongo-driver/bson/primitive"

func StringToObjectID(id string) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(id)
}
