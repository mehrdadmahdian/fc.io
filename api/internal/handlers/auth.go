package handlers

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

type AuthHandler struct {
	authService *auth.AuthService
}

func NewAuthHandler(authService *auth.AuthService) (*AuthHandler, error) {
	return &AuthHandler{
		authService: authService,
	}, nil
}

func (handler *AuthHandler) Login(c *fiber.Ctx) error {
	Request, err := requests.ParseRequestBody(c, new(requests.LoginRequest))
	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusInternalServerError,
			utils.PointerString("unable to parse request"),
			nil,
		)
	}

	validationErros := requests.Validate(Request)
	if validationErros != nil {
		return JsonFailed(
			c,
			fiber.StatusUnprocessableEntity,
			utils.PointerString("failed to validate requst"),
			utils.ConvertToMapInterface(validationErros),
		)
	}

	TokenStruct, err := handler.authService.Login(
		context.Background(),
		Request.Email,
		Request.Password,
	)

	if err != nil {
		return JsonFailed(
			c,
			fiber.StatusBadRequest,
			utils.PointerString(err.Error()),
			nil,
		)
	}

	dataMap := map[string]interface{}{
		"access_token":  TokenStruct.Token,
		"refresh_token": TokenStruct.RefreshToken,
	}

	return JsonSuccess(
		c,
		utils.PointerString("logged in successfully!"),
		&dataMap,
	)
}

func (handler *AuthHandler) Logout(c *fiber.Ctx) error {
	return nil
}

func (handler *AuthHandler) Register(c *fiber.Ctx) error {
	return nil
}

func (handler *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	return nil
}
