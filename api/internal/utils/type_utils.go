package utils

import (
	"fmt"
	"strings"
)

func ConvertToMapInterface(data *map[string]string) *map[string]interface{} {
    result := make(map[string]interface{})
    for key, value := range *data {
        result[key] = value 
    }
    return &result
}

func MapToString(m map[string]string) string {
	var sb strings.Builder

	for key, value := range m {
		sb.WriteString(fmt.Sprintf("%s: %v\n", key, value))
	}

	return sb.String()
}