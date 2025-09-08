# Multi-stage Dockerfile for Go API service  
FROM golang:1.23-alpine AS base

# Install basic dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Copy go mod files first for better caching
COPY api/go.mod api/go.sum ./
RUN go mod download && go mod verify

# Development stage
FROM base AS development

# Install reflex for hot reloading and curl for health checks
RUN go install github.com/cespare/reflex@latest && \
    apk add --no-cache curl

# Copy entrypoint script
COPY docker/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set environment variables for development
ENV APP_ENV=development
ENV CGO_ENABLED=0
ENV GOOS=linux

# Expose API port
ARG API_SERVER_PORT=7000
ENV API_SERVER_PORT=${API_SERVER_PORT}
EXPOSE ${API_SERVER_PORT}

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${API_SERVER_PORT}/api/health-check || exit 1

# Use a simple shell script inline for development
CMD ["/bin/sh", "-c", "echo 'Starting API...'; if [ \"$APP_ENV\" = \"production\" ]; then go build -o myapp ./cmd/server/main.go && ./myapp; else go run ./cmd/server/main.go; fi"]

# Builder stage for production
FROM base AS builder

# Copy all source files
COPY api/ ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o myapp ./cmd/server/main.go

# Production stage
FROM alpine:latest AS production

# Install ca-certificates for HTTPS requests and curl for health checks
RUN apk --no-cache add ca-certificates tzdata curl

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy the binary from builder stage
COPY --from=builder /app/myapp /app/myapp
COPY --from=builder /app/internal/templates /app/internal/templates
COPY --from=builder /app/public /app/public

# Copy entrypoint script
COPY docker/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV APP_ENV=production
ENV CGO_ENABLED=0
ENV GOOS=linux

# Expose API port
ARG API_SERVER_PORT=7000
ENV API_SERVER_PORT=${API_SERVER_PORT}
EXPOSE ${API_SERVER_PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${API_SERVER_PORT}/api/health-check || exit 1

# Use direct command for production
CMD ["./myapp"]
