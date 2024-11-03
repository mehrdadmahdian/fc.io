package requests

import (
	"errors"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func ParseRequestBody[T any](c *fiber.Ctx, requestTemplate *T) (*T, error) {

	if err := c.BodyParser(requestTemplate); err != nil {
        fmt.Println(err.Error())
		return nil, errors.New("failed to parse request")
	}

	return requestTemplate, nil
}