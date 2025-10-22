package api_handlers

import (
	"github.com/mehrdadmahdian/fc.io/internal/services/auth_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/box_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/card_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/label_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/progress_reset_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis_service"
)

type ApiHandler struct {
	authService          *auth_service.AuthService
	boxService           *box_service.BoxService
	redisService         *redis_service.RedisService
	cardService          *card_service.CardService
	labelService         *label_service.LabelService
	loggerService        *logger_service.LoggerService
	progressResetService *progress_reset_service.ProgressResetService
}

func NewApiHandler(
	authService *auth_service.AuthService,
	boxService *box_service.BoxService,
	redisService *redis_service.RedisService,
	cardService *card_service.CardService,
	labelService *label_service.LabelService,
	loggerService *logger_service.LoggerService,
	progressResetService *progress_reset_service.ProgressResetService,
) (*ApiHandler, error) {
	return &ApiHandler{
		authService:          authService,
		boxService:           boxService,
		redisService:         redisService,
		cardService:          cardService,
		labelService:         labelService,
		loggerService:        loggerService,
		progressResetService: progressResetService,
	}, nil
}
