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
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/logout", AuthMiddleware, authHandler.Logout)
	authGroup.Get("/refresh-token", authHandler.RefreshToken)
	authGroup.Post("/register", authHandler.Register)
	authGroup.Get("/check", AuthMiddleware, handlers.AuthCheck)

	boxGroup := apiGroup.Group("/boxes").Use(AuthMiddleware)
	boxGroup.Get("/", handlers.AuthCheck)
	boxGroup.Post("/", handlers.AuthCheck)
	boxGroup.Get("/:id", handlers.AuthCheck)
	boxGroup.Put("/:id", handlers.AuthCheck)
	boxGroup.Delete("/:id", handlers.AuthCheck)

	cardGroup := boxGroup.Group("/cards")
	cardGroup.Get("/", handlers.AuthCheck)
	cardGroup.Post("/", handlers.AuthCheck)
	cardGroup.Get("/:id", handlers.AuthCheck)
	cardGroup.Put("/:id", handlers.AuthCheck)
	cardGroup.Delete("/:id", handlers.AuthCheck)

	stageGroup := boxGroup.Group("/stages")
	stageGroup.Get("/", handlers.AuthCheck)
	stageGroup.Post("/", handlers.AuthCheck)
	stageGroup.Get("/:id", handlers.AuthCheck)
	stageGroup.Put("/:id", handlers.AuthCheck)
	stageGroup.Delete("/:id", handlers.AuthCheck)

}
