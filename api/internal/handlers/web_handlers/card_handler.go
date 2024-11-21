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
	box, err := handler.boxService.GetBox(context.TODO(), c.Params("boxID"))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	stages, err := handler.boxService.GetBoxStages(c.Context(), box)
	labels, err := handler.boxService.GetBoxLabels(c.Context(), box)
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	return c.Render("dashboard/boxes/cards/create", fiber.Map{
		"Box":       box,
		"Stages":    stages,
		"Labels":    labels,
		"csrfToken": c.Locals("csrfToken"),
	})
}

func (handler *WebHandler) StoreCard(c *fiber.Ctx) error {
	//todo: check there is card already for that.
	box, err := handler.boxService.GetBox(context.TODO(), c.Params("boxID"))
	stages, err := handler.boxService.GetBoxStages(c.Context(), box)
	labels, err := handler.boxService.GetBoxLabels(c.Context(), box)
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}
	request, err := requests.ParseRequestBody(c, new(requests.StoreCardRequest))
	if err != nil {
		//todo: support old data in the form
		return c.Render("dashboard/boxes/cards/create", fiber.Map{
			"ErrorMessage": "Can not parse the request",
			"Box":          box,
			"Stages":    stages,
			"Labels":    labels,
			"csrfToken": c.Locals("csrfToken"),
		})
	}

	validationErros := requests.Validate(request)
	if validationErros != nil {
		return c.Render("dashboard/boxes/cards/create", fiber.Map{
			"ErrorMessage": utils.MapToString(*validationErros),
			"Box":          box,
			"Stages":    stages,
			"Labels":    labels,
			"csrfToken": c.Locals("csrfToken"),
		})
	}

	card, err := models.NewCard(
		box.IDString(),
		request.StageId,
		request.LabelIds,
		request.Front,
		request.Back,
		request.Extra,
	)

	if err != nil {
		return nil
	}

	err = handler.boxService.AddCard(c.Context(), card)
	if err != nil {
		return c.Render("dashboard/boxes/cards/create", fiber.Map{
			"ErrorMessage": fmt.Sprintf("can not add card to the box."),
			"Box":          box,
			"Stages":    stages,
			"Labels":    labels,
			"csrfToken": c.Locals("csrfToken"),
		})
	}

	return c.Render("dashboard/boxes/cards/create", fiber.Map{
		"Message": "card added to box successfully",
		"Box":     box,
		"Stages":    stages,
		"Labels":    labels,
		"csrfToken": c.Locals("csrfToken"),
	})
}

func (handler *WebHandler) ShowCard(c *fiber.Ctx) error {
	return nil
}
