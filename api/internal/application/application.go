package application

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"github.com/mehrdadmahdian/fc.io/internal/database/seeders"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/web_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/box_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
	logger "github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis_service"
)

type Container struct {
	LoggerService  *logger_service.LoggerService
	MongoService   *mongo_service.MongoService
	RedisService   *redis_service.RedisService
	AuthService    *auth_service.AuthService
	BoxService     *box_service.BoxService
	Seeder         *seeders.Seeder
	ApiAuthHandler *api_handlers.AuthHandler
	WebHandler     *web_handlers.WebHandler
}

func NewContainer(Cfg *config.Config, ctx context.Context) (*Container, error) {
	loggerService, err := logger.NewLoggerService(ctx, "logs/api.log")
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "loggerService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	mongoService, err := mongo_service.NewMongoService(ctx, Cfg.MongoURI)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "mongoService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	redisService, err := redis_service.NewRedisService(ctx, Cfg.RedisAddr)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "redisService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	seeder, err := seeders.NewSeeder(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "mongoService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	userRepository, err := repositories.NewUserRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "userRepository",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	boxRepository, err := repositories.NewBoxRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "boxRepository",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	cardRepository, err := repositories.NewCardRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "cardRepository",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	stageRepository, err := repositories.NewStageRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "stageRepository",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	authService, err := auth_service.NewAuthService(userRepository, Cfg.Auth)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "authService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	boxService, err := box_service.NewBoxService(
		boxRepository,
		cardRepository,
		stageRepository,
	)
	
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "boxService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	authHandler, err := api_handlers.NewAuthHandler(authService, redisService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "authHandler",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	webHandler, err := web_handlers.NewWebHandler(authService, boxService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "webHandler",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	return &Container{
		LoggerService:  loggerService,
		MongoService:   mongoService,
		RedisService:   redisService,
		AuthService:    authService,
		BoxService:     boxService,
		Seeder:         seeder,
		ApiAuthHandler: authHandler,
		WebHandler:     webHandler,
	}, nil
}
