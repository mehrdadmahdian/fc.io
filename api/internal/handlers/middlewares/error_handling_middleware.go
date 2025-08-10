package middlewares

import (
	"fmt"
	"runtime/debug"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
)

func ErrorHandlingMiddleware(container *application.Container) fiber.Handler {
	return func(c *fiber.Ctx) error {
		logger := container.LoggerService

		// Generate request ID for tracing
		requestID := uuid.New().String()
		c.Locals("requestID", requestID)

		// Get user info if available
		var userID string
		if user := c.Locals("user"); user != nil {
			if userModel, ok := user.(*models.User); ok {
				userID = userModel.ID.Hex()
			}
		}

		startTime := time.Now()

		defer func() {
			if r := recover(); r != nil {
				stackTrace := string(debug.Stack())

				// Log panic with full context
				logger.Log(
					logger_service.FATAL,
					"PANIC RECOVERED",
					int64(fiber.StatusInternalServerError),
					map[string]interface{}{
						"request_id":  requestID,
						"user_id":     userID,
						"method":      c.Method(),
						"path":        c.Path(),
						"query":       c.Request().URI().QueryArgs().String(),
						"user_agent":  c.Get("User-Agent"),
						"ip":          c.IP(),
						"panic_error": fmt.Sprintf("%v", r),
						"stack_trace": stackTrace,
						"timestamp":   time.Now().UTC().Format(time.RFC3339),
						"duration_ms": time.Since(startTime).Milliseconds(),
						"headers":     getRequestHeaders(c),
					},
				)

				// Handle panic response based on content type
				if strings.Contains(c.Get("Accept"), "application/json") {
					// API response
					_ = c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"success":    false,
						"message":    "Internal server error occurred",
						"request_id": requestID,
					})
				} else {
					// Web response
					_ = c.Status(fiber.StatusInternalServerError).Render("errors/500", fiber.Map{
						"ErrorMessage": "An unexpected error occurred",
						"RequestID":    requestID,
						"StackTrace":   strings.Split(stackTrace, "\n"),
					})
				}
			}
		}()

		err := c.Next()

		// Log successful requests and errors
		duration := time.Since(startTime)
		statusCode := c.Response().StatusCode()

		logData := map[string]interface{}{
			"request_id":    requestID,
			"user_id":       userID,
			"method":        c.Method(),
			"path":          c.Path(),
			"query":         c.Request().URI().QueryArgs().String(),
			"status_code":   statusCode,
			"duration_ms":   duration.Milliseconds(),
			"ip":            c.IP(),
			"user_agent":    c.Get("User-Agent"),
			"timestamp":     time.Now().UTC().Format(time.RFC3339),
			"response_size": len(c.Response().Body()),
		}

		if err != nil {
			// Log error with context
			logData["error"] = err.Error()
			logData["error_type"] = "handler_error"

			logger.Log(
				logger_service.ERROR,
				"REQUEST ERROR",
				int64(statusCode),
				logData,
			)

			return err
		}

		// Log successful requests
		logLevel := logger_service.INFO
		if statusCode >= 400 {
			logLevel = logger_service.WARN
		}

		logger.Log(
			logLevel,
			"REQUEST COMPLETED",
			int64(statusCode),
			logData,
		)

		return nil
	}
}

func getRequestHeaders(c *fiber.Ctx) map[string]string {
	headers := make(map[string]string)

	// Important headers to log
	importantHeaders := []string{
		"Authorization",
		"Content-Type",
		"Accept",
		"Origin",
		"Referer",
		"X-Forwarded-For",
		"X-Real-IP",
	}

	for _, header := range importantHeaders {
		if value := c.Get(header); value != "" {
			// Mask sensitive information
			if header == "Authorization" && len(value) > 10 {
				headers[header] = value[:10] + "..."
			} else {
				headers[header] = value
			}
		}
	}

	return headers
}
