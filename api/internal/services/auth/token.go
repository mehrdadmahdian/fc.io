package auth

import "time"

type TokenStruct struct {
	Token                  string
	RefreshToken           string
	TokenExpireddAt        time.Time
	RefreshTokenExpireddAt time.Time
}