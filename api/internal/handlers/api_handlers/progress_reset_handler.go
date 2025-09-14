package api_handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ResetCardProgress resets progress for a single card
func (handler *ApiHandler) ResetCardProgress(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	cardID := c.Params("cardid")

	request, err := requests.ParseRequestBody(c, new(requests.ResetCardProgressRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	// Validate card ownership
	err = handler.cardService.ValidateCardOwnership(c.Context(), cardID, userModel.ID)
	if err != nil {
		return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("card does not belong to user"), nil)
	}

	// Get client IP and user agent for audit logging
	ipAddress := c.IP()
	userAgent := c.Get("User-Agent")

	// Perform reset
	result, err := handler.progressResetService.ResetCardProgress(
		c.Context(),
		cardID,
		request.ResetLevel,
		request.ResetType,
		userModel.ID,
		request.CreateBackup,
		request.Reason,
		ipAddress,
		userAgent,
	)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to reset card progress"), nil)
	}

	responseData := map[string]interface{}{
		"successful_resets": result.SuccessfulResets,
		"failed_resets":     result.FailedResets,
		"total_requested":   result.TotalRequested,
		"total_successful":  result.TotalSuccessful,
		"total_failed":      result.TotalFailed,
		"backup_id":         result.BackupID,
	}
	return JsonSuccess(c, utils.PointerString("Card progress reset successfully"), &responseData)
}

// ResetBoxProgress resets progress for all cards in a box
func (handler *ApiHandler) ResetBoxProgress(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	boxID := c.Params("boxid")

	request, err := requests.ParseRequestBody(c, new(requests.ResetBoxProgressRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	// Validate box ownership
	targetBox, err := handler.boxService.GetBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusNotFound, utils.PointerString("box not found"), nil)
	}

	// Temporary fix: Check if box UserID is zero (data issue) or if it matches current user
	zeroObjectID := primitive.ObjectID{}
	if targetBox.UserID != userModel.ID && targetBox.UserID != zeroObjectID {
		return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("box does not belong to user"), nil)
	}

	// Get client IP and user agent for audit logging
	ipAddress := c.IP()
	userAgent := c.Get("User-Agent")

	// Perform reset
	result, err := handler.progressResetService.ResetBoxProgress(
		c.Context(),
		boxID,
		request.ResetLevel,
		request.ResetType,
		userModel.ID,
		request.CreateBackup,
		request.Reason,
		ipAddress,
		userAgent,
	)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to reset box progress"), nil)
	}

	responseData := map[string]interface{}{
		"successful_resets": result.SuccessfulResets,
		"failed_resets":     result.FailedResets,
		"total_requested":   result.TotalRequested,
		"total_successful":  result.TotalSuccessful,
		"total_failed":      result.TotalFailed,
		"backup_id":         result.BackupID,
	}
	return JsonSuccess(c, utils.PointerString("Box progress reset successfully"), &responseData)
}

// BulkResetCardsProgress resets progress for multiple cards
func (handler *ApiHandler) BulkResetCardsProgress(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	request, err := requests.ParseRequestBody(c, new(requests.BulkResetCardsRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	// Validate all cards belong to the user
	for _, cardID := range request.CardIDs {
		err := handler.cardService.ValidateCardOwnership(c.Context(), cardID, userModel.ID)
		if err != nil {
			return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("one or more cards do not belong to user"), nil)
		}
	}

	// Get client IP and user agent for audit logging
	ipAddress := c.IP()
	userAgent := c.Get("User-Agent")

	// Perform bulk reset
	result, err := handler.progressResetService.BulkResetCardsProgress(
		c.Context(),
		request.CardIDs,
		request.ResetLevel,
		request.ResetType,
		userModel.ID,
		request.CreateBackup,
		request.Reason,
		request.Description,
		ipAddress,
		userAgent,
	)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to reset cards progress"), nil)
	}

	responseData := map[string]interface{}{
		"successful_resets": result.SuccessfulResets,
		"failed_resets":     result.FailedResets,
		"total_requested":   result.TotalRequested,
		"total_successful":  result.TotalSuccessful,
		"total_failed":      result.TotalFailed,
		"backup_id":         result.BackupID,
	}
	return JsonSuccess(c, utils.PointerString("Cards progress reset successfully"), &responseData)
}

