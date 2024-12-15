package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/middlewares"
)

func setupApiRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	ApiCSPMiddleware := middlewares.CSPMiddleware(applicationContainer)
	AuthMiddleware := middlewares.AuthMiddleware(applicationContainer)

	apiGroup := fiberApp.Group("/api")
	apiGroup.Use(ApiCSPMiddleware)

	apiGroup.Get("/health-check", api_handlers.Healthcheck)

	authHandler := applicationContainer.ApiAuthHandler
	authGroup := apiGroup.Group("/auth")
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/logout", AuthMiddleware, authHandler.Logout)
	authGroup.Get("/refresh", authHandler.Refresh)
	authGroup.Post("/register", authHandler.Register)
	authGroup.Get("/check", AuthMiddleware, api_handlers.Check)

	apiGroup.Group("/boxes").Use(AuthMiddleware)
}
