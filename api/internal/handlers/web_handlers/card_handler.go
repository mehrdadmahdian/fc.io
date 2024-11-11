package web_handlers

import (
	"context"

	"github.com/gofiber/fiber/v2"
)

func (handler *WebHandler) CreateCard(c *fiber.Ctx) error {
	//TODO: check user has access to box
	box, err := handler.boxService.GetBox(context.TODO(), c.Params("boxID"))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	return c.Render("dashboard/boxes/cards/create", fiber.Map{
		"BoxId":          box.ID,
		"BoxName":        box.Name,
		"BoxDescription": box.Description,
		"Stages":         box.Stages,
	})
}

func (handler *WebHandler) StoreCard(c *fiber.Ctx) error {
	//TODO: check user has access to box
	return nil
}

func (handler *WebHandler) ShowCard(c *fiber.Ctx) error {
	return nil
}
