package middlewares

import (
	"crypto/rand"
	"encoding/base64"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
)

func generateNonce() string {
	nonce := make([]byte, 16) // 16 random bytes
	_, err := rand.Read(nonce)
	if err != nil {
		log.Fatal(err)
	}
	return base64.StdEncoding.EncodeToString(nonce) // Return base64 encoded nonce
}

func CSPMiddleware(Container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		//todo: to allow inline scripting I commented this logic. I should find a solution for it.
		// nonce := generateNonce()
		// c.Set("Content-Security-Policy", fmt.Sprintf("script-src 'self' 'nonce-%s'", nonce))
		return c.Next()
	}
}

func ApiCSPMiddleware(Container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Set("Content-Security-Policy", "default-src 'none';")
		return c.Next()
	}
}
