package auth_service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode"

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

func (authService *AuthService) Register(ctx context.Context, name, email, password string) (*TokenStruct, error) {
	user, err := authService.userRepository.FindUserByEmail(email)
	if err != nil {
		return nil, err
	}

	if user != nil {
		return nil, errors.New("user with this email already exists.")
	}

	if isSecurePassword(password) == false {
		return nil, errors.New("password is not secure. choose better one.")
	}

	user, err = authService.userRepository.CreateNewUser(name, email, password)
	if err != nil {
		return nil, err
	}

	tokenStruct, err := authService.jwtService.CreateTokenStruct(user.IDString(), user.Name, user.Email)
	if err != nil {
		return nil, err
	}

	return tokenStruct, nil
}

func isSecurePassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	hasLower := false
	hasUpper := false
	hasDigit := false
	hasSpecial := false

	for _, char := range password {
		switch {
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsDigit(char):
			hasDigit = true
		case isSpecialCharacter(char):
			hasSpecial = true
		}
	}

	return hasLower && hasUpper && hasDigit && hasSpecial
}

func isSpecialCharacter(c rune) bool {
	specialChars := "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~"
	return strings.ContainsRune(specialChars, c)
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
	user, err := authService.userRepository.FindUserByEmail(claims.UserEmail)
	if err != nil {
		return nil, err
	}

	return user, nil
}
