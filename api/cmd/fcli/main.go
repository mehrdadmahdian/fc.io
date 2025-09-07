package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson"
)

type DevDump struct {
	ExportedAt time.Time     `json:"exported_at"`
	Version    string        `json:"version"`
	Users      []models.User `json:"users"`
	Boxes      []models.Box  `json:"boxes"`
	Cards      []models.Card `json:"cards"`
	Labels     []models.Label `json:"labels"`
	Stats      DumpStats     `json:"stats"`
}

type DumpStats struct {
	TotalUsers  int64 `json:"total_users"`
	TotalBoxes  int64 `json:"total_boxes"`
	TotalCards  int64 `json:"total_cards"`
	TotalLabels int64 `json:"total_labels"`
}

var (
	app *application.Container
	ctx context.Context
)

func initApp() error {
	if app != nil {
		return nil
	}

	ctx = context.Background()
	cfg, err := config.LoadConfig()
	if err != nil {
		return fmt.Errorf("could not load config: %v", err)
	}

	app, err = application.NewContainer(cfg, ctx)
	if err != nil {
		return fmt.Errorf("application could not be initialized: %s", err.Error())
	}

	return nil
}

var rootCmd = &cobra.Command{
	Use:   "fcli",
	Short: "FlashCards CLI - Development and maintenance tools",
	Long: `FlashCards CLI provides various tools for managing your flashcard application:
- Data export/import for development environments
- Database diagnostics and migrations
- Reverse review management`,
}

var reverseCmd = &cobra.Command{
	Use:   "reverse",
	Short: "Reverse review management commands",
	Long:  "Commands for diagnosing and fixing reverse review issues",
}

var dataCmd = &cobra.Command{
	Use:   "data",
	Short: "Data management commands",
	Long:  "Commands for exporting, importing, and managing flashcard data",
}

var diagnosisCmd = &cobra.Command{
	Use:   "diagnose",
	Short: "Diagnose reverse review issues",
	Long:  "Analyze your database to identify cards that aren't properly configured for reverse review",
	RunE: func(cmd *cobra.Command, args []string) error {
		if err := initApp(); err != nil {
			return err
		}

		collection := app.MongoService.Client().Database("flashcards").Collection("cards")

		fmt.Println("=== Reverse Review Diagnostic Report ===")
		fmt.Println()

		// Total cards
		totalCount, err := collection.CountDocuments(ctx, bson.M{})
		if err != nil {
			return fmt.Errorf("failed to count total cards: %v", err)
		}
		fmt.Printf("Total cards in database: %d\n", totalCount)

		// Cards without reverse_review field
		noFieldCount, err := collection.CountDocuments(ctx, bson.M{
			"reverse_review": bson.M{"$exists": false},
		})
		if err != nil {
			log.Printf("Warning: Could not count cards without reverse_review field: %v", err)
		} else {
			fmt.Printf("Cards without reverse_review field: %d\n", noFieldCount)
		}

		// Cards with null reverse_review
		nullFieldCount, err := collection.CountDocuments(ctx, bson.M{
			"reverse_review": nil,
		})
		if err != nil {
			log.Printf("Warning: Could not count cards with null reverse_review: %v", err)
		} else {
			fmt.Printf("Cards with null reverse_review: %d\n", nullFieldCount)
		}

		// Cards with reverse_review but null next_due_date
		nullDueDateCount, err := collection.CountDocuments(ctx, bson.M{
			"reverse_review": bson.M{"$ne": nil},
			"reverse_review.next_due_date": nil,
		})
		if err != nil {
			log.Printf("Warning: Could not count cards with null next_due_date: %v", err)
		} else {
			fmt.Printf("Cards with reverse_review but null next_due_date: %d\n", nullDueDateCount)
		}

		// Cards properly configured for reverse review
		properlyConfiguredCount, err := collection.CountDocuments(ctx, bson.M{
			"reverse_review": bson.M{"$ne": nil},
			"reverse_review.next_due_date": bson.M{"$ne": nil},
		})
		if err != nil {
			log.Printf("Warning: Could not count properly configured cards: %v", err)
		} else {
			fmt.Printf("Cards properly configured for reverse review: %d\n", properlyConfiguredCount)
		}

		// Cards currently due for reverse review
		currentTime := time.Now()
		dueForReviewCount, err := collection.CountDocuments(ctx, bson.M{
			"reverse_review": bson.M{"$ne": nil},
			"reverse_review.next_due_date": bson.M{
				"$ne":  nil,
				"$lte": currentTime,
			},
		})
		if err != nil {
			log.Printf("Warning: Could not count cards due for review: %v", err)
		} else {
			fmt.Printf("Cards currently due for reverse review: %d\n", dueForReviewCount)
		}

		fmt.Println()
		fmt.Println("=== Summary ===")
		
		problemCards := noFieldCount + nullFieldCount + nullDueDateCount
		fmt.Printf("Cards that need migration: %d\n", problemCards)
		
		if problemCards > 0 {
			fmt.Println()
			fmt.Println("ISSUE IDENTIFIED:")
			fmt.Printf("You have %d cards that are not properly configured for reverse review.\n", problemCards)
			fmt.Println("This is why they don't appear in your reverse review list.")
			fmt.Println()
			fmt.Println("SOLUTION:")
			fmt.Println("Run the migration command to fix this:")
			fmt.Println("  fcli reverse migrate")
		} else {
			fmt.Println("All cards are properly configured for reverse review!")
		}

		return nil
	},
}

