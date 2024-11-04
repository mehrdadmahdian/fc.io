package handlers

import (
	"context"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
)

type AuthHandler struct {
	authService  *auth.AuthService
	redisService *redis.RedisService
}

func NewAuthHandler(authService *auth.AuthService, redisService *redis.RedisService) (*AuthHandler, error) {
	return &AuthHandler{
		authService:  authService,
		redisService: redisService,
	}, nil
}

func (handler *AuthHandler) Login(c *fiber.Ctx) error {
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
		"access_token":  tokenStruct.Token,
		"refresh_token": tokenStruct.RefreshToken,
	}

	return JsonSuccess(
		c,
		utils.PointerString("logged in successfully!"),
		&dataMap,
	)
}

func (handler *AuthHandler) Logout(c *fiber.Ctx) error {
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

func (handler *AuthHandler) Register(c *fiber.Ctx) error {
	return nil
}

func (handler *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.RefreshTokenRequest))
	if err != nil {
		fmt.Println(err)
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
