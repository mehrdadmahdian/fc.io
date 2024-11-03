package requests

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func FormatValidationErrors(err error) map[string]string {
    errors := make(map[string]string)
    if validationErrors, ok := err.(validator.ValidationErrors); ok {
        for _, fieldError := range validationErrors {
            errors[fieldError.Field()] = fmt.Sprintf("Validation failed on '%s', condition: %s", fieldError.Field(), fieldError.ActualTag())
        }
    }
    return errors
}

func Validate(s interface{}) *map[string]string {
    err := validate.Struct(s)

	if (err != nil) {
        validationErrors := FormatValidationErrors(err)
		return &validationErrors
	}

	return nil
}