package handlers

import (
	"fmt"
	"runtime"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

const RESPONSE_STATUS_SUCCESS string = "success"
const RESPONSE_STATUS_FAILED string = "FAILD"

func Healthcheck(c *fiber.Ctx) error {
	responseData := make(map[string]interface{})
	responseData["status"] = true
	responseData["message"] = "API is working!"

	return c.JSON(responseData)
}

func AuthCheck(c *fiber.Ctx) error {
	user := c.Locals("user")
	userModel, ok := user.(*models.User)
	if !ok {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("user is not set in the lifecycle"),
			nil,
		)
	}

	return JsonSuccess(
		c,
		utils.PointerString("user successfully is bound to the lifecycle"),
		&map[string]interface{}{
			"userID":    userModel.ID,
			"userName":  userModel.Name,
			"userEmail": userModel.Email,
		},
	)
}

func JsonSuccess(
	c *fiber.Ctx,
	message *string,
	data *map[string]interface{},
) error {
	c.Status(fiber.StatusOK)

	responseData := fiber.Map{
		"status": RESPONSE_STATUS_SUCCESS,
		"data":   data,
	}

	if message != nil {
		responseData["message"] = message
	}

	if data != nil {
		responseData["data"] = data
	}
	err := c.JSON(responseData)

	return err
}

func JsonFailed(
	c *fiber.Ctx,
	httpStatusCode int,
	message *string,
	data *map[string]interface{},
) error {
	c.Status(httpStatusCode)

	responseData := fiber.Map{
		"status":  RESPONSE_STATUS_FAILED,
		"message": message,
	}

	if message != nil {
		responseData["message"] = message
	}
	err := c.JSON(responseData)

	return err
}

func TraceError(err error) error {
	stackBuf := make([]byte, 1024)
	runtime.Stack(stackBuf, false)

	return fmt.Errorf("%w\nStack trace:\n%s", err, stackBuf)
}
