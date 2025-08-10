#!/bin/bash

# Log Monitor Script for fc.io API
# This script helps monitor and analyze API logs in real-time

API_LOG_FILE="./logs/api.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_usage() {
    echo "FC.io Log Monitor"
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  tail        - Show live log output (default)"
    echo "  errors      - Show only errors and panics"
    echo "  stats       - Show log statistics"
    echo "  analyze     - Run detailed log analysis"
    echo "  rotate      - Force log rotation (requires API restart)"
    echo ""
    echo "Options:"
    echo "  --lines N   - Show last N lines (default: 50)"
    echo "  --user ID   - Filter by user ID"
    echo "  --path PATH - Filter by request path"
    echo ""
    echo "Examples:"
    echo "  $0 tail                    # Live log monitoring"
    echo "  $0 errors --lines 100     # Last 100 error entries"
    echo "  $0 stats                  # Show statistics"
    echo "  $0 analyze --user 123     # Analyze logs for user 123"
}

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if log file exists
check_log_file() {
    if [ ! -f "$API_LOG_FILE" ]; then
        echo -e "${RED}Error: Log file $API_LOG_FILE not found${NC}"
        echo "Make sure the API server is running and logging is configured"
        exit 1
    fi
}

# Parse command line arguments
COMMAND="tail"
LINES=50
USER_FILTER=""
PATH_FILTER=""

while [[ $# -gt 0 ]]; do
    case $1 in
        tail|errors|stats|analyze|rotate)
            COMMAND="$1"
            shift
            ;;
        --lines)
            LINES="$2"
            shift 2
            ;;
        --user)
            USER_FILTER="$2"
            shift 2
            ;;
        --path)
            PATH_FILTER="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Main functions
show_tail() {
    echo -e "${BLUE}=== Live Log Monitoring (Press Ctrl+C to stop) ===${NC}"
    echo -e "${YELLOW}Log file: $API_LOG_FILE${NC}"
    echo ""
    
    if [ ! -z "$USER_FILTER" ] || [ ! -z "$PATH_FILTER" ]; then
        # Filtered tail
        tail -f "$API_LOG_FILE" | while read line; do
            if [ ! -z "$USER_FILTER" ] && [[ "$line" != *"\"user_id\":\"$USER_FILTER\""* ]]; then
                continue
            fi
            if [ ! -z "$PATH_FILTER" ] && [[ "$line" != *"\"path\":\"$PATH_FILTER\""* ]]; then
                continue
            fi
            format_log_line "$line"
        done
    else
        # Regular tail with formatting
        tail -f "$API_LOG_FILE" | while read line; do
            format_log_line "$line"
        done
    fi
}

format_log_line() {
    local line="$1"
    
    # Extract level and timestamp for coloring
    if [[ "$line" == *"\"level\":\"ERROR\""* ]] || [[ "$line" == *"\"level\":\"FATAL\""* ]]; then
        echo -e "${RED}$line${NC}"
    elif [[ "$line" == *"\"level\":\"WARN\""* ]]; then
        echo -e "${YELLOW}$line${NC}"
    elif [[ "$line" == *"PANIC RECOVERED"* ]]; then
        echo -e "${RED}🚨 PANIC: $line${NC}"
    else
        echo "$line"
    fi
}

show_errors() {
    echo -e "${BLUE}=== Recent Errors and Panics ===${NC}"
    echo -e "${YELLOW}Showing last $LINES error entries${NC}"
    echo ""
    
    tail -n 1000 "$API_LOG_FILE" | grep -E '"level":"(ERROR|FATAL)"' | tail -n "$LINES" | while read line; do
        echo -e "${RED}$line${NC}"
    done
}

show_stats() {
    echo -e "${BLUE}=== Log Statistics ===${NC}"
    echo -e "${YELLOW}Analyzing current log file...${NC}"
    echo ""
    
    local total_lines=$(wc -l < "$API_LOG_FILE")
    local error_count=$(grep -c '"level":"ERROR"' "$API_LOG_FILE" 2>/dev/null || echo "0")
    local warn_count=$(grep -c '"level":"WARN"' "$API_LOG_FILE" 2>/dev/null || echo "0") 
    local info_count=$(grep -c '"level":"INFO"' "$API_LOG_FILE" 2>/dev/null || echo "0")
    local panic_count=$(grep -c '"level":"FATAL"' "$API_LOG_FILE" 2>/dev/null || echo "0")
    
    echo -e "${GREEN}Total log entries: $total_lines${NC}"
    echo -e "${RED}Errors: $error_count${NC}"
    echo -e "${YELLOW}Warnings: $warn_count${NC}"
    echo -e "${GREEN}Info: $info_count${NC}"
    echo -e "${RED}Panics: $panic_count${NC}"
    echo ""
    
    # Most common errors
    echo -e "${BLUE}=== Most Common Error Messages ===${NC}"
    grep '"level":"ERROR"' "$API_LOG_FILE" 2>/dev/null | \
        grep -o '"message":"[^"]*"' | \
        sort | uniq -c | sort -nr | head -5 | \
        while read count message; do
            echo -e "${YELLOW}$count${NC} times: $message"
        done
    
    echo ""
    
    # Most accessed paths
    echo -e "${BLUE}=== Most Accessed API Paths ===${NC}"
    grep '"path":"' "$API_LOG_FILE" 2>/dev/null | \
        grep -o '"path":"[^"]*"' | \
        sort | uniq -c | sort -nr | head -5 | \
        while read count path; do
            echo -e "${GREEN}$count${NC} requests: $path"
        done
}

run_analysis() {
    echo -e "${BLUE}=== Running Detailed Log Analysis ===${NC}"
    
    # Check if Go analyzer exists
    if [ ! -f "$SCRIPT_DIR/log_analyzer.go" ]; then
        echo -e "${RED}Error: log_analyzer.go not found in $SCRIPT_DIR${NC}"
        exit 1
    fi
    
    # Build analyzer args
    local args=("$API_LOG_FILE" "--stats")
    
    if [ ! -z "$USER_FILTER" ]; then
        args+=("--user" "$USER_FILTER")
    fi
    
    echo -e "${YELLOW}Running: go run log_analyzer.go ${args[*]}${NC}"
    echo ""
    
    cd "$SCRIPT_DIR"
    go run log_analyzer.go "${args[@]}"
}

force_rotation() {
    echo -e "${YELLOW}Note: Log rotation is automatic when files exceed 100MB${NC}"
    echo -e "${YELLOW}Current log file size:${NC}"
    ls -lh "$API_LOG_FILE"
    echo ""
    echo -e "${BLUE}To manually rotate logs, you would need to:${NC}"
    echo "1. Stop the API server"
    echo "2. Move the current log file (e.g., mv api.log api-backup-$(date +%Y%m%d).log)"
    echo "3. Start the API server (it will create a new log file)"
    echo ""
    echo -e "${RED}This is not recommended during production operation${NC}"
}

# Main execution
check_log_file

case $COMMAND in
    tail)
        show_tail
        ;;
    errors)
        show_errors
        ;;
    stats)
        show_stats
        ;;
    analyze)
        run_analysis
        ;;
    rotate)
        force_rotation
        ;;
    *)
        echo "Unknown command: $COMMAND"
        print_usage
        exit 1
        ;;
esac
