#!/bin/sh

echo "Starting Nginx..."
echo "Environment: $APP_ENV"
echo "Server Name: $SERVER_NAME"

# Wait for backend services to be ready
echo "Waiting for API service to be ready..."
while ! nc -z api-container ${API_SERVER_PORT:-7000}; do
  echo "API service is unavailable - sleeping"
  sleep 2
done
echo "API service is ready!"

echo "Waiting for Public UI service to be ready..."
while ! nc -z public-ui-container 3000; do
  echo "Public UI service is unavailable - sleeping"
  sleep 2
done
echo "Public UI service is ready!"

echo "Waiting for Dashboard UI service to be ready..."
while ! nc -z dashboard-ui-container 3000; do
  echo "Dashboard UI service is unavailable - sleeping"
  sleep 2
done
echo "Dashboard UI service is ready!"

# Select appropriate template based on environment
case "$APP_ENV" in
  production)
    TEMPLATE_FILE="/etc/nginx/templates/app.conf.prod.template"
    echo "Using production configuration"
    ;;
  development)
    TEMPLATE_FILE="/etc/nginx/templates/app.conf.dev.template"
    echo "Using development configuration"
    ;;
  *)
    echo "Unknown environment: $APP_ENV, defaulting to development" >&2
    TEMPLATE_FILE="/etc/nginx/templates/app.conf.dev.template"
    ;;
esac

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Template file $TEMPLATE_FILE not found!" >&2
    exit 1
fi

# Replace environment variables in the template and create nginx config
echo "Generating nginx configuration from template: $TEMPLATE_FILE"
envsubst '${SERVER_NAME} ${API_SERVER_PORT} ${PUBLIC_UI_SERVER_PORT} ${DASHBOARD_UI_SERVER_PORT}' < "$TEMPLATE_FILE" > /etc/nginx/conf.d/app.conf

# Validate nginx configuration
echo "Validating nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
else
    echo "Nginx configuration is invalid!" >&2
    exit 1
fi

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'