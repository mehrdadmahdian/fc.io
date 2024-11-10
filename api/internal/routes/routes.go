package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/middlewares"
)

func SetupRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	setupApiRoutes(fiberApp, applicationContainer)
	setupWebRoutes(fiberApp, applicationContainer)
}

func setupWebRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	WebAuthMiddleware := middlewares.WebAuthMiddleware(applicationContainer)

	PageHandler := applicationContainer.WebPageHandler

	webGroup := fiberApp.Group("/web")
	webGroup.Get("/", middlewares.GetAuthenticatedUser(applicationContainer), PageHandler.Index)
	webGroup.Get("/health-check", PageHandler.Healthcheck)
	webGroup.Get("/auth/health-check", WebAuthMiddleware, PageHandler.AuthHealthcheck)

	webGroup.Get("auth/login", PageHandler.Login)
	webGroup.Post("auth/login", PageHandler.PostLogin)
	webGroup.Get("auth/register", PageHandler.Register)
	webGroup.Post("auth/register", PageHandler.PostRegister)
	webGroup.Post("auth/logout", WebAuthMiddleware, PageHandler.Logout)

	webGroup.Get("/dashboard", WebAuthMiddleware, PageHandler.Dashboard)
}

func setupApiRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	AuthMiddleware := middlewares.AuthMiddleware(applicationContainer)
	apiGroup := fiberApp.Group("/api")
	apiGroup.Get("/health-check", api_handlers.Healthcheck)

	authHandler := applicationContainer.ApiAuthHandler
	authGroup := apiGroup.Group("/auth")
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/logout", AuthMiddleware, authHandler.Logout)
	authGroup.Get("/refresh-token", authHandler.RefreshToken)
	authGroup.Post("/register", authHandler.Register)
	authGroup.Get("/check", AuthMiddleware, api_handlers.AuthCheck)

	boxGroup := apiGroup.Group("/boxes").Use(AuthMiddleware)
	boxGroup.Get("/", api_handlers.AuthCheck)
	boxGroup.Post("/", api_handlers.AuthCheck)
	boxGroup.Get("/:id", api_handlers.AuthCheck)
	boxGroup.Put("/:id", api_handlers.AuthCheck)
	boxGroup.Delete("/:id", api_handlers.AuthCheck)

	cardGroup := boxGroup.Group("/cards")
	cardGroup.Get("/", api_handlers.AuthCheck)
	cardGroup.Post("/", api_handlers.AuthCheck)
	cardGroup.Get("/:id", api_handlers.AuthCheck)
	cardGroup.Put("/:id", api_handlers.AuthCheck)
	cardGroup.Delete("/:id", api_handlers.AuthCheck)

	stageGroup := boxGroup.Group("/stages")
	stageGroup.Get("/", api_handlers.AuthCheck)
	stageGroup.Post("/", api_handlers.AuthCheck)
	stageGroup.Get("/:id", api_handlers.AuthCheck)
	stageGroup.Put("/:id", api_handlers.AuthCheck)
	stageGroup.Delete("/:id", api_handlers.AuthCheck)
}
