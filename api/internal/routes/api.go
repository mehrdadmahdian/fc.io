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

	apiHandler := applicationContainer.ApiHandler
	authGroup := apiGroup.Group("/auth")
	authGroup.Post("/login", apiHandler.Login)
	authGroup.Get("/refresh", apiHandler.Refresh)
	authGroup.Post("/register", apiHandler.Register)
	authGroup.Post("/logout", AuthMiddleware, apiHandler.Logout)
	authGroup.Get("/user", AuthMiddleware, apiHandler.User)
	authGroup.Get("/check", AuthMiddleware, api_handlers.Check)

	dashboardGroup := apiGroup.Group("/dashboard").Use(AuthMiddleware)
	dashboardGroup.Get("/boxes", apiHandler.GetBoxInfos)
	dashboardGroup.Get("/boxes/:boxid/review/cards", apiHandler.GetReviewCards)
	dashboardGroup.Post("/boxes/:boxid/review/respond", apiHandler.RespondToReview)
	// dashboardGroup.Get("/boxes/:boxid", apiHandler.GetBox)
	// dashboardGroup.Put("/boxes/:boxid", apiHandler.EditBox)
	// dashboardGroup.Delete("/boxes/:boxid", apiHandler.DeleteBox)
	// dashboardGroup.Post("/boxes/:boxid/special-action", apiHandler.PerformBoxAction)

	dashboardGroup.Post("/boxes/:boxid/cards", apiHandler.CreateCard)
	// dashboardGroup.Get("/boxes/:boxid/cards", apiHandler.GetCards)
	// dashboardGroup.Get("/boxes/:boxid/cards/:cardid", apiHandler.GetCard)
	// dashboardGroup.Put("/boxes/:boxid/cards/:cardid", apiHandler.UpdateCard)
	// dashboardGroup.Delete("/boxes/:boxid/cards/:cardid", apiHandler.DeleteCard)
	// dashboardGroup.Post("/boxes/:boxid/cards/:cardid/action", apiHandler.PerformCardAction)
}
