package web_handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth_service"
)

type WebHandler struct {
	authService *auth_service.AuthService
}

func NewWebHandler(authService *auth_service.AuthService) (*WebHandler, error) {
	return &WebHandler{
		authService: authService,
	}, nil
}

func (handler *WebHandler) Index(c *fiber.Ctx) error {
	return c.Render("index", fiber.Map{
		"User": c.Locals("user"),
	})
}

func (handler *WebHandler) Healthcheck(c *fiber.Ctx) error {
	return c.Render("checks/health-check", nil)
}
