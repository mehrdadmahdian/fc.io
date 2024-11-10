package web_handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/handlers/requests"
	"github.com/mehrdadmahdian/fc.io/internal/utils"
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
		Secure:   false,
		SameSite: "Strict",
	})
	return c.Redirect("/web/dashboard/", fiber.StatusFound)
}

func (webHandler *WebHandler) PostRegister(c *fiber.Ctx) error {
	request, err := requests.ParseRequestBody(c, new(requests.RegisterRequest))
	if err != nil {
		return c.Render("auth/register", fiber.Map{"ErrorMessage": "Can not parse the request"})
	}
	validationErros := requests.Validate(request)
	if validationErros != nil {
		return c.Render("auth/register", fiber.Map{"ErrorMessage": utils.MapToString(*validationErros)})
	}

	if request.Password != request.ConfirmationPassword {
		return c.Render("auth/register", fiber.Map{"ErrorMessage": "requested passwords are not matched."})
	}

	tokenStruct, user, err := webHandler.authService.Register(c.Context(), request.Name, request.Email, request.Password)
	if err != nil {
		return c.Render("auth/register", fiber.Map{"ErrorMessage": err})
	}

	if user == nil {
		return c.Render("auth/register", fiber.Map{"ErrorMessage": "error while user registration"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    tokenStruct.Token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Strict",
	})

	err = webHandler.boxService.SetupBoxForUser(user)
	if (err != nil) {
		return c.Redirect("/web/dashboard/", fiber.StatusFound)
	}

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
