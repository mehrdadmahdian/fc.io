package routes

import (
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	apiGroup := app.Group("/api")
	apiGroup.Get("/ping", func(c *fiber.Ctx) error {
		c.Status(fiber.StatusOK)
		response := fiber.Map{
			"message" : "Pong", 
		}

		err := c.JSON(response)

		return err
	})

}
