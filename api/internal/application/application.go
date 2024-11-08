package application

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"github.com/mehrdadmahdian/fc.io/internal/database/seeders"
	"github.com/mehrdadmahdian/fc.io/internal/handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/web_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth"
	"github.com/mehrdadmahdian/fc.io/internal/services/mongo"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis"
)

type ApplicationContainer struct {
	MongoService *mongo.MongoService
	RedisService *redis.RedisService
	Seeder       *seeders.Seeder
	AuthHandler  *handlers.AuthHandler
	AuthService  *auth.AuthService
	IndexHandler  *web_handlers.IndexHandler
}

func NewApplicationContainer(Cfg *config.Config, ctx context.Context) (*ApplicationContainer, error) {
	mongoService, err := mongo.NewMongoService(ctx, Cfg.MongoURI)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "mongoService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	redisService, err := redis.NewRedisService(ctx, Cfg.RedisAddr)
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
	authService, err := auth.NewAuthService(userRepository, Cfg.Auth)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "authService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}
	authHandler, err := handlers.NewAuthHandler(authService, redisService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "authHandler",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	indexHandler , err:= web_handlers.NewAuthHandler()
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "indexController",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	return &ApplicationContainer{
		MongoService: mongoService,
		RedisService: redisService,
		Seeder:       seeder,
		AuthHandler:  authHandler,
		AuthService:  authService,
		IndexHandler: indexHandler,
	}, nil
}
