package models

type User struct {
	ID       string `json:"id" bson:"_id"`
	Name     string `json:"name" bson:"name"`
	Email    string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
	Boxes    []Box  `json:"boxes" bson:"boxes"`
}

type Box struct {
	ID     string  `json:"id" bson:"_id"`
	Name   string  `json:"name" bson:"name"`
	UserID string  `json:"user_id" bson:"user_id"`
	Stages []Stage `json:"stages" bson:"stages"`
}

type Stage struct {
	ID    string `json:"id" bson:"_id"`
	Name  string `json:"name" bson:"name"`
	BoxID string `json:"box_id" bson:"box_id"`
}

type Card struct {
	ID      string `json:"id" bson:"_id"`
	Back    string `json:"back" bson:"title"`
	Front   string `json:"front" bson:"title"`
	Content string `json:"content" bson:"content"`
	StageID string `json:"stage_id" bson:"stage_id"`
}
