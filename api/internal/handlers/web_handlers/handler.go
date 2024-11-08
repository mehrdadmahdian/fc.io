package web_handlers

import (
	"github.com/gofiber/fiber/v2"
)

type IndexHandler struct {}

func NewAuthHandler() (*IndexHandler, error) {
	return &IndexHandler{}, nil
}

func (handler *IndexHandler) Index(c *fiber.Ctx) error {
	return c.Render("index", fiber.Map{
		"Title": "Welcome to My Website",
	})
}

func (handler *IndexHandler) Healthcheck(c *fiber.Ctx) error {
	return c.Render("health-check", nil)
}

func (handler *IndexHandler) AuthHealthcheck(c *fiber.Ctx) error {
	user := c.Locals("user")

	if (user != nil) {
		return c.Render("auth-health-check", fiber.Map{
			"User": user, 
		})	
	}

	return fiber.NewError(123, "failed")
}