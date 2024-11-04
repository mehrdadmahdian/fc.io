package auth

import (
	"context"
	"errors"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepository *repositories.UserRepository
	jwtService     *JWTService
}

func NewAuthService(
	userRepository *repositories.UserRepository,
	authConfig map[string]interface{},
) (*AuthService, error) {

	var ok bool
	value, ok := authConfig["jwtSecret"]
	if !ok {
		panic("auth config (jwt secret) is missing")
	}

	jwtSecret, ok := value.([]byte)
	if !ok {
		panic("auth config (jwt sercret) is not of type []byte")
	}

	value, ok = authConfig["tokenExpiryDuration"]
	if !ok {
		panic("auth config (token expiry duration) is missing")
	}

	tokenExpiryDuration, ok := value.(time.Duration)
	if !ok {
		panic("auth config (token expiry duration) is not of type time.Duration")
	}

	value, ok = authConfig["refreshTokenExpiryDuration"]
	if !ok {
		panic("auth config (token expiry duration) is missing")
	}

	refreshTokenExpiryDuration, ok := value.(time.Duration)
	if !ok {
		panic("auth config (refresh  expiry duration) is not of type time.Duration")
	}

	JWTService := newJWTService(
		jwtSecret,
		tokenExpiryDuration,
		refreshTokenExpiryDuration,
	)

	return &AuthService{
		userRepository: userRepository,
		jwtService:     JWTService,
	}, nil
}

func (authService *AuthService) Login(ctx context.Context, email, password string) (*TokenStruct, error) {
	user, err := authService.userRepository.FindUserByEmail(email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, errors.New("user not found")
	}

	if err := checkPassword(user.HashedPassword, password); err != nil {
		return nil, errors.New("invalid password")
	}

	tokenStruct, err := authService.jwtService.CreateTokenStruct(user.IDString(), user.Name, user.Email)
	if err != nil {
		return nil, err
	}

	return tokenStruct, nil
}

func (authService *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*TokenStruct, error) {
	user, err := authService.GetUserByToken(refreshToken)
	if err != nil {
		return nil, err
	}

	tokenStruct, err := authService.jwtService.CreateTokenStruct(user.IDString(), user.Name, user.Email)
	if err != nil {
		return nil, err
	}

	return tokenStruct, nil
}

func checkPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func (authService *AuthService) GetUser() string {
	return "User data from service"
}

func (authService *AuthService) GetUserByToken(token string) (*models.User, error) {
	var err error
	claims, err := authService.jwtService.ParseToken(token)
	if err != nil {
		return nil, err
	}
	user, err := authService.userRepository.FindUserById(claims.UserID)
	if err != nil {
		return nil, err
	}

	return user, nil
}
