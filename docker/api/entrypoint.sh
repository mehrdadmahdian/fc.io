#!/bin/sh

if [ "$APP_ENV" = "production" ]; then
    echo "Running in production mode..."
    
    go build -o myapp ./cmd/server/main.go 
    exec ./myapp

else
    echo "Running in development mode..."
    exec reflex -r '\.go$' -- sh -c 'go build -o myapp ./cmd/server/main.go && ./myapp'
fi