package api_handlers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (handler *ApiHandler) CreateCard(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.CreateCardRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("unable to parse request"), nil)
	}

	boxID := c.Params("boxid")
	box, err := handler.boxService.GetBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box"), nil)
	}

	emptyLabels := []string{}
	card, err := models.NewCard(
		box.IDString(),
		emptyLabels,
		request.Front,
		request.Back,
		request.Extra,
	)

	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to create card model"), nil)
	}

	err = handler.boxService.AddCard(c.Context(), card)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to add card"), nil)
	}

	return JsonSuccess(c, utils.PointerString("card created successfully"), nil)
}

func (handler *ApiHandler) ArchiveCard(c *fiber.Ctx) error {
	cardID := c.Params("cardid")

	err := handler.cardService.ArchiveCard(
		c.Context(),
		cardID,
	)

	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("failed to archive card: "+err.Error()),
			nil,
		)
	}

	return JsonSuccess(
		c,
		utils.PointerString("card is archived successfully!"),
		nil,
	)
}

func (handler *ApiHandler) GetCardInfo(c *fiber.Ctx) error {
	cardID := c.Params("cardid")

	card, err := handler.cardService.GetCard(c.Context(), cardID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get card"), nil)
	}

	return JsonSuccess(c, utils.PointerString("card fetched successfully"), &map[string]interface{}{
		"card": card,
	})
}

func (handler *ApiHandler) UpdateCard(c *fiber.Ctx) error {
	cardID := c.Params("cardid")

	request, err := requests.ParseRequestBody(c, new(requests.EditCardRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	err = handler.cardService.UpdateCard(c.Context(), cardID, request.Front, request.Back, request.Extra)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to update card"), nil)
	}

	return JsonSuccess(c, utils.PointerString("card updated successfully"), nil)
}

func (handler *ApiHandler) DeleteCard(c *fiber.Ctx) error {
	cardID := c.Params("cardid")

	err := handler.cardService.DeleteCard(c.Context(), cardID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to delete card"), nil)
	}

	return JsonSuccess(c, utils.PointerString("card deleted successfully"), nil)
}

// Card Migration Handlers

func (handler *ApiHandler) MigrateCard(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		utils.LogError(c, handler.loggerService, "MigrateCard",
			fmt.Errorf("user not found in context"), map[string]interface{}{
				"error_type": "authentication_error",
			})
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("user is not set in the lifecycle"),
			nil,
		)
	}

	cardID := c.Params("cardid")

	request, err := requests.ParseRequestBody(c, new(requests.MigrateCardRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	// Validate target box ownership
	targetBox, err := handler.boxService.GetBox(c.Context(), request.TargetBoxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusNotFound, utils.PointerString("target box not found"), nil)
	}

	// Temporary fix: Check if box UserID is zero (data issue) or if it matches current user
	zeroObjectID := primitive.ObjectID{}
	if targetBox.UserID != userModel.ID && targetBox.UserID != zeroObjectID {
		return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("target box does not belong to user"), nil)
	}

	// Get client IP and user agent for audit logging
	ipAddress := c.IP()
	userAgent := c.Get("User-Agent")

	err = handler.cardService.MigrateCard(c.Context(), cardID, request.TargetBoxID, request.PreserveProgress, userModel.ID, ipAddress, userAgent)
	if err != nil {
		utils.LogError(c, handler.loggerService, "MigrateCard", err, map[string]interface{}{
			"card_id":       cardID,
			"target_box_id": request.TargetBoxID,
			"user_id":       userModel.ID.Hex(),
		})
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to migrate card: "+err.Error()), nil)
	}

	utils.LogInfo(c, handler.loggerService, "MigrateCard",
		"Card migrated successfully", map[string]interface{}{
			"card_id":           cardID,
			"target_box_id":     request.TargetBoxID,
			"preserve_progress": request.PreserveProgress,
			"user_id":           userModel.ID.Hex(),
		})

	return JsonSuccess(c, utils.PointerString("card migrated successfully"), &map[string]interface{}{
		"card_id":           cardID,
		"target_box_id":     request.TargetBoxID,
		"preserve_progress": request.PreserveProgress,
	})
}

func (handler *ApiHandler) BulkMigrateCards(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		utils.LogError(c, handler.loggerService, "BulkMigrateCards",
			fmt.Errorf("user not found in context"), map[string]interface{}{
				"error_type": "authentication_error",
			})
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("user is not set in the lifecycle"),
			nil,
		)
	}

	request, err := requests.ParseRequestBody(c, new(requests.BulkMigrateCardsRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	// Validate target box ownership
	targetBox, err := handler.boxService.GetBox(c.Context(), request.TargetBoxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusNotFound, utils.PointerString("target box not found"), nil)
	}

	// Temporary fix: Check if box UserID is zero (data issue) or if it matches current user
	zeroObjectID := primitive.ObjectID{}
	if targetBox.UserID != userModel.ID && targetBox.UserID != zeroObjectID {
		return JsonFailed(c, fiber.StatusForbidden, utils.PointerString("target box does not belong to user"), nil)
	}

	// Get client IP and user agent for audit logging
	ipAddress := c.IP()
	userAgent := c.Get("User-Agent")

	result, err := handler.cardService.BulkMigrateCards(c.Context(), request.CardIDs, request.TargetBoxID, request.PreserveProgress, userModel.ID, ipAddress, userAgent)
	if err != nil {
		utils.LogError(c, handler.loggerService, "BulkMigrateCards", err, map[string]interface{}{
			"card_count":    len(request.CardIDs),
			"target_box_id": request.TargetBoxID,
			"user_id":       userModel.ID.Hex(),
		})
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to migrate cards: "+err.Error()), nil)
	}

	utils.LogInfo(c, handler.loggerService, "BulkMigrateCards",
		"Bulk migration completed", map[string]interface{}{
			"total_requested":  result.TotalRequested,
			"total_successful": result.TotalSuccessful,
			"total_failed":     result.TotalFailed,
			"target_box_id":    request.TargetBoxID,
			"user_id":          userModel.ID.Hex(),
		})

	return JsonSuccess(c, utils.PointerString("bulk migration completed"), &map[string]interface{}{
		"migration_result": result,
	})
}
