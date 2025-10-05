# Multi-stage Dockerfile for React Dashboard UI
FROM node:18-alpine AS base

# Install dependencies for better compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dumb-init for proper signal handling and curl for health checks
RUN apk add --no-cache dumb-init curl

# Development stage
FROM base AS development

# Set environment variables for development
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=true
ENV WDS_SOCKET_HOST=0.0.0.0
ENV WDS_SOCKET_PORT=0
ENV GENERATE_SOURCEMAP=false

# Copy package files first for better layer caching
COPY dashboard-ui/package.json dashboard-ui/package-lock.json* ./

# Clean install for development
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps

# Create startup script for development
RUN echo '#!/bin/sh' > /start-dev.sh && \
    echo 'echo "Starting React development server..."' >> /start-dev.sh && \
    echo 'echo "Waiting for source files to be mounted..."' >> /start-dev.sh && \
    echo 'while [ ! -f "/app/src/index.js" ] && [ ! -f "/app/src/index.jsx" ]; do' >> /start-dev.sh && \
    echo '  echo "Waiting for source files..." && sleep 2' >> /start-dev.sh && \
    echo 'done' >> /start-dev.sh && \
    echo 'echo "Source files detected, starting server..."' >> /start-dev.sh && \
    echo 'npm start' >> /start-dev.sh && \
    chmod +x /start-dev.sh

# Expose port
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Use dumb-init and start development server
ENTRYPOINT ["dumb-init", "--"]
CMD ["/start-dev.sh"]

# Builder stage
FROM base AS builder

WORKDIR /app

# Copy package files
COPY dashboard-ui/package.json dashboard-ui/package-lock.json* ./

# Install dependencies (including devDependencies needed for build)
RUN npm cache clean --force && \
    npm ci --legacy-peer-deps --ignore-scripts

# Copy source code
COPY dashboard-ui/ .

# Build arguments
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV PUBLIC_URL=/dashboard
ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init and serve
RUN apk add --no-cache dumb-init && \
    npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use serve to host the static files with SPA support
ENTRYPOINT ["dumb-init", "--"]
CMD ["serve", "-s", "build", "-l", "3000"]