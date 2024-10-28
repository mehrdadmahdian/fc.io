package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/controllers"
)

func SetupRoutes(app *fiber.App) {
	apiGroup := app.Group("/api")
	apiGroup.Get("/ping", controllers.Ping)
}
