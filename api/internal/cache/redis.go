package cache

import (
    "github.com/go-redis/redis/v8"
)

var redisClient *redis.Client

func InitRedis(addr string) *redis.Client {
    redisClient = redis.NewClient(&redis.Options{
        Addr: addr,
    })
    return redisClient
}

func GetRedisClient() *redis.Client {
    return redisClient
}
