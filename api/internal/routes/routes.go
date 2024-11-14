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

	WebHandler := applicationContainer.WebHandler

	webGroup := fiberApp.Group("/web")
	webGroup.Get("/", middlewares.GetAuthenticatedUser(applicationContainer), WebHandler.Index)
	webGroup.Get("/health-check", WebHandler.Healthcheck)
	webGroup.Get("/auth/health-check", WebAuthMiddleware, WebHandler.AuthHealthcheck)

	webGroup.Get("auth/login", WebHandler.Login)
	webGroup.Post("auth/login", WebHandler.PostLogin)
	webGroup.Get("auth/register", WebHandler.Register)
	webGroup.Post("auth/register", WebHandler.PostRegister)
	webGroup.Post("auth/logout", WebAuthMiddleware, WebHandler.Logout)

	dashboardGroup := webGroup.Group("/dashboard")
	dashboardGroup.Use(WebAuthMiddleware)
	dashboardGroup.Get("/", WebHandler.Dashboard)
	dashboardGroup.Get("/box/:boxId/card/create", WebHandler.CreateCard)
	dashboardGroup.Post("/box/:boxId/card", WebHandler.StoreCard)
	dashboardGroup.Get("/box/:boxId/card/:cardId", WebHandler.ShowCard)
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
