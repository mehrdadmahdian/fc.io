package middlewares

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

func AuthMiddleware(Container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return api_handlers.JsonFailed(
				c,
				fiber.StatusUnauthorized,
				utils.PointerString("Missing or invalid Authorization header"),
				nil,
			)
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		exists, err := Container.RedisService.Client().SIsMember(context.Background(), "blacklisted_tokens", tokenString).Result()
		if err != nil {
			return api_handlers.JsonFailed(
				c,
				fiber.StatusInternalServerError,
				utils.PointerString("token validity check failed"),
				nil,
			)
		}

		if exists {
			return api_handlers.JsonFailed(
				c,
				fiber.StatusUnauthorized,
				utils.PointerString("Unauthorized: Token has been invalidated"),
				nil,
			)
		}

		user, err := Container.AuthService.GetUserByToken(
			tokenString,
		)

		if err != nil {
			return api_handlers.JsonFailed(
				c,
				fiber.StatusUnauthorized,
				utils.PointerString("Invalid token provided"),
				nil,
			)
		}

		if user == nil {
			return api_handlers.JsonFailed(
				c,
				fiber.StatusUnauthorized,
				utils.PointerString("Corresponding user has not been found"),
				nil,
			)
		}
		c.Locals("user", user)

		return c.Next()
	}
}
