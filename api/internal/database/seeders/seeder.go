package seeders

import (
	"github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
)

type Seeder struct {
	MongoService *mongo_service.MongoService
}

func NewSeeder(mongoService *mongo_service.MongoService) (*Seeder, error) {
	return &Seeder{
		MongoService: mongoService,
	}, nil
}

func (seeder *Seeder) Seed() error {
	return nil
	// userCollection := seeder.MongoService.Client().Database("flashcards").Collection("users")
	// boxCollection := seeder.MongoService.Client().Database("flashcards").Collection("boxes")

	// hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
	// if err != nil {
	// 	return err
	// }

	// user := models.NewUser("admin", "admin@admin.com", string(hashedPassword))
	// users := []models.User{*user}

	// for _, user := range users {
	// 	_, err := userCollection.InsertOne(context.TODO(), user)
	// 	if err != nil {
	// 		return err
	// 	}
	// }
	// fmt.Println("Users seeded")

	// box := models.NewBox("Box 1", user.ID)
	// stage1 := models.NewStage("Stage 1", false)
	// stage2 := models.NewStage("Stage 2", false)
	// stage3 := models.NewStage("Stage 3", false)
	// box.Stages = append(box.Stages, *stage1, *stage2, *stage3)

	// card1, err := models.NewCard("Card 1 Front", "Card 1 Back", "", stage1.IDString())
	// if (err != nil) {
	// 	return err
	// }
	// card2, err := models.NewCard("Card 2 Front", "Card 2 Back", "", stage1.IDString())
	// if (err != nil) {
	// 	return err
	// }
	// card3, err := models.NewCard("Card 3 Front", "Card 3 Back", "", stage3.IDString())
	// if (err != nil) {
	// 	return err
	// }

	// box.Cards = append(box.Cards, *card1, *card2, *card3)

	// _, err = boxCollection.InsertOne(context.TODO(), box)
	// if err != nil {
	// 	log.Fatalf("Failed to insert box: %v", err)
	// }

	// fmt.Println("Box seeded successfully")

	// return nil
}