var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Migrate existing cards for reverse review",
	Long:  "Fix existing cards that don't have proper reverse review configuration",
	RunE: func(cmd *cobra.Command, args []string) error {
		if err := initApp(); err != nil {
			return err
		}

		collection := app.MongoService.Client().Database("flashcards").Collection("cards")

		fmt.Println("Checking cards that need reverse review migration...")

		filter := bson.M{
			"$or": []bson.M{
				{"reverse_review": bson.M{"$exists": false}},
				{"reverse_review": nil},
				{"reverse_review.next_due_date": nil},
				{"reverse_review.next_due_date": bson.M{"$exists": false}},
			},
		}

		count, err := collection.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count cards: %v", err)
		}

		fmt.Printf("Found %d cards that need reverse review migration\n", count)

		if count == 0 {
			fmt.Println("No cards need migration. All cards already have reverse review configured.")
			return nil
		}

		// Ask for confirmation
		fmt.Printf("Do you want to migrate %d cards? (y/N): ", count)
		var response string
		fmt.Scanln(&response)

		if response != "y" && response != "Y" {
			fmt.Println("Migration cancelled.")
			return nil
		}

		// Perform the migration
		fmt.Println("Starting migration...")

		nextDueDate := time.Now().Add(24 * time.Hour)
		defaultInterval := models.DefaultInteval
		defaultEaseFactor := models.DefaultEaseFactor

		update := bson.M{
			"$set": bson.M{
				"reverse_review": bson.M{
					"last_review_date": nil,
					"next_due_date":    nextDueDate,
					"current_interval": defaultInterval,
					"ease_factor":      defaultEaseFactor,
					"reviews_count":    0,
					"review_history":   []models.ReviewHistoryRecord{},
				},
				"updated_at": time.Now(),
			},
		}

		result, err := collection.UpdateMany(ctx, filter, update)
		if err != nil {
			return fmt.Errorf("failed to update cards: %v", err)
		}

		fmt.Printf("Successfully migrated %d cards!\n", result.ModifiedCount)
		fmt.Printf("All cards now have reverse review enabled and will be available for reverse review starting tomorrow.\n")

		return nil
	},
}

