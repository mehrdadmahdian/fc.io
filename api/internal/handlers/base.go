package handlers

import (
	"github.com/gofiber/fiber/v2"
)

const RESPONSE_STATUS_SUCCESS string = "success"
const RESPONSE_STATUS_FAILED string = "FAILD"

func Healthcheck(c *fiber.Ctx) error {
    responseData := make(map[string]interface{})
    responseData["status"] = true 
    responseData["message"] = "API is working!"
    
    return c.JSON(responseData)
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

