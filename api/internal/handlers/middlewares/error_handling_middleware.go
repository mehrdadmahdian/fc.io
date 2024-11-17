package middlewares

import (
	"fmt"
	"runtime/debug"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
)

func ErrorHandlingMiddleware(container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		logger := container.LoggerService
		defer func() {
			if r := recover(); r != nil {
				stackTrace := string(debug.Stack())
				logger.Log(
					logger_service.ERROR,
					"panic recovered",
					int64(1000000000000),
					map[string]interface{}{
						"method":      c.Method(),
						"path":        c.Path(),
						"error":       fmt.Sprintf("%v", r),
						"stack_trace": stackTrace,
					},
				)
				_ = c.Status(fiber.StatusInternalServerError).Render("errors/500", fiber.Map{
					"ErrorMessage": r,
					"StackTrace": strings.Split(stackTrace, "\n"),
				})
			}
		}()

		err := c.Next()
		if err != nil {
			logger.Log(
				logger_service.ERROR,
				"handler error",
				int64(2000000000000),
				map[string]interface{}{
					"method": c.Method(),
					"path":   c.Path(),
					"error":  err.Error(),
				},
			)

			return err
		}

		return nil
	}
}
