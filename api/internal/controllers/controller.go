package controllers

import (
	"github.com/gofiber/fiber/v2"
)

func Ping(c *fiber.Ctx) error {
    responseData := make(map[string]interface{})
    responseData["status"] = true 
    responseData["message"] = "Pong!"
    
    return c.JSON(responseData)
}