var downloadCmd = &cobra.Command{
	Use:   "download",
	Short: "Download/export flashcard data",
	Long:  "Export all your flashcard data to a JSON file for use in other environments",
	RunE: func(cmd *cobra.Command, args []string) error {
		if err := initApp(); err != nil {
			return err
		}

		includeUsers, _ := cmd.Flags().GetBool("users")
		includeHistory, _ := cmd.Flags().GetBool("history")
		anonymize, _ := cmd.Flags().GetBool("anonymize")
		outputFile, _ := cmd.Flags().GetString("output")

		db := app.MongoService.Client().Database("flashcards")

		fmt.Println("=== FlashCards Data Export ===")
		fmt.Printf("Include users: %t\n", includeUsers)
		fmt.Printf("Include history: %t\n", includeHistory)
		fmt.Printf("Anonymize: %t\n", anonymize)
		fmt.Println()

		dump := DevDump{
			ExportedAt: time.Now(),
			Version:    "1.0",
			Users:      []models.User{},
			Boxes:      []models.Box{},
			Cards:      []models.Card{},
			Labels:     []models.Label{},
		}

		// Export Users
		if includeUsers {
			fmt.Println("Exporting users...")
			usersCursor, err := db.Collection("users").Find(ctx, bson.M{})
			if err != nil {
				return fmt.Errorf("failed to query users: %v", err)
			}
			defer usersCursor.Close(ctx)

			var users []models.User
			if err := usersCursor.All(ctx, &users); err != nil {
				return fmt.Errorf("failed to decode users: %v", err)
			}

			if anonymize {
				for i := range users {
					users[i].Email = fmt.Sprintf("user%d@example.com", i+1)
					users[i].Name = fmt.Sprintf("User%d", i+1)
					users[i].HashedPassword = ""
				}
			}

			dump.Users = users
			dump.Stats.TotalUsers = int64(len(users))
			fmt.Printf("Exported %d users\n", len(users))
		}

		// Export Boxes
		fmt.Println("Exporting boxes...")
		boxesCursor, err := db.Collection("boxes").Find(ctx, bson.M{})
		if err != nil {
			return fmt.Errorf("failed to query boxes: %v", err)
		}
		defer boxesCursor.Close(ctx)

		var boxes []models.Box
		if err := boxesCursor.All(ctx, &boxes); err != nil {
			return fmt.Errorf("failed to decode boxes: %v", err)
		}

		dump.Boxes = boxes
		dump.Stats.TotalBoxes = int64(len(boxes))
		fmt.Printf("Exported %d boxes\n", len(boxes))

		// Export Labels
		fmt.Println("Exporting labels...")
		labelsCursor, err := db.Collection("labels").Find(ctx, bson.M{})
		if err != nil {
			return fmt.Errorf("failed to query labels: %v", err)
		}
		defer labelsCursor.Close(ctx)

		var labels []models.Label
		if err := labelsCursor.All(ctx, &labels); err != nil {
			return fmt.Errorf("failed to decode labels: %v", err)
		}

		dump.Labels = labels
		dump.Stats.TotalLabels = int64(len(labels))
		fmt.Printf("Exported %d labels\n", len(labels))

		// Export Cards
		fmt.Println("Exporting cards...")
		cardsCursor, err := db.Collection("cards").Find(ctx, bson.M{})
		if err != nil {
			return fmt.Errorf("failed to query cards: %v", err)
		}
		defer cardsCursor.Close(ctx)

		var cards []models.Card
		if err := cardsCursor.All(ctx, &cards); err != nil {
			return fmt.Errorf("failed to decode cards: %v", err)
		}

		if !includeHistory {
			for i := range cards {
				cards[i].Review.ReviewHistory = []models.ReviewHistoryRecord{}
				cards[i].ReverseReview.ReviewHistory = []models.ReviewHistoryRecord{}
			}
		}

		dump.Cards = cards
		dump.Stats.TotalCards = int64(len(cards))
		fmt.Printf("Exported %d cards\n", len(cards))

		// Generate filename if not provided
		if outputFile == "" {
			outputDir := "dumps"
			if err := os.MkdirAll(outputDir, 0755); err != nil {
				return fmt.Errorf("failed to create output directory: %v", err)
			}
			timestamp := time.Now().Format("20060102_150405")
			outputFile = filepath.Join(outputDir, fmt.Sprintf("flashcards_devdump_%s.json", timestamp))
		}

		// Write JSON file
		fmt.Printf("Writing dump to %s...\n", outputFile)
		file, err := os.Create(outputFile)
		if err != nil {
			return fmt.Errorf("failed to create output file: %v", err)
		}
		defer file.Close()

		encoder := json.NewEncoder(file)
		encoder.SetIndent("", "  ")
		if err := encoder.Encode(dump); err != nil {
			return fmt.Errorf("failed to encode JSON: %v", err)
		}

		fileInfo, _ := file.Stat()
		fmt.Println()
		fmt.Println("=== Export Complete ===")
		fmt.Printf("File: %s\n", outputFile)
		if fileInfo != nil {
			fmt.Printf("Size: %.2f MB\n", float64(fileInfo.Size())/(1024*1024))
		}
		fmt.Printf("Users: %d | Boxes: %d | Cards: %d | Labels: %d\n", 
			dump.Stats.TotalUsers, dump.Stats.TotalBoxes, dump.Stats.TotalCards, dump.Stats.TotalLabels)

		return nil
	},
}

