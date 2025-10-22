package card_service

import (
	"context"
	"fmt"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/services/audit_service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CardService struct {
	cardRepository *repositories.CardRepository
	auditService   *audit_service.AuditService
}

func NewCardService(cardRepository *repositories.CardRepository, auditService *audit_service.AuditService) (*CardService, error) {
	return &CardService{
		cardRepository: cardRepository,
		auditService:   auditService,
	}, nil
}

func (cardService *CardService) GetCard(ctx context.Context, cardID string) (*models.Card, error) {
	return cardService.cardRepository.FindById(ctx, cardID)
}

func (cardService *CardService) ArchiveCard(ctx context.Context, cardID string) error {
	return cardService.cardRepository.SetArchived(ctx, cardID)
}

func (cardService *CardService) UpdateCard(ctx context.Context, cardID string, front string, back string, extra string, hint string, labelIds []string, isBookmarked bool, difficulty string) error {
	return cardService.cardRepository.UpdateCardContent(ctx, cardID, front, back, extra, hint, labelIds, isBookmarked, difficulty)
}

func (cardService *CardService) DeleteCard(ctx context.Context, cardID string) error {
	return cardService.cardRepository.DeleteCard(ctx, cardID)
}

// Card Migration Methods

type MigrationResult struct {
	SuccessfulMigrations []string `json:"successful_migrations"`
	FailedMigrations     []string `json:"failed_migrations"`
	TotalRequested       int      `json:"total_requested"`
	TotalSuccessful      int      `json:"total_successful"`
	TotalFailed          int      `json:"total_failed"`
}

func (cardService *CardService) MigrateCard(ctx context.Context, cardID string, targetBoxID string, preserveProgress bool, userID primitive.ObjectID, ipAddress string, userAgent string) error {
	// Validate card ownership
	err := cardService.cardRepository.ValidateCardOwnership(ctx, cardID, userID)
	if err != nil {
		return fmt.Errorf("card ownership validation failed: %w", err)
	}

	// Get current card data for audit logging
	card, err := cardService.cardRepository.FindById(ctx, cardID)
	if err != nil {
		return fmt.Errorf("failed to get card data: %w", err)
	}

	sourceBoxID := card.BoxID

	// Perform migration
	err = cardService.cardRepository.MigrateCard(ctx, cardID, targetBoxID, preserveProgress)
	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}

	// Log the migration in audit trail
	if cardService.auditService != nil {
		cardObjectID, _ := models.StringToObjectID(cardID)
		targetBoxObjectID, _ := models.StringToObjectID(targetBoxID)

		err = cardService.auditService.LogCardMigration(
			ctx,
			userID,
			cardObjectID,
			sourceBoxID,
			targetBoxObjectID,
			preserveProgress,
			ipAddress,
			userAgent,
		)
		if err != nil {
			// Log error but don't fail the migration
			fmt.Printf("Failed to log audit trail: %v\n", err)
		}
	}

	return nil
}

func (cardService *CardService) BulkMigrateCards(ctx context.Context, cardIDs []string, targetBoxID string, preserveProgress bool, userID primitive.ObjectID, ipAddress string, userAgent string) (*MigrationResult, error) {
	// Validate all cards belong to the user and get source box ID
	var sourceBoxID primitive.ObjectID
	for i, cardID := range cardIDs {
		err := cardService.cardRepository.ValidateCardOwnership(ctx, cardID, userID)
		if err != nil {
			return nil, fmt.Errorf("card ownership validation failed for card %s: %w", cardID, err)
		}

		// Get source box ID from first card for audit logging
		if i == 0 {
			card, err := cardService.cardRepository.FindById(ctx, cardID)
			if err == nil {
				sourceBoxID = card.BoxID
			}
		}
	}

	// Perform bulk migration
	successful, failed, err := cardService.cardRepository.BulkMigrateCards(ctx, cardIDs, targetBoxID, preserveProgress)
	if err != nil {
		return nil, fmt.Errorf("bulk migration failed: %w", err)
	}

	result := &MigrationResult{
		SuccessfulMigrations: successful,
		FailedMigrations:     failed,
		TotalRequested:       len(cardIDs),
		TotalSuccessful:      len(successful),
		TotalFailed:          len(failed),
	}

	// Log the bulk migration in audit trail
	if cardService.auditService != nil && len(successful) > 0 {
		// Convert successful card IDs to ObjectIDs
		var cardObjectIDs []primitive.ObjectID
		for _, cardID := range successful {
			if objectID, err := models.StringToObjectID(cardID); err == nil {
				cardObjectIDs = append(cardObjectIDs, objectID)
			}
		}

		targetBoxObjectID, _ := models.StringToObjectID(targetBoxID)

		err = cardService.auditService.LogBulkCardMigration(
			ctx,
			userID,
			cardObjectIDs,
			sourceBoxID,
			targetBoxObjectID,
			preserveProgress,
			len(successful),
			len(failed),
			ipAddress,
			userAgent,
		)
		if err != nil {
			// Log error but don't fail the migration
			fmt.Printf("Failed to log bulk migration audit trail: %v\n", err)
		}
	}

	return result, nil
}

func (cardService *CardService) ValidateCardOwnership(ctx context.Context, cardID string, userID primitive.ObjectID) error {
	return cardService.cardRepository.ValidateCardOwnership(ctx, cardID, userID)
}

func (cardService *CardService) CheckDuplicateInBox(ctx context.Context, boxID string, front string, back string) (bool, error) {
	return cardService.cardRepository.CheckDuplicateInBox(ctx, boxID, front, back)
}

// New feature methods

func (cardService *CardService) ToggleBookmark(ctx context.Context, cardID string) error {
	return cardService.cardRepository.ToggleBookmark(ctx, cardID)
}

func (cardService *CardService) UpdateDifficulty(ctx context.Context, cardID string, difficulty string) error {
	return cardService.cardRepository.UpdateDifficulty(ctx, cardID, difficulty)
}

func (cardService *CardService) GetCustomReviewCards(ctx context.Context, user *models.User, request *requests.CustomReviewRequest) ([]*models.Card, error) {
	return cardService.cardRepository.GetCustomReviewCards(ctx, user, request)
}
