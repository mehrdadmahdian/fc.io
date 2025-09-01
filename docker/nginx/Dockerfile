# Nginx Dockerfile with environment-based configuration
FROM nginx:alpine

# Install dependencies
RUN apk add --no-cache dumb-init gettext curl netcat-openbsd

# Copy configuration templates
COPY docker/nginx/conf.d/app.conf.dev.template /etc/nginx/templates/app.conf.dev.template
COPY docker/nginx/conf.d/app.conf.prod.template /etc/nginx/templates/app.conf.prod.template

# Copy and set permissions for entrypoint script
COPY docker/nginx/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create directory for dashboard static files (conditional copying will be handled by docker-compose)
RUN mkdir -p /var/www/dashboard-ui/build

# Create non-root user for better security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set proper permissions
RUN chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    chown -R appuser:appgroup /var/www && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Update nginx configuration to run as non-root user
RUN sed -i '/user nginx;/d' /etc/nginx/nginx.conf

# Switch to non-root user
USER appuser

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Use dumb-init and custom entrypoint
ENTRYPOINT ["dumb-init", "--"]
CMD ["/usr/local/bin/entrypoint.sh"]