package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/middlewares"
)

func setupWebRoutes(fiberApp *fiber.App, applicationContainer *application.Container) {
	WebHandler := applicationContainer.WebHandler

	WebAuthMiddleware := middlewares.WebAuthMiddleware(applicationContainer.AuthService, applicationContainer.RedisService)
	CSPMiddleware := middlewares.CSPMiddleware()
	CheckCSRFMiddleware := middlewares.CheckCSRFMiddelware(applicationContainer.RedisService)
	GenerateCSRFMiddleware := middlewares.GenerateCSRFMiddleware(applicationContainer.RedisService)
	ErrorHandlingMiddleware := middlewares.ErrorHandlingMiddleware(applicationContainer.LoggerService)

	webGroup := fiberApp.Group("/web").Use(ErrorHandlingMiddleware, CSPMiddleware)
	webGroup.Get("/", middlewares.GetAuthenticatedUser(applicationContainer.AuthService, applicationContainer.RedisService), WebHandler.Index)
	webGroup.Get("/privacy", WebHandler.Privacy)
	webGroup.Get("/health-check", WebHandler.Healthcheck)
	webGroup.Get("/auth/health-check", WebAuthMiddleware, WebHandler.AuthHealthcheck)

	webGroup.Get("auth/login", WebHandler.Login)
	webGroup.Post("auth/login", WebHandler.PostLogin)
	webGroup.Get("auth/register", WebHandler.Register)
	webGroup.Post("auth/register", WebHandler.PostRegister)
	webGroup.Post("auth/logout", WebAuthMiddleware, WebHandler.Logout)

	dashboardGroup := webGroup.Group("/dashboard")
	dashboardGroup.Use(WebAuthMiddleware)
	dashboardGroup.Use(CSPMiddleware, GenerateCSRFMiddleware, CheckCSRFMiddleware)
	dashboardGroup.Get("/", WebHandler.Dashboard)

	dashboardGroup.Get("/profile", WebHandler.Profile)
	dashboardGroup.Get("/settings", WebHandler.Settings)

	dashboardGroup.Get("/box/:boxId", WebHandler.ShowBox)

	dashboardGroup.Get("/box/:boxId/card/create", WebHandler.CreateCard)
	dashboardGroup.Post("/box/:boxId/card/store", WebHandler.StoreCard)

	dashboardGroup.Get("/box/:boxId/review", WebHandler.ShowReview)
	dashboardGroup.Post("/box/:boxId/submit-review", WebHandler.SubmitReview)
}