// RestoreFromBackup restores progress from a backup
func (handler *ApiHandler) RestoreFromBackup(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	request, err := requests.ParseRequestBody(c, new(requests.RestoreFromBackupRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	// Get client IP and user agent for audit logging
	ipAddress := c.IP()
	userAgent := c.Get("User-Agent")

	// Perform restore
	result, err := handler.progressResetService.RestoreFromBackup(
		c.Context(),
		request.BackupID,
		userModel.ID,
		ipAddress,
		userAgent,
	)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to restore from backup"), nil)
	}

	responseData := map[string]interface{}{
		"successful_restores": result.SuccessfulRestores,
		"failed_restores":     result.FailedRestores,
		"total_requested":     result.TotalRequested,
		"total_successful":    result.TotalSuccessful,
		"total_failed":        result.TotalFailed,
	}
	return JsonSuccess(c, utils.PointerString("Progress restored successfully"), &responseData)
}

// CreateBackup creates a manual backup
func (handler *ApiHandler) CreateBackup(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	request, err := requests.ParseRequestBody(c, new(requests.CreateBackupRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	// Validate ownership based on backup type
	switch request.BackupType {
	case "card":
		if len(request.CardIDs) != 1 {
			return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("card backup requires exactly one card ID"), nil)
		}
		err := handler.cardService.ValidateCardOwnership(c.Context(), request.CardIDs[0], userModel.ID)
		if err != nil {
			return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("card does not belong to user"), nil)
		}
	case "box":
		if request.BoxID == "" {
			return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("box backup requires box ID"), nil)
		}
		targetBox, err := handler.boxService.GetBox(c.Context(), request.BoxID)
		if err != nil {
			return JsonFailed(c, fiber.StatusNotFound, utils.PointerString("box not found"), nil)
		}
		// Temporary fix: Check if box UserID is zero (data issue) or if it matches current user
		zeroObjectID := primitive.ObjectID{}
		if targetBox.UserID != userModel.ID && targetBox.UserID != zeroObjectID {
			return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("box does not belong to user"), nil)
		}
	case "bulk":
		if len(request.CardIDs) == 0 {
			return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("bulk backup requires card IDs"), nil)
		}
		for _, cardID := range request.CardIDs {
			err := handler.cardService.ValidateCardOwnership(c.Context(), cardID, userModel.ID)
			if err != nil {
				return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("one or more cards do not belong to user"), nil)
			}
		}
	}

	// Create backup
	backup, err := handler.progressResetService.CreateManualBackup(
		c.Context(),
		userModel.ID,
		request.BackupType,
		request.Description,
		request.CardIDs,
		request.BoxID,
	)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to create backup"), nil)
	}

	responseData := map[string]interface{}{
		"id":            backup.IDString(),
		"backup_type":   backup.BackupType,
		"description":   backup.Description,
		"created_at":    backup.CreatedAt,
		"total_cards":   backup.TotalCards,
		"backup_reason": backup.BackupReason,
	}
	return JsonSuccess(c, utils.PointerString("Backup created successfully"), &responseData)
}

// GetBackupHistory returns backup history for the user
func (handler *ApiHandler) GetBackupHistory(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	// Parse query parameters
	limitStr := c.Query("limit", "20")
	offsetStr := c.Query("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get backup history
	backups, err := handler.progressResetService.GetBackupHistory(c.Context(), userModel.ID, limit, offset)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get backup history"), nil)
	}

	responseData := map[string]interface{}{
		"backups": backups,
		"limit":   limit,
		"offset":  offset,
		"count":   len(backups),
	}
	return JsonSuccess(c, utils.PointerString("Backup history retrieved successfully"), &responseData)
}

// GetResetHistory returns reset history for the user
func (handler *ApiHandler) GetResetHistory(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	// Parse query parameters
	limitStr := c.Query("limit", "20")
	offsetStr := c.Query("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get reset history
	resets, err := handler.progressResetService.GetResetHistory(c.Context(), userModel.ID, limit, offset)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get reset history"), nil)
	}

	responseData := map[string]interface{}{
		"resets": resets,
		"limit":  limit,
		"offset": offset,
		"count":  len(resets),
	}
	return JsonSuccess(c, utils.PointerString("Reset history retrieved successfully"), &responseData)
}

// DeleteBackup deletes a backup
func (handler *ApiHandler) DeleteBackup(c *fiber.Ctx) error {
	userModel, ok := c.Locals("user").(*models.User)
	if !ok {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("unauthorized"), nil)
	}

	backupID := c.Params("backupid")

	// Delete backup
	err := handler.progressResetService.DeleteBackup(c.Context(), backupID, userModel.ID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to delete backup"), nil)
	}

	return JsonSuccess(c, utils.PointerString("Backup deleted successfully"), nil)
}
