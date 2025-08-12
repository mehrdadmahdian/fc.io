package api_handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
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
