package api_handlers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/services/box_service"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

func (handler *ApiHandler) GetBoxInfos(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		utils.LogError(c, handler.loggerService, "GetBoxInfos",
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

	userBoxes, err := handler.boxService.RenderUserBoxes(c.Context(), userModel)
	if err != nil {
		utils.LogError(c, handler.loggerService, "GetBoxInfos", err, map[string]interface{}{
			"error_type": "database_error",
			"user_id":    userModel.ID.Hex(),
		})
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get user boxes"), nil)
	}

	// Log successful operation
	utils.LogInfo(c, handler.loggerService, "GetBoxInfos",
		"Successfully retrieved user boxes", map[string]interface{}{
			"user_id":   userModel.ID.Hex(),
			"box_count": len(userBoxes),
		})

	// Get comprehensive user statistics
	userStats, err := handler.boxService.GetUserStatistics(c.Context(), userModel)
	if err != nil {
		utils.LogError(c, handler.loggerService, "GetBoxInfos", err, map[string]interface{}{
			"error_type": "statistics_error",
			"user_id":    userModel.ID.Hex(),
		})
		// If stats fail, create default stats by counting from userBoxes
		var totalCards, cardsDueToday, cardsNeedingReview int
		for _, boxInfo := range userBoxes {
			totalCards += boxInfo.CountOfTotalCards
			cardsDueToday += boxInfo.CountOfCardsDueToday
			cardsNeedingReview += boxInfo.CountOfCardsNeedingReview
		}

		userStats = &box_service.UserStatistics{
			TotalBoxes:         len(userBoxes),
			TotalCards:         totalCards,
			CardsDueToday:      cardsDueToday,
			CardsNeedingReview: cardsNeedingReview,
			ReviewAccuracy:     0,
			Streak:             0,
		}
	}

	stats := map[string]interface{}{
		"totalBoxes": map[string]interface{}{
			"value": userStats.TotalBoxes,
			"trend": 0, // Could be calculated based on historical data
		},
		"totalCards": map[string]interface{}{
			"value": userStats.TotalCards,
			"trend": 0,
		},
		"todayDue": map[string]interface{}{
			"value": userStats.CardsDueToday,
			"trend": 0,
		},
		"reviewAccuracy": map[string]interface{}{
			"value": int(userStats.ReviewAccuracy),
			"trend": 0,
		},
		"streak": map[string]interface{}{
			"value": userStats.Streak,
			"trend": 0,
		},
	}

	dataMap := map[string]interface{}{
		"boxes": userBoxes,
		"stats": stats,
	}

	return JsonSuccess(
		c,
		utils.PointerString("data is fetched successfully!"),
		&dataMap,
	)
}

func (handler *ApiHandler) GetReviewCards(c *fiber.Ctx) error {
	boxID := c.Params("boxid")
	box, err := handler.boxService.GetBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box"+err.Error()), nil)
	}

	cards, err := handler.boxService.GetBoxCardsToReview(c.Context(), box)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box cards to review"), nil)
	}

	dataMap := map[string]interface{}{
		"boxName":    box.Name,
		"totalCards": len(cards),
		"cards":      cards,
	}

	return JsonSuccess(
		c,
		utils.PointerString("data is fetched successfully!"),
		&dataMap,
	)
}

func (handler *ApiHandler) CreateBox(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("user is not set in the lifecycle"),
			nil,
		)
	}

	request, err := requests.ParseRequestBody(c, new(requests.CreateBoxRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	box := models.NewBox(request.Title, userModel.ID)
	box.Description = request.Description

	err = handler.boxService.CreateBox(c.Context(), box)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to create box"), nil)
	}

	return JsonSuccess(c, utils.PointerString("box created successfully"), &map[string]interface{}{
		"box": box,
	})
}

func (handler *ApiHandler) GetBox(c *fiber.Ctx) error {
	boxID := c.Params("boxid")
	box, err := handler.boxService.GetBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box"), nil)
	}

	return JsonSuccess(c, utils.PointerString("box fetched successfully"), &map[string]interface{}{
		"box": box,
	})
}

