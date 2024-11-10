package web_handlers

import (
	"github.com/gofiber/fiber/v2"
)

func (handler *WebHandler) Dashboard(c *fiber.Ctx) error {
	return c.Render("dashboard/index", fiber.Map{
		"User": c.Locals("user"),
	})

}
