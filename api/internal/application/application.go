package application

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"github.com/mehrdadmahdian/fc.io/internal/database/seeders"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/web_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis_service"
)

type Container struct {
	MongoService   *mongo_service.MongoService
	RedisService   *redis_service.RedisService
	AuthService    *auth_service.AuthService
	Seeder         *seeders.Seeder
	ApiAuthHandler *api_handlers.AuthHandler
	WebPageHandler *web_handlers.WebHandler
}

func NewContainer(Cfg *config.Config, ctx context.Context) (*Container, error) {
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
	authService, err := auth_service.NewAuthService(userRepository, Cfg.Auth)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "authService",
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

	webPageHandler, err := web_handlers.NewWebHandler(authService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "indexController",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	return &Container{
		MongoService:   mongoService,
		RedisService:   redisService,
		AuthService:    authService,
		Seeder:         seeder,
		ApiAuthHandler: authHandler,
		WebPageHandler: webPageHandler,
	}, nil
}
