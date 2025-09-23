package routes

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/middlewares"
)

// buildAllowedOrigins creates a dynamic list of allowed origins based on environment
func buildAllowedOrigins() string {
	baseOrigins := []string{
		"http://localhost",
		"http://127.0.0.1",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	}

	// Add server-specific origins from environment variables
	serverName := os.Getenv("SERVER_NAME")
	if serverName != "" {
		baseOrigins = append(baseOrigins,
			"http://"+serverName,
			"https://"+serverName,
		)
	}

	// Add custom origins from environment variable (comma-separated)
	customOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if customOrigins != "" {
		origins := strings.Split(customOrigins, ",")
		for _, origin := range origins {
			baseOrigins = append(baseOrigins, strings.TrimSpace(origin))
		}
	}

	return strings.Join(baseOrigins, ",")
}

func setupApiRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	ApiCSPMiddleware := middlewares.ApiCSPMiddleware()
	AuthMiddleware := middlewares.AuthMiddleware(applicationContainer.AuthService, applicationContainer.RedisService)
	ErrorMiddleware := middlewares.ErrorHandlingMiddleware(applicationContainer.LoggerService)

	apiGroup := fiberApp.Group("/api")

	// Add CORS middleware specifically for API routes
	apiGroup.Use(cors.New(cors.Config{
		AllowOrigins:     buildAllowedOrigins(),
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With",
		AllowCredentials: true,
	}))

	apiGroup.Use(ErrorMiddleware) // Apply error handling first
	apiGroup.Use(ApiCSPMiddleware)

	apiGroup.Get("/health-check", api_handlers.Healthcheck)

	apiHandler := applicationContainer.ApiHandler
	socialHandler := api_handlers.NewSocialHandler(applicationContainer.SocialService)

	// Social routes
	socialGroup := apiGroup.Group("/social").Use(AuthMiddleware)

	// User following
	socialGroup.Post("/users/:id/follow", socialHandler.FollowUser)
	socialGroup.Delete("/users/:id/follow", socialHandler.UnfollowUser)
	socialGroup.Get("/users/:id/profile", socialHandler.GetUserProfile)
	socialGroup.Get("/users/search", socialHandler.SearchUsers)

	// Box social features
	socialGroup.Post("/boxes/:id/fork", socialHandler.ForkBox)
	socialGroup.Post("/boxes/:id/rate", socialHandler.RateBox)
	socialGroup.Get("/boxes/public", socialHandler.GetPublicBoxes)

	// Activity feed
	socialGroup.Get("/feed", socialHandler.GetPersonalizedFeed)

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
	boxGroup.Get("/:boxid/review/reverse/cards", apiHandler.GetReverseReviewCards)
	boxGroup.Post("/:boxid/review/reverse/respond", apiHandler.RespondToReverseReview)
	boxGroup.Post("/:boxid/cards", apiHandler.CreateCard)
	boxGroup.Get("/:boxid/cards/:cardid", apiHandler.GetCardInfo)
	boxGroup.Post("/:boxid/cards/:cardid/archive", apiHandler.ArchiveCard)
	boxGroup.Put("/:boxid/cards/:cardid", apiHandler.UpdateCard)
	boxGroup.Delete("/:boxid/cards/:cardid", apiHandler.DeleteCard)
	boxGroup.Post("/:boxid/cards/:cardid/migrate", apiHandler.MigrateCard)

	// Bulk migration endpoint
	boxGroup.Post("/cards/bulk-migrate", apiHandler.BulkMigrateCards)

	// Progress reset endpoints
	boxGroup.Post("/:boxid/cards/:cardid/reset-progress", apiHandler.ResetCardProgress)
	boxGroup.Post("/:boxid/reset-progress", apiHandler.ResetBoxProgress)
	boxGroup.Post("/cards/bulk-reset", apiHandler.BulkResetCardsProgress)

	// Progress backup and restore endpoints
	progressGroup := apiGroup.Group("/progress").Use(AuthMiddleware)
	progressGroup.Post("/backup", apiHandler.CreateBackup)
	progressGroup.Post("/restore", apiHandler.RestoreFromBackup)
	progressGroup.Get("/backup-history", apiHandler.GetBackupHistory)
	progressGroup.Get("/reset-history", apiHandler.GetResetHistory)
	progressGroup.Delete("/backups/:backupid", apiHandler.DeleteBackup)

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
	dashboardGroup.Get("/boxes/:boxid/review/reverse/cards", apiHandler.GetReverseReviewCards)
	dashboardGroup.Post("/boxes/:boxid/review/reverse/respond", apiHandler.RespondToReverseReview)

	// Global review endpoints (all boxes together)
	dashboardGroup.Get("/review/global/cards", apiHandler.GetGlobalReviewCards)
	dashboardGroup.Get("/review/global/reverse/cards", apiHandler.GetGlobalReverseReviewCards)

	dashboardGroup.Post("/boxes/:boxid/cards", apiHandler.CreateCard)
	dashboardGroup.Get("/boxes/:boxid/cards/:cardid", apiHandler.GetCardInfo)
	dashboardGroup.Post("/boxes/:boxid/cards/:cardid/archive", apiHandler.ArchiveCard)
	// dashboardGroup.Get("/boxes/:boxid/cards/:cardid", apiHandler.GetCard)
	dashboardGroup.Put("/boxes/:boxid/cards/:cardid", apiHandler.UpdateCard)
	dashboardGroup.Delete("/boxes/:boxid/cards/:cardid", apiHandler.DeleteCard)
	dashboardGroup.Post("/boxes/:boxid/cards/:cardid/migrate", apiHandler.MigrateCard)

	// Bulk migration endpoint
	dashboardGroup.Post("/cards/bulk-migrate", apiHandler.BulkMigrateCards)

	// Progress reset endpoints
	dashboardGroup.Post("/boxes/:boxid/cards/:cardid/reset-progress", apiHandler.ResetCardProgress)
	dashboardGroup.Post("/boxes/:boxid/reset-progress", apiHandler.ResetBoxProgress)
	dashboardGroup.Post("/cards/bulk-reset", apiHandler.BulkResetCardsProgress)
	// dashboardGroup.Post("/boxes/:boxid/cards/:cardid/action", apiHandler.PerformCardAction)
}
