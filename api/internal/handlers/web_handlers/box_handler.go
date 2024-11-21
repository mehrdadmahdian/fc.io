package web_handlers

import (
	"github.com/gofiber/fiber/v2"
)

func (handler *WebHandler) CreateBox(c *fiber.Ctx) error {
	return nil
}

func (handler *WebHandler) StoreBox(c *fiber.Ctx) error {
	return nil
}

func (handler *WebHandler) ShowBox(c *fiber.Ctx) error {
	mybox, err := handler.boxService.GetBox(c.Context(), c.Params("boxID"))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	cards, err := handler.boxService.GetCards(c.Context(), mybox)
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	return c.Render("dashboard/boxes/index", fiber.Map{
		"cards": cards,
	})
}
