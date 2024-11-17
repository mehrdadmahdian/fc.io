package logger_service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

type LoggerService struct {
	file   *os.File
	logger *log.Logger
	mutex  sync.Mutex
}

func NewLoggerService(ctx context.Context, logFilePath string) (*LoggerService, error) {
	file, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
	if err != nil {
		return nil, err
	}

	logger := log.New(file, "", log.LstdFlags|log.LUTC)

	go func() {
		<-ctx.Done()
		err = file.Close()
		if err != nil {
			fmt.Printf("could not close logging file: ", err)
		}
	}()

	return &LoggerService{
		file:   file,
		logger: logger,
	}, nil
}

type LogLevel int

func (l LogLevel) String() string {
	return logLevelStrings[l]
}

var logLevelStrings = map[LogLevel]string{
	DEBUG: "DEBUG",
	INFO:  "INFO",
	WARN:  "WARN",
	ERROR: "ERROR",
	FATAL: "FATAL",
}

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
	FATAL
)

func (s *LoggerService) Log(
	level LogLevel,
	message string,
	code int64,
	data map[string]interface{},
) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	logEntry := map[string]interface{}{
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"level":     level,
		"message":   message,
		"code":      code,
		"data":      data,
	}

	logJSON, err := json.Marshal(logEntry)
	if err != nil {
		log.Printf("Failed to marshal log entry: %v", err)
		return
	}

	s.logger.Println(string(logJSON))
}
