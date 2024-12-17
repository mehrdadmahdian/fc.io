package api_handlers

import (
	"github.com/mehrdadmahdian/fc.io/internal/services/auth_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/box_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis_service"
)

type ApiHandler struct {
	authService  *auth_service.AuthService
	boxService   *box_service.BoxService
	redisService *redis_service.RedisService
}

func NewApiHandler(
	authService *auth_service.AuthService,
	boxService *box_service.BoxService,
	redisService *redis_service.RedisService,
) (*ApiHandler, error) {
	return &ApiHandler{
		authService:  authService,
		boxService:   boxService,
		redisService: redisService,
	}, nil
}
