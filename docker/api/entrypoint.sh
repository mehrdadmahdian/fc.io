#!/bin/sh

if [ "$APP_ENV" = "production" ]; then
    echo "Running in production mode..."
    
    go build -o myapp ./cmd/server.go 
    exec ./myapp

else
    echo "Running in development mode..."
    reflex -r "\\.go$" -s -- sh -c 'echo "change detected!" && go run /var/www/cmd/server.go'
fi