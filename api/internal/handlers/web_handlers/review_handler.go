package web_handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
)

func (handler *WebHandler) ShowReview(c *fiber.Ctx) error {
	box, err := handler.boxService.GetBox(c.Context(), c.Params("boxID"))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	card, err := handler.boxService.GetFirstEligibleCardToReview(c.Context(), box)
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}
	remainingCount, err := handler.boxService.GetCountOfRemainingCardsForReview(c.Context(), box)
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	return c.Render("dashboard/boxes/review/review", fiber.Map{
		"User": c.Locals("user"),
		"Box":  box,
		"Card": card,
		"RemainingCount": remainingCount,
	})
}

func (handler *WebHandler) SubmitReview(c *fiber.Ctx) error {
	box, err := handler.boxService.GetBox(c.Context(), c.Params("boxID"))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	request, err := requests.ParseRequestBody(c, new(requests.SubmitReviewRequest))
	if err != nil {
		return c.Render("errors/500", fiber.Map{"ErrorMessage": err})
	}

	handler.boxService.SubmitReview(
		c.Context(),
		request.CardId,
		request.Action,
	)

	return c.Redirect("/web/dashboard/box/"+box.IDString()+"/review", fiber.StatusSeeOther)
}
