package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/middlewares"
)

func setupApiRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	ApiCSPMiddleware := middlewares.ApiCSPMiddleware()
	AuthMiddleware := middlewares.AuthMiddleware(applicationContainer.AuthService, applicationContainer.RedisService)
	ErrorMiddleware := middlewares.ErrorHandlingMiddleware(applicationContainer.LoggerService)

	apiGroup := fiberApp.Group("/api")
	apiGroup.Use(ErrorMiddleware) // Apply error handling first
	apiGroup.Use(ApiCSPMiddleware)

	apiGroup.Get("/health-check", api_handlers.Healthcheck)

	apiHandler := applicationContainer.ApiHandler

	// Box routes (alternative paths for backward compatibility)
	boxGroup := apiGroup.Group("/boxes").Use(AuthMiddleware)
	boxGroup.Get("/", apiHandler.GetBoxInfos)
	boxGroup.Post("/", apiHandler.CreateBox)       // POST /api/boxes (for direct creation)
	boxGroup.Post("/create", apiHandler.CreateBox) // POST /api/boxes/create (alternative)
	boxGroup.Get("/:boxid", apiHandler.GetBox)
	boxGroup.Get("/:boxid/cards", apiHandler.GetBoxCards)
	boxGroup.Put("/:boxid", apiHandler.EditBox)
	boxGroup.Delete("/:boxid", apiHandler.DeleteBox)
	boxGroup.Get("/:boxid/review/cards", apiHandler.GetReviewCards)
	boxGroup.Post("/:boxid/review/respond", apiHandler.RespondToReview)
	boxGroup.Post("/:boxid/cards", apiHandler.CreateCard)
	boxGroup.Get("/:boxid/cards/:cardid", apiHandler.GetCardInfo)
	boxGroup.Post("/:boxid/cards/:cardid/archive", apiHandler.ArchiveCard)
	boxGroup.Put("/:boxid/cards/:cardid", apiHandler.UpdateCard)
	boxGroup.Delete("/:boxid/cards/:cardid", apiHandler.DeleteCard)

	authGroup := apiGroup.Group("/auth")
	authGroup.Post("/login", apiHandler.Login)
	authGroup.Get("/refresh", apiHandler.Refresh)
	authGroup.Post("/register", apiHandler.Register)
	authGroup.Post("/logout", AuthMiddleware, apiHandler.Logout)
	authGroup.Get("/user", AuthMiddleware, apiHandler.User)
	authGroup.Get("/check", AuthMiddleware, api_handlers.Check)

	dashboardGroup := apiGroup.Group("/dashboard").Use(AuthMiddleware)
	dashboardGroup.Get("/boxes", apiHandler.GetBoxInfos)
	dashboardGroup.Post("/boxes", apiHandler.CreateBox)
	dashboardGroup.Get("/boxes/active", apiHandler.GetActiveBox)
	dashboardGroup.Get("/boxes/:boxid", apiHandler.GetBox)
	dashboardGroup.Get("/boxes/:boxid/cards", apiHandler.GetBoxCards)
	dashboardGroup.Put("/boxes/:boxid", apiHandler.EditBox)
	dashboardGroup.Delete("/boxes/:boxid", apiHandler.DeleteBox)
	dashboardGroup.Post("/boxes/:boxid/set-active", apiHandler.SetActiveBox)
	dashboardGroup.Get("/boxes/:boxid/review/cards", apiHandler.GetReviewCards)
	dashboardGroup.Post("/boxes/:boxid/review/respond", apiHandler.RespondToReview)

	dashboardGroup.Post("/boxes/:boxid/cards", apiHandler.CreateCard)
	dashboardGroup.Get("/boxes/:boxid/cards/:cardid", apiHandler.GetCardInfo)
	dashboardGroup.Post("/boxes/:boxid/cards/:cardid/archive", apiHandler.ArchiveCard)
	// dashboardGroup.Get("/boxes/:boxid/cards/:cardid", apiHandler.GetCard)
	dashboardGroup.Put("/boxes/:boxid/cards/:cardid", apiHandler.UpdateCard)
	dashboardGroup.Delete("/boxes/:boxid/cards/:cardid", apiHandler.DeleteCard)
	// dashboardGroup.Post("/boxes/:boxid/cards/:cardid/action", apiHandler.PerformCardAction)
}
