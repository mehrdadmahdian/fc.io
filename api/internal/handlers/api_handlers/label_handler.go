package api_handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

func (handler *ApiHandler) CreateLabel(c *fiber.Ctx) error {
	boxID := c.Params("boxid")

	request, err := requests.ParseRequestBody(c, new(requests.CreateLabelRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	label, err := models.NewLabel(request.Name, boxID, request.Color)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to create label model"), nil)
	}

	err = handler.labelService.CreateLabel(c.Context(), label)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to create label"), nil)
	}

	return JsonSuccess(c, utils.PointerString("label created successfully"), &map[string]interface{}{
		"label": label,
	})
}

func (handler *ApiHandler) GetBoxLabels(c *fiber.Ctx) error {
	boxID := c.Params("boxid")

	labels, err := handler.labelService.GetBoxLabels(c.Context(), boxID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get labels"), nil)
	}

	return JsonSuccess(c, utils.PointerString("labels fetched successfully"), &map[string]interface{}{
		"labels": labels,
	})
}

func (handler *ApiHandler) UpdateLabel(c *fiber.Ctx) error {
	labelID := c.Params("labelid")

	request, err := requests.ParseRequestBody(c, new(requests.UpdateLabelRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusBadRequest, utils.PointerString("unable to parse request"), nil)
	}

	validationErrors := requests.Validate(request)
	if validationErrors != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate request"), utils.ConvertToMapInterface(validationErrors))
	}

	err = handler.labelService.UpdateLabel(c.Context(), labelID, request.Name, request.Color)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to update label"), nil)
	}

	return JsonSuccess(c, utils.PointerString("label updated successfully"), nil)
}

func (handler *ApiHandler) DeleteLabel(c *fiber.Ctx) error {
	labelID := c.Params("labelid")

	err := handler.labelService.DeleteLabel(c.Context(), labelID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to delete label"), nil)
	}

	return JsonSuccess(c, utils.PointerString("label deleted successfully"), nil)
}

func (handler *ApiHandler) GetLabel(c *fiber.Ctx) error {
	labelID := c.Params("labelid")

	label, err := handler.labelService.GetLabel(c.Context(), labelID)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to get label"), nil)
	}

	return JsonSuccess(c, utils.PointerString("label fetched successfully"), &map[string]interface{}{
		"label": label,
	})
}
