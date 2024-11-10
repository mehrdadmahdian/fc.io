package web_handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
)

func (handler *WebHandler) AuthHealthcheck(c *fiber.Ctx) error {
	user := c.Locals("user")

	if user != nil {
		return c.Render("checks/auth-health-check", fiber.Map{
			"User": user,
		})
	}

	return fiber.NewError(123, "failed")
}

func (handler *WebHandler) Login(c *fiber.Ctx) error {
	return c.Render("auth/login", nil)
}

func (webHandler *WebHandler) PostLogin(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.LoginRequest))
	fmt.Println(request)
	if err != nil {
		return c.Render("auth/login", fiber.Map{"ErrorMessage": "Can not parse the request"})
	}
	validationErros := requests.Validate(request)
	if validationErros != nil {
		return c.Render("auth/login", fiber.Map{"ErrorMessage": "Request data is not valid"})
	}

	tokenStruct, err := webHandler.authService.Login(c.Context(), request.Email, request.Password)
	if err != nil {
		return c.Render("auth/login", fiber.Map{"ErrorMessage": err})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    tokenStruct.Token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Strict",
	})
	return c.Redirect("/web/dashboard/", fiber.StatusFound)
}

func (webHandler *WebHandler) PostRegister(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.RegisterRequest))
	fmt.Println(request)
	if err != nil {
		return c.Render("auth/login", fiber.Map{"ErrorMessage": "Can not parse the request"})
	}
	validationErros := requests.Validate(request)
	if validationErros != nil {
		return c.Render("auth/login", fiber.Map{"ErrorMessage": "Request data is not valid"})
	}

	tokenStruct, err := webHandler.authService.Login(c.Context(), request.Email, request.Password)
	if err != nil {
		return c.Render("auth/login", fiber.Map{"ErrorMessage": err})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    tokenStruct.Token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Strict",
	})
	return c.Redirect("/web/dashboard/", fiber.StatusFound)
}

func (handler *WebHandler) Register(c *fiber.Ctx) error {
	return c.Render("auth/register", nil)
}

func (handler *WebHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now(),
		HTTPOnly: true,
	})

	return c.Redirect("/web/auth/login")
}
