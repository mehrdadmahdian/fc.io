package application

import (
	"errors"
	"fmt"
)

var (
	FailedToCreateService = errors.New("")
)

type ServiceCreationError struct {
	ServiceName string
	Err error
	OriginalErrorMessage string
}

func (e *ServiceCreationError) Error() string {
	return fmt.Sprintf("failed to create service '%s': %v", e.ServiceName, e.Err)
}

// Unwrap returns the underlying error
func (e *ServiceCreationError) Unwrap() error {
	return e.Err
}