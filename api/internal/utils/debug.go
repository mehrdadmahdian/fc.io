package utils

import (
	"fmt"
	"log"
	"runtime"
)

func Debug(message string, args ...interface{}) {
	_, file, line, ok := runtime.Caller(1)

	if ok {
		pc, _, _, _ := runtime.Caller(1)
		fn := runtime.FuncForPC(pc)

		formattedMessage := fmt.Sprintf(message, args...)

		log.Printf("%s:%d ====> : %s\nMessage: %s\n", file, line, fn.Name(), formattedMessage)
	} else {
		log.Printf("DEBUG: Failed to retrieve caller information.\nMessage: %s\n", message)
	}
}
