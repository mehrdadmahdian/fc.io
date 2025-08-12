package middlewares

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis_service"
)

func WebAuthMiddleware(authService *auth_service.AuthService, redisService *redis_service.RedisService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("token")
		if tokenString == "" {
			return c.Redirect("/web/auth/login", 302)
		}

		exists, err := redisService.Client().SIsMember(context.Background(), "blacklisted_tokens", tokenString).Result()
		if err != nil {
			return c.Redirect("/web/auth/login", 302)
		}

		if exists {
			return c.Redirect("/web/auth/login", 302)
		}

		user, err := authService.GetUserByToken(tokenString)

		if err != nil {
			return c.Redirect("/web/auth/login", 302)
		}

		if user == nil {
			return c.Redirect("/web/auth/login", 302)
		}

		c.Locals("user", user)

		return c.Next()
	}
}

func GetAuthenticatedUser(authService *auth_service.AuthService, redisService *redis_service.RedisService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("token")
		if tokenString == "" {
			return c.Next()
		}

		exists, err := redisService.Client().SIsMember(context.Background(), "blacklisted_tokens", tokenString).Result()
		if err != nil {
			return c.Next()
		}

		if exists {
			return c.Next()
		}

		user, err := authService.GetUserByToken(
			tokenString,
		)

		if err != nil {
			return c.Next()
		}

		if user == nil {
			return c.Next()
		}

		c.Locals("user", user)

		return c.Next()
	}
}
