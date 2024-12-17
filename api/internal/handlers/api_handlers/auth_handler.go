package api_handlers

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

func (handler *ApiHandler) Login(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.LoginRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("unable to parse request"), nil)
	}
	validationErros := requests.Validate(request)
	if validationErros != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate requst"), utils.ConvertToMapInterface(validationErros))
	}
	tokenStruct, err := handler.authService.Login(context.Background(), request.Email, request.Password)

	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusBadRequest,
			utils.PointerString(err.Error()),
			nil,
		)
	}

	dataMap := map[string]interface{}{
		"accessToken":  tokenStruct.Token,
		"refreshToken": tokenStruct.RefreshToken,
	}

	return JsonSuccess(
		c,
		utils.PointerString("logged in successfully!"),
		&dataMap,
	)
}

func (handler *ApiHandler) Logout(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return JsonFailed(c, fiber.StatusUnauthorized, utils.PointerString("Missing or invalid Authorization header"), nil)
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	err := handler.redisService.Client().SAdd(context.Background(), "blacklisted_tokens", tokenString).Err()
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("could not blacklist token"), nil)
	}
	return nil
}

func (handler *ApiHandler) Register(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.RegisterRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("unable to parse request"), nil)
	}
	validationErros := requests.Validate(request)
	if validationErros != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate requst"), utils.ConvertToMapInterface(validationErros))
	}
	tokenStruct, user, err := handler.authService.Register(context.Background(), request.Name, request.Email, request.Password)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to register user"), nil)
	}

	err = handler.boxService.SetupBoxForUser(c.Context(), user)
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("failed to setup box for user"), nil)
	}

	dataMap := map[string]interface{}{
		"accessToken":  tokenStruct.Token,
		"refreshToken": tokenStruct.RefreshToken,
	}

	return JsonSuccess(
		c,
		utils.PointerString("signed up successfully!"),
		&dataMap,
	)
}

func (handler *ApiHandler) User(c *fiber.Ctx) error {
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

func (handler *ApiHandler) Refresh(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.RefreshTokenRequest))
	if err != nil {
		return JsonFailed(c, fiber.StatusInternalServerError, utils.PointerString("unable to parse request"), nil)
	}
	validationErros := requests.Validate(request)
	if validationErros != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to validate requst"), utils.ConvertToMapInterface(validationErros))
	}

	tokenStruct, err := handler.authService.RefreshToken(context.Background(), request.RefreshToken)
	if err != nil {
		return JsonFailed(c, fiber.StatusUnprocessableEntity, utils.PointerString("failed to generate new tokens"), nil)
	}

	dataMap := map[string]interface{}{
		"access_token":  tokenStruct.Token,
		"refresh_token": tokenStruct.RefreshToken,
	}

	return JsonSuccess(
		c,
		utils.PointerString("token is refreshed successfully!"),
		&dataMap,
	)
}