func (handler *ApiHandler) GetBoxCards(c *fiber.Ctx) error {
	boxID := c.Params("boxid")
	statusFilter := c.Query("status", "")
	searchQuery := c.Query("search", "")
	sortBy := c.Query("sort_by", "updated_at")
	sortOrder := c.QueryInt("sort_order", -1) // -1 for descending, 1 for ascending

	// Check if pagination parameters are provided
	page := c.QueryInt("page", 0)
	pageSize := c.QueryInt("page_size", 0)

	box, err := handler.boxService.GetBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box"), nil)
	}

	// If pagination parameters are provided, use paginated endpoint
	if page > 0 && pageSize > 0 {
		result, err := handler.boxService.GetBoxCardsPaginated(
			c.Context(),
			box,
			page,
			pageSize,
			statusFilter,
			searchQuery,
			sortBy,
			sortOrder,
		)
		if err != nil {
			return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box cards"), nil)
		}

		return JsonSuccess(c, utils.PointerString("box cards fetched successfully"), &map[string]interface{}{
			"box":   box,
			"cards": result.Cards,
			"pagination": map[string]interface{}{
				"page":        result.Page,
				"page_size":   result.PageSize,
				"total":       result.Total,
				"total_pages": result.TotalPages,
			},
		})
	}

	// Otherwise, use the original non-paginated endpoint for backward compatibility
	cards, err := handler.boxService.GetBoxCards(c.Context(), box, statusFilter)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box cards"), nil)
	}

	return JsonSuccess(c, utils.PointerString("box cards fetched successfully"), &map[string]interface{}{
		"box":   box,
		"cards": cards,
	})
}

func (handler *ApiHandler) EditBox(c *fiber.Ctx) error {
	boxID := c.Params("boxid")

	request, err := requests.ParseRequestBody(c, new(requests.UpdateBoxRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	err = handler.boxService.UpdateBox(c.Context(), boxID, request.Name, request.Description, request.Visibility, request.Tags, request.Language, request.Difficulty)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to update box"), nil)
	}

	// Fetch and return the updated box
	updatedBox, err := handler.boxService.GetBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to fetch updated box"), nil)
	}

	return JsonSuccess(c, utils.PointerString("box updated successfully"), &map[string]interface{}{
		"box": updatedBox,
	})
}

func (handler *ApiHandler) DeleteBox(c *fiber.Ctx) error {
	boxID := c.Params("boxid")

	err := handler.boxService.DeleteBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to delete box"), nil)
	}

	return JsonSuccess(c, utils.PointerString("box deleted successfully"), nil)
}

func (handler *ApiHandler) RespondToReview(c *fiber.Ctx) error {
	//todo: check if the card is in the box
	// boxID := c.Params("boxid")
	// box, err := handler.boxService.GetBox(c.Context(), boxID)
	// if err != nil {
	// 	return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box"), nil)
	// }

	request, err := requests.ParseRequestBody(c, new(requests.RespondToReviewRequest))
	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusBadRequest,
			utils.PointerString("invalid request body: "+err.Error()),
			nil,
		)
	}

	err = handler.boxService.SubmitReview(
		c.Context(),
		request.CardId,
		request.Difficulty,
	)

	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("failed to submit review: "+err.Error()),
			nil,
		)
	}

	return JsonSuccess(
		c,
		utils.PointerString("action is submitted successfully!"),
		nil,
	)
}

func (handler *ApiHandler) SetActiveBox(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("user is not set in the lifecycle"),
			nil,
		)
	}

	boxID := c.Params("boxid")
	err := handler.boxService.SetActiveBox(c.Context(), boxID, userModel)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to set active box"), nil)
	}

	return JsonSuccess(c, utils.PointerString("box set as active successfully"), nil)
}

func (handler *ApiHandler) GetActiveBox(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("user is not set in the lifecycle"),
			nil,
		)
	}

	activeBox, err := handler.boxService.GetActiveBox(c.Context(), userModel)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get active box"), nil)
	}

	if activeBox == nil {
		return JsonSuccess(c, utils.PointerString("no active box found"), &map[string]interface{}{
			"activeBox": nil,
		})
	}

	return JsonSuccess(c, utils.PointerString("active box retrieved successfully"), &map[string]interface{}{
		"activeBox": activeBox,
	})
}

// Reverse review methods

