package api_handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)


func (handler *ApiHandler) GetBoxes(c *fiber.Ctx) error {
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

	userBoxes, err := handler.boxService.RenderUserBoxes(c.Context(), userModel)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get user boxes"), nil)
	}

	dataMap := map[string]interface{}{
		"boxes": userBoxes,
	}

	return JsonSuccess(
		c,
		utils.PointerString("logged in successfully!"),
		&dataMap,
	)
}