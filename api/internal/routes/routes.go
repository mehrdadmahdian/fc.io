package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/middlewares"
)

func SetupRoutes(app *fiber.App, applicationContainer *application.ApplicationContainer) {
	AuthMiddleware := middlewares.AuthenticationMiddleware(applicationContainer)
	apiGroup := app.Group("/api")
	apiGroup.Get("/health-check", handlers.Healthcheck)
	
	authHandler := applicationContainer.AuthHandler
	authGroup := apiGroup.Group("/auth")
	authGroup.Get("/check", AuthMiddleware, handlers.AuthCheck)
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/logout", authHandler.Logout)
	authGroup.Get("/refresh-token", authHandler.RefreshToken)
	authGroup.Post("/register", authHandler.Register)

}