var uploadCmd = &cobra.Command{
	Use:   "upload [dump_file]",
	Short: "Upload/import flashcard data",
	Long:  "Import a previously created dump file into your database",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		if err := initApp(); err != nil {
			return err
		}

		dumpFile := args[0]
		clearData, _ := cmd.Flags().GetBool("clear")

		db := app.MongoService.Client().Database("flashcards")

		fmt.Println("=== FlashCards Data Import ===")
		fmt.Printf("Import file: %s\n", dumpFile)
		fmt.Println()

		if _, err := os.Stat(dumpFile); os.IsNotExist(err) {
			return fmt.Errorf("dump file does not exist: %s", dumpFile)
		}

		// Read and parse dump file
		fmt.Println("Reading dump file...")
		file, err := os.Open(dumpFile)
		if err != nil {
			return fmt.Errorf("failed to open dump file: %v", err)
		}
		defer file.Close()

		var dump DevDump
		decoder := json.NewDecoder(file)
		if err := decoder.Decode(&dump); err != nil {
			return fmt.Errorf("failed to parse dump file: %v", err)
		}

		fmt.Printf("Dump created: %s\n", dump.ExportedAt.Format("2006-01-02 15:04:05"))
		fmt.Printf("Data: %d users, %d boxes, %d cards, %d labels\n", 
			dump.Stats.TotalUsers, dump.Stats.TotalBoxes, dump.Stats.TotalCards, dump.Stats.TotalLabels)
		fmt.Println()

		// Check current database state
		currentUsers, _ := db.Collection("users").CountDocuments(ctx, bson.M{})
		currentBoxes, _ := db.Collection("boxes").CountDocuments(ctx, bson.M{})
		currentCards, _ := db.Collection("cards").CountDocuments(ctx, bson.M{})
		currentLabels, _ := db.Collection("labels").CountDocuments(ctx, bson.M{})

		if currentUsers > 0 || currentBoxes > 0 || currentCards > 0 || currentLabels > 0 {
			fmt.Printf("Current database: %d users, %d boxes, %d cards, %d labels\n", 
				currentUsers, currentBoxes, currentCards, currentLabels)
			
			if !clearData {
				fmt.Print("Database is not empty. Continue anyway? (y/N): ")
				var response string
				fmt.Scanln(&response)
				if response != "y" && response != "Y" {
					fmt.Println("Import cancelled.")
					return nil
				}
			} else {
				fmt.Println("Clearing existing data...")
				collections := []string{"users", "boxes", "cards", "labels"}
				for _, collName := range collections {
					if _, err := db.Collection(collName).DeleteMany(ctx, bson.M{}); err != nil {
						log.Printf("Warning: Failed to clear %s collection: %v", collName, err)
					}
				}
			}
		}

		fmt.Println("Starting import...")

		// Import data
		if len(dump.Users) > 0 {
			fmt.Printf("Importing %d users...\n", len(dump.Users))
			userDocs := make([]interface{}, len(dump.Users))
			for i, user := range dump.Users {
				userDocs[i] = user
			}
			if _, err := db.Collection("users").InsertMany(ctx, userDocs); err != nil {
				log.Printf("Warning: Failed to import users: %v", err)
			}
		}

		if len(dump.Labels) > 0 {
			fmt.Printf("Importing %d labels...\n", len(dump.Labels))
			labelDocs := make([]interface{}, len(dump.Labels))
			for i, label := range dump.Labels {
				labelDocs[i] = label
			}
			if _, err := db.Collection("labels").InsertMany(ctx, labelDocs); err != nil {
				log.Printf("Warning: Failed to import labels: %v", err)
			}
		}

		if len(dump.Boxes) > 0 {
			fmt.Printf("Importing %d boxes...\n", len(dump.Boxes))
			boxDocs := make([]interface{}, len(dump.Boxes))
			for i, box := range dump.Boxes {
				boxDocs[i] = box
			}
			if _, err := db.Collection("boxes").InsertMany(ctx, boxDocs); err != nil {
				log.Printf("Warning: Failed to import boxes: %v", err)
			}
		}

		if len(dump.Cards) > 0 {
			fmt.Printf("Importing %d cards...\n", len(dump.Cards))
			batchSize := 1000
			for i := 0; i < len(dump.Cards); i += batchSize {
				end := i + batchSize
				if end > len(dump.Cards) {
					end = len(dump.Cards)
				}
				
				batch := dump.Cards[i:end]
				cardDocs := make([]interface{}, len(batch))
				for j, card := range batch {
					cardDocs[j] = card
				}
				
				if _, err := db.Collection("cards").InsertMany(ctx, cardDocs); err != nil {
					log.Printf("Warning: Failed to import card batch: %v", err)
				}
			}
		}

		fmt.Println()
		fmt.Println("=== Import Complete ===")
		fmt.Printf("Successfully imported data from: %s\n", filepath.Base(dumpFile))

		return nil
	},
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List available dump files",
	Long:  "Show all available dump files with metadata",
	RunE: func(cmd *cobra.Command, args []string) error {
		dumpsDir := "dumps"
		
		fmt.Println("=== Available FlashCards Dumps ===")
		fmt.Println()

		if _, err := os.Stat(dumpsDir); os.IsNotExist(err) {
			fmt.Printf("No dumps directory found at: %s\n", dumpsDir)
			fmt.Println("Run 'fcli data download' to create your first dump.")
			return nil
		}

		files, err := os.ReadDir(dumpsDir)
		if err != nil {
			return fmt.Errorf("error reading dumps directory: %v", err)
		}

		var dumpFiles []string
		for _, file := range files {
			if !file.IsDir() && strings.HasSuffix(file.Name(), ".json") {
				dumpFiles = append(dumpFiles, file.Name())
			}
		}

		if len(dumpFiles) == 0 {
			fmt.Printf("No dump files found in: %s\n", dumpsDir)
			fmt.Println("Run 'fcli data download' to create your first dump.")
			return nil
		}

		sort.Strings(dumpFiles)

		for _, filename := range dumpFiles {
			filepath := filepath.Join(dumpsDir, filename)
			
			file, err := os.Open(filepath)
			if err != nil {
				fmt.Printf("Warning: Could not read %s: %v\n", filename, err)
				continue
			}

			var dump struct {
				ExportedAt time.Time `json:"exported_at"`
				Version    string    `json:"version"`
				Stats      DumpStats `json:"stats"`
			}

			decoder := json.NewDecoder(file)
			if err := decoder.Decode(&dump); err != nil {
				fmt.Printf("Warning: Could not parse %s: %v\n", filename, err)
				file.Close()
				continue
			}
			file.Close()

			fileInfo, err := os.Stat(filepath)
			var sizeStr string
			if err == nil {
				sizeMB := float64(fileInfo.Size()) / (1024 * 1024)
				if sizeMB < 1 {
					sizeStr = fmt.Sprintf("%.1f KB", float64(fileInfo.Size())/1024)
				} else {
					sizeStr = fmt.Sprintf("%.1f MB", sizeMB)
				}
			} else {
				sizeStr = "unknown"
			}

			fmt.Printf("📁 %s\n", filename)
			fmt.Printf("   Created: %s\n", dump.ExportedAt.Format("2006-01-02 15:04:05"))
			fmt.Printf("   Size: %s\n", sizeStr)
			fmt.Printf("   Data: %d users, %d boxes, %d cards, %d labels\n", 
				dump.Stats.TotalUsers, dump.Stats.TotalBoxes, dump.Stats.TotalCards, dump.Stats.TotalLabels)
			fmt.Println()
		}

		fmt.Printf("Found %d dump file(s)\n", len(dumpFiles))
		fmt.Println()
		fmt.Println("Usage:")
		fmt.Println("  fcli data upload dumps/<filename>  # Import a dump")
		fmt.Println("  fcli data download                 # Create new dump")

		return nil
	},
}

func init() {
	// Add subcommands
	rootCmd.AddCommand(reverseCmd)
	rootCmd.AddCommand(dataCmd)

	// Reverse review commands
	reverseCmd.AddCommand(diagnosisCmd)
	reverseCmd.AddCommand(migrateCmd)

	// Data management commands
	dataCmd.AddCommand(downloadCmd)
	dataCmd.AddCommand(uploadCmd)
	dataCmd.AddCommand(listCmd)

	// Download flags
	downloadCmd.Flags().Bool("users", false, "Include user data in export")
	downloadCmd.Flags().Bool("history", false, "Include review history in export")
	downloadCmd.Flags().Bool("anonymize", true, "Anonymize user data")
	downloadCmd.Flags().StringP("output", "o", "", "Output file path (default: auto-generated)")

	// Upload flags
	uploadCmd.Flags().Bool("clear", false, "Clear existing data before import")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
