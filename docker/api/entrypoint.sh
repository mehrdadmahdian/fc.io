#!/bin/sh

echo "Starting API service..."
echo "Environment: $APP_ENV"
echo "Port: $API_SERVER_PORT"

# Install netcat if not present
if ! command -v nc > /dev/null; then
    echo "Installing netcat..."
    apk add --no-cache netcat-openbsd
fi

# Function to wait for service with timeout
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local timeout=${4:-60}
    local counter=0
    
    echo "Waiting for $service_name to be ready..."
    while [ $counter -lt $timeout ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo "$service_name is ready!"
            return 0
        fi
        echo "$service_name is unavailable - sleeping ($counter/$timeout)"
        sleep 2
        counter=$((counter + 2))
    done
    
    echo "WARNING: $service_name connection timeout, starting anyway..."
    return 1
}

# Wait for dependencies (only if they're expected to be available)
if [ "$APP_ENV" = "development" ] || [ "$APP_ENV" = "production" ]; then
    wait_for_service "mongodb" "27017" "MongoDB" 60
    wait_for_service "redis" "6379" "Redis" 30
fi

# Start the application based on environment
if [ "$APP_ENV" = "production" ]; then
    echo "Running in production mode..."
    
    # Check if binary exists, if not build it
    if [ ! -f "./myapp" ]; then
        echo "Building application..."
        go build -o myapp ./cmd/server/main.go 
    fi
    
    echo "Starting production server..."
    exec ./myapp
else
    echo "Running in development mode..."
    
    # Use reflex for hot reloading in development
    if command -v reflex > /dev/null; then
        echo "Starting development server with hot reload..."
        exec reflex -r "\\.go$" -s -- sh -c 'echo "Change detected, rebuilding..." && go run ./cmd/server/main.go'
    else
        echo "Reflex not found, starting with go run..."
        exec go run ./cmd/server/main.go
    fi
fi