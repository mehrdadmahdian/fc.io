package audit_service

import (
	"context"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuditService struct {
	auditLogRepository *repositories.AuditLogRepository
}

func NewAuditService(auditLogRepository *repositories.AuditLogRepository) (*AuditService, error) {
	return &AuditService{
		auditLogRepository: auditLogRepository,
	}, nil
}

func (service *AuditService) LogCardMigration(
	ctx context.Context,
	userID primitive.ObjectID,
	cardID primitive.ObjectID,
	sourceBoxID primitive.ObjectID,
	targetBoxID primitive.ObjectID,
	preserveProgress bool,
	ipAddress string,
	userAgent string,
) error {
	auditLog := models.NewAuditLog(
		userID,
		models.AuditActionCardMigration,
		"card",
		cardID,
	)

	auditLog.SetOldValue("box_id", sourceBoxID.Hex())
	auditLog.SetNewValue("box_id", targetBoxID.Hex())
	auditLog.SetMetadata("preserve_progress", preserveProgress)
	auditLog.SetMetadata("migration_type", "single")
	auditLog.IPAddress = ipAddress
	auditLog.UserAgent = userAgent

	return service.auditLogRepository.Insert(ctx, auditLog)
}

func (service *AuditService) LogBulkCardMigration(
	ctx context.Context,
	userID primitive.ObjectID,
	cardIDs []primitive.ObjectID,
	sourceBoxID primitive.ObjectID,
	targetBoxID primitive.ObjectID,
	preserveProgress bool,
	successfulCount int,
	failedCount int,
	ipAddress string,
	userAgent string,
) error {
	// Create a single audit log for the bulk operation
	// Use the first card ID as the entity ID for reference
	var entityID primitive.ObjectID
	if len(cardIDs) > 0 {
		entityID = cardIDs[0]
	} else {
		entityID = primitive.NewObjectID()
	}

	auditLog := models.NewAuditLog(
		userID,
		models.AuditActionCardMigration,
		"card",
		entityID,
	)

	auditLog.SetOldValue("box_id", sourceBoxID.Hex())
	auditLog.SetNewValue("box_id", targetBoxID.Hex())
	auditLog.SetMetadata("preserve_progress", preserveProgress)
	auditLog.SetMetadata("migration_type", "bulk")
	auditLog.SetMetadata("total_cards", len(cardIDs))
	auditLog.SetMetadata("successful_count", successfulCount)
	auditLog.SetMetadata("failed_count", failedCount)
	auditLog.SetMetadata("card_ids", cardIDsToStrings(cardIDs))
	auditLog.IPAddress = ipAddress
	auditLog.UserAgent = userAgent

	return service.auditLogRepository.Insert(ctx, auditLog)
}

func (service *AuditService) LogCardAction(
	ctx context.Context,
	userID primitive.ObjectID,
	cardID primitive.ObjectID,
	action models.AuditLogAction,
	oldValues map[string]interface{},
	newValues map[string]interface{},
	ipAddress string,
	userAgent string,
) error {
	auditLog := models.NewAuditLog(
		userID,
		action,
		"card",
		cardID,
	)

	auditLog.OldValues = oldValues
	auditLog.NewValues = newValues
	auditLog.IPAddress = ipAddress
	auditLog.UserAgent = userAgent

	return service.auditLogRepository.Insert(ctx, auditLog)
}

func (service *AuditService) GetUserAuditLogs(
	ctx context.Context,
	userID primitive.ObjectID,
	limit int,
	offset int,
) ([]*models.AuditLog, error) {
	return service.auditLogRepository.GetByUserID(ctx, userID, limit, offset)
}

func (service *AuditService) GetCardAuditLogs(
	ctx context.Context,
	cardID primitive.ObjectID,
	limit int,
	offset int,
) ([]*models.AuditLog, error) {
	return service.auditLogRepository.GetByEntityID(ctx, cardID, limit, offset)
}

func (service *AuditService) GetMigrationLogs(
	ctx context.Context,
	limit int,
	offset int,
) ([]*models.AuditLog, error) {
	return service.auditLogRepository.GetByAction(ctx, models.AuditActionCardMigration, limit, offset)
}

func (service *AuditService) GetUserAuditLogsByDateRange(
	ctx context.Context,
	userID primitive.ObjectID,
	startDate, endDate time.Time,
	limit int,
	offset int,
) ([]*models.AuditLog, error) {
	return service.auditLogRepository.GetByDateRange(ctx, userID, startDate, endDate, limit, offset)
}

func (service *AuditService) CleanupOldLogs(ctx context.Context, olderThan time.Time) (int64, error) {
	return service.auditLogRepository.DeleteOldLogs(ctx, olderThan)
}

// Helper function to convert ObjectIDs to strings
func cardIDsToStrings(cardIDs []primitive.ObjectID) []string {
	strings := make([]string, len(cardIDs))
	for i, id := range cardIDs {
		strings[i] = id.Hex()
	}
	return strings
}
