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
		return nil
	}

	err = handler.boxService.AddCard(c.Context(), card)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to add card"), nil)
	}

	return JsonSuccess(c, utils.PointerString("card created successfully"), nil)
}
