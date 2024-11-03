package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTService struct {
	jwtSecret                  []byte
	tokenExpiryDuration        time.Duration
	refreshTokenExpiryDuration time.Duration
}

func newJWTService(
	jwtSecret []byte,
	tokenExpiryDuration time.Duration,
	refreshTokenExpiryDuration time.Duration,
) *JWTService {
	return &JWTService{
		jwtSecret:                  jwtSecret,
		tokenExpiryDuration:        tokenExpiryDuration,
		refreshTokenExpiryDuration: refreshTokenExpiryDuration,
	}
}

type UserClaims struct {
	UserId    string
	UserName  string
	UserEmail string
	jwt.RegisteredClaims
}

func (service *JWTService) generateToken(
	userId string,
	username,
	email string,
	duration time.Duration,
) (*string, error) {

	claims := UserClaims{
		UserId:    userId,
		UserName:  username,
		UserEmail: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "app",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(service.jwtSecret)
	if err != nil {
		return nil, err
	}
	return &signedToken, nil
}

func (jwtServce *JWTService) CreateTokenStruct(
	userId string,
	userName string,
	userEmail string,
) (*TokenStruct, error) {
	var err error
	accessToken, err := jwtServce.generateToken(userId, userName, userEmail, jwtServce.tokenExpiryDuration)
	if err != nil {
		return nil, err
	}
	refreshToken, err := jwtServce.generateToken(userId, userName, userEmail, jwtServce.refreshTokenExpiryDuration)
	if err != nil {
		return nil, err
	}

	return &TokenStruct{
		Token:        *accessToken,
		RefreshToken: *refreshToken,
	}, nil
}

func VerifyToken(tokenString string) error {
	// token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
	// 	return JWTService, nil
	// })

	// if err != nil {
	// 	return err
	// }

	// if !token.Valid {
	// 	return fmt.Errorf("invalid token")
	// }

	return nil
}

// func ParseTokenData(tokenString string) (*TokenInformation, error) {
// 	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
// 		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
// 			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
// 		}
// 		return JWTSecret, nil
// 	})

// 	if err != nil || !token.Valid {
// 		return nil, fmt.Errorf("invalid token: %v", err)
// 	}

// 	if claims, ok := token.Claims.(jwt.MapClaims); ok {
// 		return &TokenInformation{
// 			UserId:    int(claims["user_id"].(float64)),
// 			UserName:  claims["user_name"].(string),
// 			UserEmail: claims["user_email"].(string),
// 		}, nil
// 	}

// 	return nil, fmt.Errorf("could not parse token")
// }
