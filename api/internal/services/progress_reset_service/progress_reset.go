package progress_reset_service

import (
	"context"
	"fmt"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProgressResetService struct {
	cardRepository           *repositories.CardRepository
	progressBackupRepository *repositories.ProgressBackupRepository
	progressResetRepository  *repositories.ProgressResetRepository
}

func NewProgressResetService(
	cardRepository *repositories.CardRepository,
	progressBackupRepository *repositories.ProgressBackupRepository,
	progressResetRepository *repositories.ProgressResetRepository,
) (*ProgressResetService, error) {
	return &ProgressResetService{
		cardRepository:           cardRepository,
		progressBackupRepository: progressBackupRepository,
		progressResetRepository:  progressResetRepository,
	}, nil
}

// ResetResult represents the result of a reset operation
type ResetResult struct {
	SuccessfulResets []string `json:"successful_resets"`
	FailedResets     []string `json:"failed_resets"`
	TotalRequested   int      `json:"total_requested"`
	TotalSuccessful  int      `json:"total_successful"`
	TotalFailed      int      `json:"total_failed"`
	BackupID         string   `json:"backup_id,omitempty"`
}

// RestoreResult represents the result of a restore operation
type RestoreResult struct {
	SuccessfulRestores []string `json:"successful_restores"`
	FailedRestores     []string `json:"failed_restores"`
	TotalRequested     int      `json:"total_requested"`
	TotalSuccessful    int      `json:"total_successful"`
	TotalFailed        int      `json:"total_failed"`
}

// ResetCardProgress resets progress for a single card with backup
func (service *ProgressResetService) ResetCardProgress(
	ctx context.Context,
	cardID string,
	resetLevel string,
	resetType string,
	userID primitive.ObjectID,
	createBackup bool,
	reason string,
	ipAddress string,
	userAgent string,
) (*ResetResult, error) {
	var backupID string

	// Create backup if requested
	if createBackup {
		// Get card data for backup
		card, err := service.cardRepository.FindById(ctx, cardID)
		if err != nil {
			return nil, fmt.Errorf("failed to get card for backup: %w", err)
		}

		// Create backup
		backup, err := service.progressBackupRepository.BackupCard(ctx, userID, card, "pre_reset")
		if err != nil {
			return nil, fmt.Errorf("failed to create backup: %w", err)
		}
		backupID = backup.IDString()
	}

	// Perform reset based on type
	var err error
	switch resetType {
	case "complete":
		// Complete reset: reset progress and clear history
		err = service.cardRepository.ResetCardProgress(ctx, cardID, resetLevel)
	case "progress_only":
		// Progress only: reset intervals and due dates but keep history
		err = service.resetCardProgressOnly(ctx, cardID, resetLevel)
	default:
		return nil, fmt.Errorf("invalid reset type: %s", resetType)
	}

	result := &ResetResult{
		TotalRequested: 1,
		BackupID:       backupID,
	}

	if err != nil {
		result.FailedResets = []string{cardID}
		result.TotalFailed = 1
	} else {
		result.SuccessfulResets = []string{cardID}
		result.TotalSuccessful = 1
	}

	// Log the reset operation
	resetLog := models.NewProgressResetLog(userID, "card_reset", resetType, resetLevel)
	resetLog.AddCardID(primitive.ObjectID{}) // Will be set properly with actual card ObjectID
	if cardObjectID, err := models.StringToObjectID(cardID); err == nil {
		resetLog.CardIDs = []primitive.ObjectID{cardObjectID}
	}
	resetLog.IPAddress = ipAddress
	resetLog.UserAgent = userAgent
	resetLog.Reason = reason
	if backupID != "" {
		if backupObjectID, err := models.StringToObjectID(backupID); err == nil {
			resetLog.BackupID = &backupObjectID
		}
	}

	service.progressResetRepository.LogReset(ctx, resetLog)

	return result, nil
}

// ResetBoxProgress resets progress for all cards in a box with backup
func (service *ProgressResetService) ResetBoxProgress(
	ctx context.Context,
	boxID string,
	resetLevel string,
	resetType string,
	userID primitive.ObjectID,
	createBackup bool,
	reason string,
	ipAddress string,
	userAgent string,
) (*ResetResult, error) {
	var backupID string

	// Create backup if requested
	if createBackup {
		// Get all cards in the box for backup
		cards, err := service.cardRepository.GetAllCardsInBox(ctx, boxID)
		if err != nil {
			return nil, fmt.Errorf("failed to get cards for backup: %w", err)
		}

		if len(cards) > 0 {
			boxObjectID, _ := models.StringToObjectID(boxID)
			backup, err := service.progressBackupRepository.BackupBox(ctx, userID, boxObjectID, cards, "pre_reset")
			if err != nil {
				return nil, fmt.Errorf("failed to create backup: %w", err)
			}
			backupID = backup.IDString()
		}
	}

	// Perform reset based on type
	var modifiedCount int64
	var err error

	switch resetType {
	case "complete":
		// Complete reset: reset progress and clear history
		modifiedCount, err = service.cardRepository.ResetBoxProgress(ctx, boxID, resetLevel)
	case "progress_only":
		// Progress only: reset intervals and due dates but keep history
		modifiedCount, err = service.resetBoxProgressOnly(ctx, boxID, resetLevel)
	default:
		return nil, fmt.Errorf("invalid reset type: %s", resetType)
	}

	result := &ResetResult{
		TotalRequested:  int(modifiedCount), // This is approximate
		TotalSuccessful: int(modifiedCount),
		TotalFailed:     0,
		BackupID:        backupID,
	}

	if err != nil {
		result.TotalSuccessful = 0
		result.TotalFailed = result.TotalRequested
	}

	// Log the reset operation
	resetLog := models.NewProgressResetLog(userID, "box_reset", resetType, resetLevel)
	if boxObjectID, err := models.StringToObjectID(boxID); err == nil {
		resetLog.BoxID = &boxObjectID
	}
	resetLog.TotalCards = int(modifiedCount)
	resetLog.IPAddress = ipAddress
	resetLog.UserAgent = userAgent
	resetLog.Reason = reason
	if backupID != "" {
		if backupObjectID, err := models.StringToObjectID(backupID); err == nil {
			resetLog.BackupID = &backupObjectID
		}
	}

	service.progressResetRepository.LogReset(ctx, resetLog)

	return result, nil
}

// BulkResetCardsProgress resets progress for multiple specific cards with backup
func (service *ProgressResetService) BulkResetCardsProgress(
	ctx context.Context,
	cardIDs []string,
	resetLevel string,
	resetType string,
	userID primitive.ObjectID,
	createBackup bool,
	reason string,
	description string,
	ipAddress string,
	userAgent string,
) (*ResetResult, error) {
	var backupID string

	// Create backup if requested
	if createBackup && len(cardIDs) > 0 {
		// Get cards for backup
		cards, err := service.cardRepository.GetCardsForBackup(ctx, cardIDs)
		if err != nil {
			return nil, fmt.Errorf("failed to get cards for backup: %w", err)
		}

		if len(cards) > 0 {
			backup, err := service.progressBackupRepository.BackupBulkCards(ctx, userID, cards, "pre_reset", description)
			if err != nil {
				return nil, fmt.Errorf("failed to create backup: %w", err)
			}
			backupID = backup.IDString()
		}
	}

	// Perform reset based on type
	var successful, failed []string
	var err error

	switch resetType {
	case "complete":
		// Complete reset: reset progress and clear history
		successful, failed, err = service.cardRepository.BulkResetCardsProgress(ctx, cardIDs, resetLevel)
	case "progress_only":
		// Progress only: reset intervals and due dates but keep history
		successful, failed, err = service.bulkResetCardsProgressOnly(ctx, cardIDs, resetLevel)
	default:
		return nil, fmt.Errorf("invalid reset type: %s", resetType)
	}

	if err != nil {
		return nil, fmt.Errorf("bulk reset failed: %w", err)
	}

	result := &ResetResult{
		SuccessfulResets: successful,
		FailedResets:     failed,
		TotalRequested:   len(cardIDs),
		TotalSuccessful:  len(successful),
		TotalFailed:      len(failed),
		BackupID:         backupID,
	}

	// Log the reset operation
	resetLog := models.NewProgressResetLog(userID, "bulk_reset", resetType, resetLevel)
	for _, cardID := range successful {
		if cardObjectID, err := models.StringToObjectID(cardID); err == nil {
			resetLog.AddCardID(cardObjectID)
		}
	}
	resetLog.IPAddress = ipAddress
	resetLog.UserAgent = userAgent
	resetLog.Reason = reason
	if backupID != "" {
		if backupObjectID, err := models.StringToObjectID(backupID); err == nil {
			resetLog.BackupID = &backupObjectID
		}
	}

	service.progressResetRepository.LogReset(ctx, resetLog)

	return result, nil
}

// RestoreFromBackup restores progress from a backup
func (service *ProgressResetService) RestoreFromBackup(
	ctx context.Context,
	backupID string,
	userID primitive.ObjectID,
	ipAddress string,
	userAgent string,
) (*RestoreResult, error) {
	// Get backup data
	backup, err := service.progressBackupRepository.GetBackupByID(ctx, backupID)
	if err != nil {
		return nil, fmt.Errorf("failed to get backup: %w", err)
	}

	// Verify ownership
	if backup.UserID != userID {
		return nil, fmt.Errorf("backup does not belong to user")
	}

	// Check if already restored
	if backup.IsRestored {
		return nil, fmt.Errorf("backup has already been restored")
	}

	// Restore cards
	successful, failed, err := service.cardRepository.BulkRestoreCardsProgress(ctx, backup.CardBackups)
	if err != nil {
		return nil, fmt.Errorf("restore failed: %w", err)
	}

	// Mark backup as restored
	if len(successful) > 0 {
		err = service.progressBackupRepository.MarkAsRestored(ctx, backupID, userID)
		if err != nil {
			// Log error but don't fail the restore
			fmt.Printf("Failed to mark backup as restored: %v\n", err)
		}
	}

	result := &RestoreResult{
		SuccessfulRestores: successful,
		FailedRestores:     failed,
		TotalRequested:     len(backup.CardBackups),
		TotalSuccessful:    len(successful),
		TotalFailed:        len(failed),
	}

	// Log the restore operation
	resetLog := models.NewProgressResetLog(userID, "restore", "complete", "both")
	for _, cardID := range successful {
		if cardObjectID, err := models.StringToObjectID(cardID); err == nil {
			resetLog.AddCardID(cardObjectID)
		}
	}
	resetLog.IPAddress = ipAddress
	resetLog.UserAgent = userAgent
	resetLog.Reason = "restore_from_backup"
	if backupObjectID, err := models.StringToObjectID(backupID); err == nil {
		resetLog.BackupID = &backupObjectID
	}

	service.progressResetRepository.LogReset(ctx, resetLog)

	return result, nil
}

// GetBackupHistory returns backup history for a user
func (service *ProgressResetService) GetBackupHistory(ctx context.Context, userID primitive.ObjectID, limit int, offset int) ([]*models.ProgressBackup, error) {
	return service.progressBackupRepository.GetBackupsForUser(ctx, userID, limit, offset)
}

// GetResetHistory returns reset history for a user
func (service *ProgressResetService) GetResetHistory(ctx context.Context, userID primitive.ObjectID, limit int, offset int) ([]*models.ProgressResetLog, error) {
	return service.progressResetRepository.GetResetHistory(ctx, userID, limit, offset)
}

// DeleteBackup deletes a backup
func (service *ProgressResetService) DeleteBackup(ctx context.Context, backupID string, userID primitive.ObjectID) error {
	// Get backup to verify ownership
	backup, err := service.progressBackupRepository.GetBackupByID(ctx, backupID)
	if err != nil {
		return fmt.Errorf("failed to get backup: %w", err)
	}

	// Verify ownership
	if backup.UserID != userID {
		return fmt.Errorf("backup does not belong to user")
	}

	return service.progressBackupRepository.DeleteBackup(ctx, backupID)
}

// CreateManualBackup creates a manual backup
func (service *ProgressResetService) CreateManualBackup(
	ctx context.Context,
	userID primitive.ObjectID,
	backupType string,
	description string,
	cardIDs []string,
	boxID string,
) (*models.ProgressBackup, error) {
	switch backupType {
	case "card":
		if len(cardIDs) != 1 {
			return nil, fmt.Errorf("card backup requires exactly one card ID")
		}
		card, err := service.cardRepository.FindById(ctx, cardIDs[0])
		if err != nil {
			return nil, fmt.Errorf("failed to get card: %w", err)
		}
		return service.progressBackupRepository.BackupCard(ctx, userID, card, "manual")

	case "box":
		if boxID == "" {
			return nil, fmt.Errorf("box backup requires box ID")
		}
		cards, err := service.cardRepository.GetAllCardsInBox(ctx, boxID)
		if err != nil {
			return nil, fmt.Errorf("failed to get cards: %w", err)
		}
		boxObjectID, _ := models.StringToObjectID(boxID)
		return service.progressBackupRepository.BackupBox(ctx, userID, boxObjectID, cards, "manual")

	case "bulk":
		if len(cardIDs) == 0 {
			return nil, fmt.Errorf("bulk backup requires card IDs")
		}
		cards, err := service.cardRepository.GetCardsForBackup(ctx, cardIDs)
		if err != nil {
			return nil, fmt.Errorf("failed to get cards: %w", err)
		}
		return service.progressBackupRepository.BackupBulkCards(ctx, userID, cards, "manual", description)

	default:
		return nil, fmt.Errorf("invalid backup type: %s", backupType)
	}
}

// Helper methods for progress-only resets (preserve history)

func (service *ProgressResetService) resetCardProgressOnly(ctx context.Context, cardID string, resetLevel string) error {
	// Get current card
	card, err := service.cardRepository.FindById(ctx, cardID)
	if err != nil {
		return err
	}

	// Reset only intervals and due dates, preserve history
	nextDueDate := time.Now().Add(24 * time.Hour)
	defaultInterval := models.DefaultInteval
	defaultEaseFactor := models.DefaultEaseFactor

	if resetLevel == "review" || resetLevel == "both" {
		card.Review.NextDueDate = &nextDueDate
		card.Review.Interval = defaultInterval
		card.Review.EaseFactor = defaultEaseFactor
		card.Review.LastReviewDate = nil
		card.Review.ReviewsCount = 0
		// Keep ReviewHistory intact
	}

	if resetLevel == "reverse_review" || resetLevel == "both" {
		card.ReverseReview.NextDueDate = &nextDueDate
		card.ReverseReview.Interval = defaultInterval
		card.ReverseReview.EaseFactor = defaultEaseFactor
		card.ReverseReview.LastReviewDate = nil
		card.ReverseReview.ReviewsCount = 0
		// Keep ReviewHistory intact
	}

	card.UpdatedAt = time.Now()

	return service.cardRepository.UpdateCard(ctx, card)
}

func (service *ProgressResetService) resetBoxProgressOnly(ctx context.Context, boxID string, resetLevel string) (int64, error) {
	// This would need a custom implementation in the repository
	// For now, we'll use the complete reset method
	return service.cardRepository.ResetBoxProgress(ctx, boxID, resetLevel)
}

func (service *ProgressResetService) bulkResetCardsProgressOnly(ctx context.Context, cardIDs []string, resetLevel string) ([]string, []string, error) {
	// This would need a custom implementation in the repository
	// For now, we'll use the complete reset method
	return service.cardRepository.BulkResetCardsProgress(ctx, cardIDs, resetLevel)
}
