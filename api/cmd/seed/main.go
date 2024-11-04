package main

import (
	"context"
	"fmt"
	"log"

	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/application"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("could not load config: %v", err)
	}

	application, err := application.NewApplicationContainer(cfg, ctx)

	if err != nil {
		panic(fmt.Sprintf("application could not be initialized: %s", err.Error()))
	}

	Seeder := application.Seeder

	Seeder.Seed()
}
