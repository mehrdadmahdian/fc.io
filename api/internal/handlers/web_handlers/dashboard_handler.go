package web_handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
)

func (handler *WebHandler) Dashboard(c *fiber.Ctx) error {
	user := c.Locals("user")
	u, ok := user.(*models.User)
	if !ok {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": "user model is not set"})
	}

	boxInfos, err := handler.boxService.RenderUserBoxes(c.Context(), u)
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	var totalCards int
    var cardsDueToday int
    for _, boxInfo := range boxInfos {
        totalCards += boxInfo.CountOfTotalCards
        cardsDueToday += boxInfo.CountOfCardsDueToday
	}
	

	return c.Render("dashboard/index", fiber.Map{
		"User": c.Locals("user"),
		"Boxes":   boxInfos,
		"countOfBoxes": len(boxInfos),
		"countOfCardsDueToday": cardsDueToday,
		"totalCards":           totalCards,
		"successRate":           0,
	})

}
