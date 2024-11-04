package middlewares

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/handlers"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

func AuthenticationMiddleware(applicationContainer *application.ApplicationContainer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return handlers.JsonFailed(
				c,
				fiber.StatusUnauthorized,
				utils.PointerString("Missing or invalid Authorization header"),
				nil,
			)
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		exists, err := applicationContainer.RedisService.Client().SIsMember(context.Background(), "jwt_blacklist", tokenString).Result()
		if err != nil {
			return handlers.JsonFailed(
				c,
				fiber.StatusInternalServerError,
				utils.PointerString("token validity check failed"),
				nil,
			)
		}

		if exists {
			return handlers.JsonFailed(
				c,
				fiber.StatusUnauthorized,
				utils.PointerString("Unauthorized: Token has been invalidated"),
				nil,
			)
		}

		user, err := applicationContainer.AuthService.GetUserByToken(
			tokenString,
		)

		if err != nil {
			return handlers.JsonFailed(
				c,
				fiber.StatusUnauthorized,
				utils.PointerString("Invalid token provided"),
				nil,
			)
		}

		if user == nil {
			return handlers.JsonFailed(
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
