package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"time"
)

type LogEntry struct {
	Timestamp string                 `json:"timestamp"`
	Level     interface{}            `json:"level"` // Can be string or int
	Message   string                 `json:"message"`
	Code      int64                  `json:"code"`
	Data      map[string]interface{} `json:"data"`
}

type LogStats struct {
	TotalLogs      int
	ErrorCount     int
	WarnCount      int
	InfoCount      int
	PanicCount     int
	UniqueErrors   map[string]int
	RequestsByPath map[string]int
	RequestsByUser map[string]int
	SlowRequests   []LogEntry
	RecentErrors   []LogEntry
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run log_analyzer.go <log_file_path> [options]")
		fmt.Println("Options:")
		fmt.Println("  --errors-only    Show only errors")
		fmt.Println("  --slow-requests  Show requests slower than 1000ms")
		fmt.Println("  --last-hour      Show logs from last hour only")
		fmt.Println("  --user <user_id> Show logs for specific user")
		fmt.Println("  --stats          Show summary statistics")
		os.Exit(1)
	}

	logFile := os.Args[1]
	options := parseOptions(os.Args[2:])

	stats, err := analyzeLogFile(logFile, options)
	if err != nil {
		fmt.Printf("Error analyzing log file: %v\n", err)
		os.Exit(1)
	}

	displayResults(stats, options)
}

func parseOptions(args []string) map[string]string {
	options := make(map[string]string)
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--errors-only":
			options["errors-only"] = "true"
		case "--slow-requests":
			options["slow-requests"] = "true"
		case "--last-hour":
			options["last-hour"] = "true"
		case "--stats":
			options["stats"] = "true"
		case "--user":
			if i+1 < len(args) {
				options["user"] = args[i+1]
				i++
			}
		}
	}
	return options
}

func analyzeLogFile(filename string, options map[string]string) (*LogStats, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	stats := &LogStats{
		UniqueErrors:   make(map[string]int),
		RequestsByPath: make(map[string]int),
		RequestsByUser: make(map[string]int),
		SlowRequests:   []LogEntry{},
		RecentErrors:   []LogEntry{},
	}

	scanner := bufio.NewScanner(file)
	oneHourAgo := time.Now().Add(-1 * time.Hour)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) == "" {
			continue
		}

		var entry LogEntry
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			continue // Skip malformed lines
		}

		// Apply time filter if specified
		if options["last-hour"] == "true" {
			entryTime, err := time.Parse(time.RFC3339, entry.Timestamp)
			if err != nil || entryTime.Before(oneHourAgo) {
				continue
			}
		}

		// Apply user filter if specified
		if userFilter := options["user"]; userFilter != "" {
			if data, ok := entry.Data["user_id"]; !ok || data != userFilter {
				continue
			}
		}

		stats.TotalLogs++

		// Count by level (handle both string and int levels)
		levelStr := ""
		switch v := entry.Level.(type) {
		case string:
			levelStr = strings.ToUpper(v)
		case float64:
			// Map numeric levels to string levels
			switch int(v) {
			case 0:
				levelStr = "DEBUG"
			case 1:
				levelStr = "INFO"
			case 2:
				levelStr = "WARN"
			case 3:
				levelStr = "ERROR"
			case 4:
				levelStr = "FATAL"
			}
		}

		switch levelStr {
		case "ERROR":
			stats.ErrorCount++
			stats.RecentErrors = append(stats.RecentErrors, entry)
			if errorMsg := getErrorMessage(entry); errorMsg != "" {
				stats.UniqueErrors[errorMsg]++
			}
		case "WARN":
			stats.WarnCount++
		case "INFO":
			stats.InfoCount++
		case "FATAL":
			stats.PanicCount++
			stats.RecentErrors = append(stats.RecentErrors, entry)
		}

		// Track requests by path
		if path, ok := entry.Data["path"]; ok {
			if pathStr, ok := path.(string); ok {
				stats.RequestsByPath[pathStr]++
			}
		}

		// Track requests by user
		if userID, ok := entry.Data["user_id"]; ok {
			if userIDStr, ok := userID.(string); ok && userIDStr != "" {
				stats.RequestsByUser[userIDStr]++
			}
		}

		// Track slow requests
		if duration, ok := entry.Data["duration_ms"]; ok {
			if durationFloat, ok := duration.(float64); ok && durationFloat > 1000 {
				stats.SlowRequests = append(stats.SlowRequests, entry)
			}
		}
	}

	// Sort recent errors by timestamp (most recent first)
	sort.Slice(stats.RecentErrors, func(i, j int) bool {
		return stats.RecentErrors[i].Timestamp > stats.RecentErrors[j].Timestamp
	})

	// Limit recent errors to last 10
	if len(stats.RecentErrors) > 10 {
		stats.RecentErrors = stats.RecentErrors[:10]
	}

	return stats, scanner.Err()
}

func getErrorMessage(entry LogEntry) string {
	if errorStr, ok := entry.Data["error"].(string); ok {
		return errorStr
	}
	if panicStr, ok := entry.Data["panic_error"].(string); ok {
		return panicStr
	}
	return entry.Message
}

