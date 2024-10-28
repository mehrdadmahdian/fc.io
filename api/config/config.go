package config

import (
	"os"
)

type Config struct {
	MongoURI   string
	RedisAddr  string
	ServerAddr string
}

func LoadConfig() *Config {
	return &Config{
		MongoURI:   getEnv("MONGODB_URI", ""),
		RedisAddr:  getEnv("REDIS_ADDRESS", ""),
		ServerAddr: ":" + getEnv("API_SERVER_PORT", ""),
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}

	return defaultVal
}
