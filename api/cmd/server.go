package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/routes"
)

func main() {
	app := fiber.New()
	routes.SetupRoutes(app)
	
	// database.InitDatabase(config.GetConfig().DBConnection)
	// redis.InitRedis(config.GetConfig().RedisAddress)
	apiServerPort := os.Getenv("API_SERVER_PORT")
	app.Listen(":"+apiServerPort)
}
