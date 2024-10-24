package cmd

import (
	"os"

	"github.com/gofiber/fiber"
)

func main() {
	app := fiber.New()
	// routes.SetupRoutes(app)
	
	// database.InitDatabase(config.GetConfig().DBConnection)
	// redis.InitRedis(config.GetConfig().RedisAddress)

	apiServerPort := os.Getenv("API_SERVER_PORT")
	app.Listen(":"+apiServerPort)
}
