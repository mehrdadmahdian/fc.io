package utils

func ConvertToMapInterface(data *map[string]string) *map[string]interface{} {
    result := make(map[string]interface{})
    for key, value := range *data {
        result[key] = value 
    }
    return &result
}