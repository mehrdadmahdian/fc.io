package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
)

func SetupRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	setupApiRoutes(fiberApp, applicationContainer)
	setupWebRoutes(fiberApp, applicationContainer)
}