func (handler *ApiHandler) GetReverseReviewCards(c *fiber.Ctx) error {
	boxID := c.Params("boxid")
	box, err := handler.boxService.GetBox(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box"+err.Error()), nil)
	}

	cards, err := handler.boxService.GetBoxCardsToReverseReview(c.Context(), box)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box cards to reverse review"), nil)
	}

	dataMap := map[string]interface{}{
		"boxName":    box.Name,
		"totalCards": len(cards),
		"cards":      cards,
	}

	return JsonSuccess(c, utils.PointerString("cards for reverse review fetched successfully"), &dataMap)
}

func (handler *ApiHandler) RespondToReverseReview(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.RespondToReviewRequest))
	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusBadRequest,
			utils.PointerString("invalid request body: "+err.Error()),
			nil,
		)
	}

	err = handler.boxService.SubmitReverseReview(
		c.Context(),
		request.CardId,
		request.Difficulty,
	)

	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("failed to submit reverse review: "+err.Error()),
			nil,
		)
	}

	return JsonSuccess(
		c,
		utils.PointerString("reverse review action is submitted successfully!"),
		nil,
	)
}

// Global review handlers - review cards from all boxes

func (handler *ApiHandler) GetGlobalReviewCards(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		utils.LogError(c, handler.loggerService, "GetGlobalReviewCards",
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

	cards, err := handler.boxService.GetAllUserCardsToReview(c.Context(), userModel)
	if err != nil {
		utils.LogError(c, handler.loggerService, "GetGlobalReviewCards", err, map[string]interface{}{
			"error_type": "service_error",
			"user_id":    userModel.ID.Hex(),
		})
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get global review cards"), nil)
	}

	utils.LogInfo(c, handler.loggerService, "GetGlobalReviewCards",
		"Successfully retrieved global review cards", map[string]interface{}{
			"user_id":     userModel.ID.Hex(),
			"cards_count": len(cards),
		})

	dataMap := map[string]interface{}{
		"totalCards": len(cards),
		"cards":      cards,
		"mode":       "global",
	}

	return JsonSuccess(
		c,
		utils.PointerString("global review cards fetched successfully!"),
		&dataMap,
	)
}

func (handler *ApiHandler) GetGlobalReverseReviewCards(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		utils.LogError(c, handler.loggerService, "GetGlobalReverseReviewCards",
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

	cards, err := handler.boxService.GetAllUserCardsToReverseReview(c.Context(), userModel)
	if err != nil {
		utils.LogError(c, handler.loggerService, "GetGlobalReverseReviewCards", err, map[string]interface{}{
			"error_type": "service_error",
			"user_id":    userModel.ID.Hex(),
		})
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get global reverse review cards"), nil)
	}

	utils.LogInfo(c, handler.loggerService, "GetGlobalReverseReviewCards",
		"Successfully retrieved global reverse review cards", map[string]interface{}{
			"user_id":     userModel.ID.Hex(),
			"cards_count": len(cards),
		})

	dataMap := map[string]interface{}{
		"totalCards": len(cards),
		"cards":      cards,
		"mode":       "global_reverse",
	}

	return JsonSuccess(c, utils.PointerString("global reverse review cards fetched successfully"), &dataMap)
}

// GetGlobalReviewCardsCount returns only the count of cards available for global review
func (handler *ApiHandler) GetGlobalReviewCardsCount(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		utils.LogError(c, handler.loggerService, "GetGlobalReviewCardsCount",
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

	count, err := handler.boxService.GetGlobalReviewCardsCount(c.Context(), userModel)
	if err != nil {
		utils.LogError(c, handler.loggerService, "GetGlobalReviewCardsCount", err, map[string]interface{}{
			"error_type": "service_error",
			"user_id":    userModel.ID.Hex(),
		})
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get global review cards count"), nil)
	}

	utils.LogInfo(c, handler.loggerService, "GetGlobalReviewCardsCount",
		"Successfully retrieved global review cards count", map[string]interface{}{
			"user_id":     userModel.ID.Hex(),
			"cards_count": count,
		})

	dataMap := map[string]interface{}{
		"totalCards": count,
	}

	return JsonSuccess(
		c,
		utils.PointerString("global review cards count fetched successfully!"),
		&dataMap,
	)
}
