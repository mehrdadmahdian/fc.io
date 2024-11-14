package web_handlers

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

func (handler *WebHandler) CreateCard(c *fiber.Ctx) error {
	//TODO: check user has access to box
	box, err := handler.boxService.GetBox(context.TODO(), c.Params("boxID"))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	return c.Render("dashboard/boxes/cards/create", fiber.Map{
		"Box": box,
	})
}

func (handler *WebHandler) StoreCard(c *fiber.Ctx) error {
	//todo: check there is card already for that. 
	box, err := handler.boxService.GetBox(context.TODO(), c.Params("boxID"))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}
	request, err := requests.ParseRequestBody(c, new(requests.StoreCardRequest))
	if err != nil {
		//todo: support old data in the form
		return c.Render("dashboard/boxes/cards/create", fiber.Map{
			"ErrorMessage": "Can not parse the request",
			"Box":          box,
		})
	}

	validationErros := requests.Validate(request)
	if validationErros != nil {
		return c.Render("dashboard/boxes/cards/create", fiber.Map{
			"ErrorMessage": utils.MapToString(*validationErros),
			"Box":          box,
		})
	}

	card, err := models.NewCard(
		request.Front,
		request.Back,
		request.Extra,
		request.StageId,
	)
	if err != nil {
		return nil
	}

	err = handler.boxService.AddCardToBox(c.Context(), box, card)
	if (err != nil) {
		return c.Render("dashboard/boxes/cards/create", fiber.Map{
			"ErrorMessage": fmt.Sprintf("can not add card to the box."),
			"Box":          box,
		})
	}

	return c.Render("dashboard/boxes/cards/create", fiber.Map{
		"Message": "card added to box successfully",
		"Box":          box,
	})
}

func (handler *WebHandler) ShowCard(c *fiber.Ctx) error {
	return nil
}
