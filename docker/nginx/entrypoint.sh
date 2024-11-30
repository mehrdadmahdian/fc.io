#!/bin/sh
echo "Environment is: $APP_ENV"

case "$APP_ENV" in
  production)
    TEMPLATE_FILE="/etc/nginx/conf.d/app.conf.prod.template"
    ;;
  development)
    TEMPLATE_FILE="/etc/nginx/conf.d/app.conf.dev.template"
    ;;
  *)
    echo "Unknown environment: $APP_ENV" >&2
    exit 1
    ;;
esac

envsubst '$SERVER_NAME $API_SERVER_PORT' < "$TEMPLATE_FILE" > /etc/nginx/conf.d/app.conf

exec nginx -g 'daemon off;'