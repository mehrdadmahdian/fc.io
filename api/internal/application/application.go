package application

import (
	"context"
	"fmt"

	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/cache"
	"github.com/mehrdadmahdian/fc.io/internal/db"
	"github.com/mehrdadmahdian/fc.io/internal/handlers"
	"github.com/mehrdadmahdian/fc.io/internal/models"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth"
)

type ApplicationContainer struct {
	mongoService *db.MongoService
	redisService *cache.RedisService
	AuthHandler  *handlers.AuthHandler
}

func NewApplicationContainer(Cfg *config.Config, ctx context.Context) (*ApplicationContainer, error) {
	mongoService, err := db.NewMongoService(ctx, Cfg.MongoURI)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName: "mongoService",
			Err:         FailedToCreateService,
		}
	}

	RedisService, err := cache.NewRedisService(ctx, Cfg.RedisAddr)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName: "redisService",
			Err:         FailedToCreateService,
		}
	}
	fmt.Println("redis is started!")

	UserRepository, err := models.NewUserRepository(mongoService)
	authService, err := auth.NewAuthService(UserRepository, Cfg.Auth)
	authHandler, err := handlers.NewAuthHandler(authService)

	return &ApplicationContainer{
		mongoService: mongoService,
		redisService: RedisService,
		AuthHandler:  authHandler,
	}, nil
}

func (applicationContainer *ApplicationContainer) GetAuthHandler() *handlers.AuthHandler {
	return applicationContainer.AuthHandler
}
