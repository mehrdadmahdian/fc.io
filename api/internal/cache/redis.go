package cache

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

type RedisService struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisService(ctx context.Context, addr string) (*RedisService, error) {
	redisClient := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	go func() {
		<-ctx.Done()
		if err := redisClient.Close(); err != nil {
			log.Printf("Failed to close Redis connection: %v", err)
		}
	}()

	return &RedisService{
		client: redisClient,
		ctx:    ctx,
	}, nil
}

func (r *RedisService) Client() *redis.Client {
	return r.client
}
