package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"github.com/mehrdadmahdian/fc.io/internal/services/box_service"
	internal_mongo "github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	// Initialize MongoDB connection
	mongoService, err := internal_mongo.NewMongoService()
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Initialize repositories
	boxRepo, err := repositories.NewBoxRepository(mongoService)
	if err != nil {
		log.Fatal("Failed to create box repository:", err)
	}

	cardRepo, err := repositories.NewCardRepository(mongoService)
	if err != nil {
		log.Fatal("Failed to create card repository:", err)
	}

	stageRepo, err := repositories.NewStageRepository(mongoService)
	if err != nil {
		log.Fatal("Failed to create stage repository:", err)
	}

	labelRepo, err := repositories.NewLabelRepository(mongoService)
	if err != nil {
		log.Fatal("Failed to create label repository:", err)
	}

	// Initialize box service
	boxService, err := box_service.NewBoxService(boxRepo, cardRepo, stageRepo, labelRepo)
	if err != nil {
		log.Fatal("Failed to create box service:", err)
	}

	// Create a test user
	userID, _ := primitive.ObjectIDFromHex("673ed26fb74d9aeb708ef207")
	user := &models.User{
		ID:   userID,
		Name: "Test User",
	}

	ctx := context.Background()

	// Test the optimized RenderUserBoxes function
	fmt.Println("Testing optimized RenderUserBoxes function...")
	start := time.Now()

	boxInfos, err := boxService.RenderUserBoxes(ctx, user)
	if err != nil {
		log.Fatal("Failed to render user boxes:", err)
	}

	duration := time.Since(start)

	fmt.Printf("✅ Successfully loaded %d boxes in %v\n", len(boxInfos), duration)

	// Test the optimized GetGlobalReviewCardsCount function
	fmt.Println("\nTesting optimized GetGlobalReviewCardsCount function...")
	start = time.Now()

	count, err := boxService.GetGlobalReviewCardsCount(ctx, user)
	if err != nil {
		log.Fatal("Failed to get global review cards count:", err)
	}

	duration = time.Since(start)

	fmt.Printf("✅ Global review cards count: %d (loaded in %v)\n", count, duration)

	// Print box details
	fmt.Println("\nBox details:")
	for i, boxInfo := range boxInfos {
		fmt.Printf("Box %d: %s\n", i+1, boxInfo.Box.Name)
		fmt.Printf("  - Total cards: %d\n", boxInfo.CountOfTotalCards)
		fmt.Printf("  - Due today: %d\n", boxInfo.CountOfCardsDueToday)
		fmt.Printf("  - Needing review: %d\n", boxInfo.CountOfCardsNeedingReview)
		fmt.Printf("  - Success rate: %.2f%%\n", boxInfo.SuccessRate*100)
	}

	fmt.Println("\n🎉 Performance test completed successfully!")
}
