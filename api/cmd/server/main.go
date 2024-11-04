package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/config"
	"github.com/mehrdadmahdian/fc.io/internal/application"
	"github.com/mehrdadmahdian/fc.io/internal/routes"
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

	fiber := fiber.New()
	routes.SetupRoutes(fiber, application)
	go func() {
		log.Printf("Starting server on %s", cfg.ServerAddr)
		if err := fiber.Listen(cfg.ServerAddr); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe error: %v", err)
		}
	}()
	fmt.Println("routes are injected")

	fmt.Println("Server is running on ", cfg.ServerAddr)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	fmt.Println("\nShutting down server...")

	ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := fiber.Shutdown(); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	<-ctx.Done()
	fmt.Println("Server exiting")
}