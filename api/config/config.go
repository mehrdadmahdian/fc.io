package config

import (
	"os"
	"time"
)

var Cfg *Config

type Config struct {
	MongoURI   string
	RedisAddr  string
	ServerAddr string
	Auth       map[string]interface{}
}

func LoadConfig() (*Config, error) {
	Cfg = &Config{
		MongoURI:   getEnv("MONGODB_URI", ""),
		RedisAddr:  getEnv("REDIS_ADDRESS", ""),
		ServerAddr: ":" + getEnv("API_SERVER_PORT", ""),
		Auth: map[string]interface{}{
			"jwtSecret": []byte(getEnv("JWT_SECRET", "")),
			"tokenExpiryDuration": 24 * 7 * time.Hour,
			"refreshTokenExpiryDuration": 24 * 30 * time.Hour,
		},
	}

	return Cfg, nil
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}

	return defaultVal
}
