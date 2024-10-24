FROM nginx:latest

# Copy the Nginx template configuration
COPY ./docker/nginx/conf.d/app.conf.template /etc/nginx/conf.d/app.conf.template

# Copy the entrypoint script
COPY ./docker/nginx/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]