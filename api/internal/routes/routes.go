package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers"
)

func SetupRoutes(app *fiber.App, applicationContainer *application.ApplicationContainer) {
	apiGroup := app.Group("/api")
	apiGroup.Get("/healthcheck", handlers.Healthcheck)

	authHandler := applicationContainer.GetAuthHandler()
	authGroup := apiGroup.Group("/auth")
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/logout", authHandler.Logout)
	authGroup.Get("/refresh-token", authHandler.RefreshToken)
	authGroup.Post("/register", authHandler.Register)
}
