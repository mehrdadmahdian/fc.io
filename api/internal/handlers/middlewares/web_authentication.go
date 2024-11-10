package middlewares

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
)


func WebAuthMiddleware(Container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("token")
		if tokenString == "" {
			return c.Redirect("/web/auth/login", 302)
		}

		exists, err := Container.RedisService.Client().SIsMember(context.Background(), "blacklisted_tokens", tokenString).Result()
		if err != nil {
			return c.Redirect("/web/auth/login", 302)
		}

		if exists {
			return c.Redirect("/web/auth/login", 302)
		}

		user, err := Container.AuthService.GetUserByToken(
			tokenString,
		)

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

func GetAuthenticatedUser(Container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("token")
		if tokenString == "" {
			return c.Next()
		}

		exists, err := Container.RedisService.Client().SIsMember(context.Background(), "blacklisted_tokens", tokenString).Result()
		if err != nil {
			return c.Next()
		}

		if exists {
			return c.Next()
		}

		user, err := Container.AuthService.GetUserByToken(
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
