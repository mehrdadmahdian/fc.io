package mongo_service

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoService struct {
	mongoClient *mongo.Client
	ctx context.Context
}

func NewMongoService(ctx context.Context, uri string) (*MongoService, error) {
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
	if err := mongoClient.Ping(pingCtx, nil); err != nil {
		log.Fatal("Failed to ping MongoDB:", err)

		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	go func() {
		<-ctx.Done()
		log.Println("Context cancelled, disconnecting MongoDB client...")
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting MongoDB client: %v", err)
		} else {
			log.Println("MongoDB client disconnected gracefully")
		}
	}()

	return &MongoService{
		mongoClient: mongoClient,
		ctx:         ctx,
	}, nil
}

func (mongoService *MongoService) Client() *mongo.Client {
	return mongoService.mongoClient
}
