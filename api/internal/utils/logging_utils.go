package utils

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
)

// LogError logs an error with full request context
func LogError(
	c *fiber.Ctx,
	logger *logger_service.LoggerService,
	operation string,
	err error,
	additionalData map[string]interface{},
) {
	if logger == nil {
		return
	}

	// Get request ID and user info
	requestID := ""
	if id := c.Locals("requestID"); id != nil {
		requestID = id.(string)
	}

	userID := ""
	if user := c.Locals("user"); user != nil {
		if userModel, ok := user.(*models.User); ok {
			userID = userModel.ID.Hex()
		}
	}

	logData := map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"operation":  operation,
		"method":     c.Method(),
		"path":       c.Path(),
		"query":      c.Request().URI().QueryArgs().String(),
		"ip":         c.IP(),
		"user_agent": c.Get("User-Agent"),
		"error":      err.Error(),
	}

	// Add additional data if provided
	for key, value := range additionalData {
		logData[key] = value
	}

	logger.Log(
		logger_service.ERROR,
		fmt.Sprintf("OPERATION FAILED: %s", operation),
		int64(fiber.StatusInternalServerError),
		logData,
	)
}

// LogWarning logs a warning with context
func LogWarning(
	c *fiber.Ctx,
	logger *logger_service.LoggerService,
	operation string,
	message string,
	additionalData map[string]interface{},
) {
	if logger == nil {
		return
	}

	requestID := ""
	if id := c.Locals("requestID"); id != nil {
		requestID = id.(string)
	}

	userID := ""
	if user := c.Locals("user"); user != nil {
		if userModel, ok := user.(*models.User); ok {
			userID = userModel.ID.Hex()
		}
	}

	logData := map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"operation":  operation,
		"method":     c.Method(),
		"path":       c.Path(),
		"message":    message,
	}

	for key, value := range additionalData {
		logData[key] = value
	}

	logger.Log(
		logger_service.WARN,
		fmt.Sprintf("OPERATION WARNING: %s", operation),
		int64(fiber.StatusOK),
		logData,
	)
}

// LogInfo logs an informational message with context
func LogInfo(
	c *fiber.Ctx,
	logger *logger_service.LoggerService,
	operation string,
	message string,
	additionalData map[string]interface{},
) {
	if logger == nil {
		return
	}

	requestID := ""
	if id := c.Locals("requestID"); id != nil {
		requestID = id.(string)
	}

	userID := ""
	if user := c.Locals("user"); user != nil {
		if userModel, ok := user.(*models.User); ok {
			userID = userModel.ID.Hex()
		}
	}

	logData := map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"operation":  operation,
		"method":     c.Method(),
		"path":       c.Path(),
		"message":    message,
	}

	for key, value := range additionalData {
		logData[key] = value
	}

	logger.Log(
		logger_service.INFO,
		fmt.Sprintf("OPERATION INFO: %s", operation),
		int64(fiber.StatusOK),
		logData,
	)
}
