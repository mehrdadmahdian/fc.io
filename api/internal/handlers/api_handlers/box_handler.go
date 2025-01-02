package api_handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

func (handler *ApiHandler) GetBoxInfos(c *fiber.Ctx) error {
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

	userBoxes, err := handler.boxService.RenderUserBoxes(c.Context(), userModel)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get user boxes"), nil)
	}

	dataMap := map[string]interface{}{
		"boxes": userBoxes,
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
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box" + err.Error()), nil)
	}

	cards, err := handler.boxService.GetBoxCardsToReview(c.Context(), box)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get box cards to review"), nil)
	}

	dataMap := map[string]interface{}{
		"boxName": box.Name,
		"totalCards": len(cards),
		"cards": cards,
	}

	return JsonSuccess(
		c,
		utils.PointerString("data is fetched successfully!"),
		&dataMap,
	)
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
			utils.PointerString("invalid request body: " + err.Error()),
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
			utils.PointerString("failed to submit review: " + err.Error()),
			nil,
		)
	}

	return JsonSuccess(
		c,
		utils.PointerString("action is submitted successfully!"),
		nil,
	)
}

