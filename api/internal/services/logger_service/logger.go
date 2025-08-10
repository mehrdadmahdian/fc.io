package logger_service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type LoggerService struct {
	file        *os.File
	logger      *log.Logger
	mutex       sync.Mutex
	logFilePath string
	maxFileSize int64 // Maximum file size in bytes
	maxFiles    int   // Maximum number of log files to keep
	currentSize int64 // Current file size
}

func NewLoggerService(ctx context.Context, logFilePath string) (*LoggerService, error) {
	// Create logs directory if it doesn't exist
	logDir := filepath.Dir(logFilePath)
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create log directory: %v", err)
	}

	file, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
	if err != nil {
		return nil, err
	}

	// Get current file size
	fileInfo, err := file.Stat()
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %v", err)
	}

	logger := log.New(file, "", 0) // No prefix since we handle our own formatting

	service := &LoggerService{
		file:        file,
		logger:      logger,
		logFilePath: logFilePath,
		maxFileSize: 100 * 1024 * 1024, // 100MB
		maxFiles:    10,                // Keep 10 files
		currentSize: fileInfo.Size(),
	}

	// Start log rotation checker
	go service.rotationChecker(ctx)

	go func() {
		<-ctx.Done()
		service.mutex.Lock()
		defer service.mutex.Unlock()

		if service.file != nil {
			err = service.file.Close()
			if err != nil {
				fmt.Printf("could not close logging file: %v\n", err)
			}
		}
	}()

	return service, nil
}

// rotationChecker checks for log rotation every hour
func (s *LoggerService) rotationChecker(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.checkAndRotate()
		case <-ctx.Done():
			return
		}
	}
}

// checkAndRotate rotates the log file if it exceeds the maximum size
func (s *LoggerService) checkAndRotate() {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if s.currentSize > s.maxFileSize {
		s.rotateLog()
	}
}

// rotateLog performs the actual log rotation
func (s *LoggerService) rotateLog() {
	if s.file != nil {
		s.file.Close()
	}

	// Rename current log file with timestamp
	timestamp := time.Now().Format("2006-01-02-15-04-05")
	ext := filepath.Ext(s.logFilePath)
	base := strings.TrimSuffix(s.logFilePath, ext)
	rotatedFile := fmt.Sprintf("%s-%s%s", base, timestamp, ext)

	err := os.Rename(s.logFilePath, rotatedFile)
	if err != nil {
		fmt.Printf("failed to rotate log file: %v\n", err)
		return
	}

	// Create new log file
	file, err := os.OpenFile(s.logFilePath, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
	if err != nil {
		fmt.Printf("failed to create new log file: %v\n", err)
		return
	}

	s.file = file
	s.logger = log.New(file, "", 0)
	s.currentSize = 0

	// Clean up old log files
	s.cleanupOldLogs()

	// Log rotation event
	s.logRotationEvent()
}

// cleanupOldLogs removes old log files beyond the maximum count
func (s *LoggerService) cleanupOldLogs() {
	logDir := filepath.Dir(s.logFilePath)
	baseName := filepath.Base(s.logFilePath)
	ext := filepath.Ext(baseName)
	baseNameWithoutExt := strings.TrimSuffix(baseName, ext)

	files, err := filepath.Glob(filepath.Join(logDir, baseNameWithoutExt+"-*"+ext))
	if err != nil {
		return
	}

	if len(files) > s.maxFiles {
		// Sort files by modification time (oldest first)
		fileInfos := make([]os.FileInfo, len(files))
		for i, file := range files {
			info, err := os.Stat(file)
			if err != nil {
				continue
			}
			fileInfos[i] = info
		}

		// Remove oldest files
		filesToRemove := len(files) - s.maxFiles
		for i := 0; i < filesToRemove && i < len(files); i++ {
			os.Remove(files[i])
		}
	}
}

// logRotationEvent logs the rotation event
func (s *LoggerService) logRotationEvent() {
	logEntry := map[string]interface{}{
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"level":     "INFO",
		"message":   "Log file rotated",
		"code":      0,
		"data": map[string]interface{}{
			"operation": "log_rotation",
			"new_file":  s.logFilePath,
		},
	}

	logJSON, err := json.Marshal(logEntry)
	if err == nil {
		s.logger.Println(string(logJSON))
	}
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

	logLine := string(logJSON) + "\n"

	// Write to log file
	if s.logger != nil {
		s.logger.Print(logLine)
		s.currentSize += int64(len(logLine))

		// Check if we need to rotate immediately (file size exceeded)
		if s.currentSize > s.maxFileSize {
			go func() {
				s.rotateLog()
			}()
		}
	}
}