func displayResults(stats *LogStats, options map[string]string) {
	if options["stats"] == "true" {
		displayStats(stats)
		return
	}

	if options["errors-only"] == "true" {
		displayErrors(stats)
		return
	}

	if options["slow-requests"] == "true" {
		displaySlowRequests(stats)
		return
	}

	// Default: show summary
	displaySummary(stats)
}

func displayStats(stats *LogStats) {
	fmt.Println("=== LOG STATISTICS ===")
	fmt.Printf("Total Logs: %d\n", stats.TotalLogs)
	fmt.Printf("Errors: %d\n", stats.ErrorCount)
	fmt.Printf("Warnings: %d\n", stats.WarnCount)
	fmt.Printf("Info: %d\n", stats.InfoCount)
	fmt.Printf("Panics: %d\n", stats.PanicCount)
	fmt.Println()

	fmt.Println("=== TOP ERROR MESSAGES ===")
	type errorCount struct {
		message string
		count   int
	}
	var errors []errorCount
	for msg, count := range stats.UniqueErrors {
		errors = append(errors, errorCount{msg, count})
	}
	sort.Slice(errors, func(i, j int) bool {
		return errors[i].count > errors[j].count
	})
	for i, e := range errors {
		if i >= 5 {
			break
		}
		fmt.Printf("%d. [%d times] %s\n", i+1, e.count, e.message)
	}
	fmt.Println()

	fmt.Println("=== TOP REQUEST PATHS ===")
	type pathCount struct {
		path  string
		count int
	}
	var paths []pathCount
	for path, count := range stats.RequestsByPath {
		paths = append(paths, pathCount{path, count})
	}
	sort.Slice(paths, func(i, j int) bool {
		return paths[i].count > paths[j].count
	})
	for i, p := range paths {
		if i >= 5 {
			break
		}
		fmt.Printf("%d. [%d requests] %s\n", i+1, p.count, p.path)
	}
}

func displayErrors(stats *LogStats) {
	fmt.Println("=== RECENT ERRORS ===")
	for i, entry := range stats.RecentErrors {
		if i >= 10 {
			break
		}
		levelStr := fmt.Sprintf("%v", entry.Level)
		fmt.Printf("[%s] %s - %s\n", entry.Timestamp, levelStr, entry.Message)
		if errorMsg := getErrorMessage(entry); errorMsg != "" && errorMsg != entry.Message {
			fmt.Printf("    Error: %s\n", errorMsg)
		}
		if requestID, ok := entry.Data["request_id"]; ok {
			fmt.Printf("    Request ID: %s\n", requestID)
		}
		if userID, ok := entry.Data["user_id"]; ok {
			fmt.Printf("    User ID: %s\n", userID)
		}
		if path, ok := entry.Data["path"]; ok {
			fmt.Printf("    Path: %s\n", path)
		}
		fmt.Println()
	}
}

func displaySlowRequests(stats *LogStats) {
	fmt.Println("=== SLOW REQUESTS (>1000ms) ===")
	sort.Slice(stats.SlowRequests, func(i, j int) bool {
		durI, _ := stats.SlowRequests[i].Data["duration_ms"].(float64)
		durJ, _ := stats.SlowRequests[j].Data["duration_ms"].(float64)
		return durI > durJ
	})

	for i, entry := range stats.SlowRequests {
		if i >= 10 {
			break
		}
		duration := entry.Data["duration_ms"].(float64)
		path := entry.Data["path"].(string)
		method := entry.Data["method"].(string)
		fmt.Printf("[%s] %s %s - %.0fms\n", entry.Timestamp, method, path, duration)
		if userID, ok := entry.Data["user_id"]; ok && userID != "" {
			fmt.Printf("    User ID: %s\n", userID)
		}
	}
}

func displaySummary(stats *LogStats) {
	fmt.Println("=== LOG SUMMARY ===")
	fmt.Printf("Total Logs: %d\n", stats.TotalLogs)
	fmt.Printf("Errors: %d, Warnings: %d, Info: %d, Panics: %d\n",
		stats.ErrorCount, stats.WarnCount, stats.InfoCount, stats.PanicCount)
	fmt.Println()

	if len(stats.RecentErrors) > 0 {
		fmt.Println("=== RECENT ERRORS (Last 5) ===")
		for i, entry := range stats.RecentErrors {
			if i >= 5 {
				break
			}
			fmt.Printf("[%s] %s\n", entry.Timestamp, getErrorMessage(entry))
		}
		fmt.Println()
	}

	if len(stats.SlowRequests) > 0 {
		fmt.Printf("=== SLOW REQUESTS: %d requests >1000ms ===\n", len(stats.SlowRequests))
		for i, entry := range stats.SlowRequests {
			if i >= 3 {
				break
			}
			duration := entry.Data["duration_ms"].(float64)
			path := entry.Data["path"].(string)
			fmt.Printf("%.0fms - %s\n", duration, path)
		}
		fmt.Println()
	}

	fmt.Println("Use --stats for detailed statistics")
	fmt.Println("Use --errors-only to see all errors")
	fmt.Println("Use --slow-requests to see all slow requests")
}
