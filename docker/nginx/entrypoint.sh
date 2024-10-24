#!/bin/sh

# Substitute environment variables in Nginx configuration
envsubst '$SERVER_NAME $UI_SERVER_PORT $API_SERVER_PORT' < /etc/nginx/conf.d/app.conf.template > /etc/nginx/conf.d/app.conf

# Start Nginx
exec nginx -g 'daemon off;'