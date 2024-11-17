package middlewares

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"html"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
)

func CheckCSRFMiddelware(Container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if c.Method() == fiber.MethodGet || c.Method() == fiber.MethodHead || c.Method() == fiber.MethodOptions {
			return c.Next()
		}

		user := c.Locals("user")
		if user == nil {
			return c.Next()
		}

		u, ok := user.(*models.User)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "Invalid user type",
			})
		}

		rawToken := c.FormValue("csrf_token")
		decodedToken := html.UnescapeString(rawToken)

		if decodedToken == "" {
			return c.Next()
		}
		key := "csrf_token:" + u.IDString() + ":" + decodedToken

		storedToken, err := Container.RedisService.Client().Get(c.Context(), key).Result()
	
		if err != nil || decodedToken != storedToken {
			return c.Status(fiber.StatusForbidden).SendString("Invalid CSRF token: " + err.Error())
		} else if err != nil {
			log.Println("Error validating CSRF token:", err)
			return c.Status(fiber.StatusInternalServerError).SendString("Internal error")
		}

		return c.Next()
	}
}

func GenerateCSRFMiddleware(Container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if c.Method() != fiber.MethodGet && c.Method() != fiber.MethodHead && c.Method() != fiber.MethodOptions {
			return c.Next()
		}
		user := c.Locals("user")
		if user == nil {
			return c.Next()
		}

		u, ok := user.(*models.User)
		if ok == false {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "Invalid user type",
			})
		}

		csrfToken, err := generateCSRFToken()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to generate CSRF token")
		}

		key := "csrf_token:" + u.IDString() + ":" + csrfToken

		err = Container.RedisService.Client().SetEX(
			c.Context(),
			key,
			csrfToken,
			time.Minute*60,
		).Err()

		if err != nil {
			return fmt.Errorf("failed to store CSRF token in Redis: %v", err)
		}

		c.Set("X-CSRF-Token", csrfToken)

		c.Locals("csrfToken", csrfToken)

		return c.Next()
	}
}

func generateCSRFToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}
