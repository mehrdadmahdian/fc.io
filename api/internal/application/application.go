package application

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"github.com/mehrdadmahdian/fc.io/internal/database/seeders"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/api_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/web_handlers"
	"github.com/mehrdadmahdian/fc.io/internal/services/audit_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/auth_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/box_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/card_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
	logger "github.com/mehrdadmahdian/fc.io/internal/services/logger_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/mongo_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/progress_reset_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/redis_service"
	"github.com/mehrdadmahdian/fc.io/internal/services/social_service"
)

type Container struct {
	LoggerService        *logger_service.LoggerService
	MongoService         *mongo_service.MongoService
	RedisService         *redis_service.RedisService
	AuthService          *auth_service.AuthService
	AuditService         *audit_service.AuditService
	BoxService           *box_service.BoxService
	CardService          *card_service.CardService
	ProgressResetService *progress_reset_service.ProgressResetService
	SocialService        *social_service.SocialService
	Seeder               *seeders.Seeder
	ApiHandler           *api_handlers.ApiHandler
	WebHandler           *web_handlers.WebHandler
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

	labelRepository, err := repositories.NewLabelRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "labelRepository",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	auditLogRepository, err := repositories.NewAuditLogRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "auditLogRepository",
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

	auditService, err := audit_service.NewAuditService(auditLogRepository)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "auditService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	progressBackupRepository, err := repositories.NewProgressBackupRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "progressBackupRepository",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	progressResetRepository, err := repositories.NewProgressResetRepository(mongoService)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "progressResetRepository",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	progressResetService, err := progress_reset_service.NewProgressResetService(
		cardRepository,
		progressBackupRepository,
		progressResetRepository,
	)
	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "progressResetService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	// Initialize social repositories
	database := mongoService.Client().Database("flashcards")
	userFollowingRepository := repositories.NewUserFollowingRepository(database)
	boxForkRepository := repositories.NewBoxForkRepository(database)
	boxRatingRepository := repositories.NewBoxRatingRepository(database)
	activityFeedRepository := repositories.NewActivityFeedRepository(database)

	// Initialize social service
	socialService := social_service.NewSocialService(
		userFollowingRepository,
		boxForkRepository,
		boxRatingRepository,
		activityFeedRepository,
		boxRepository,
		userRepository,
	)

	boxService, err := box_service.NewBoxService(
		boxRepository,
		cardRepository,
		stageRepository,
		labelRepository,
	)

	cardService, err := card_service.NewCardService(cardRepository, auditService)

	if err != nil {
		return nil, &ServiceCreationError{
			ServiceName:          "boxService",
			Err:                  FailedToCreateService,
			OriginalErrorMessage: err.Error(),
		}
	}

	// Create container first so it can be passed to handlers
	container := &Container{
		LoggerService:        loggerService,
		MongoService:         mongoService,
		RedisService:         redisService,
		AuthService:          authService,
		AuditService:         auditService,
		BoxService:           boxService,
		CardService:          cardService,
		ProgressResetService: progressResetService,
		SocialService:        socialService,
		Seeder:               seeder,
	}

	apiHandler, err := api_handlers.NewApiHandler(authService, boxService, redisService, cardService, loggerService, progressResetService)
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

	// Set handlers in container
	container.ApiHandler = apiHandler
	container.WebHandler = webHandler

	return container, nil
}
