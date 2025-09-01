# FC.io System Patterns

## Docker Architecture

### Multi-Stage Build Pattern
All services use multi-stage Docker builds with specific targets:

```yaml
# Development target
FROM base AS development
# Development-specific setup, hot reloading, debugging

# Production target  
FROM base AS production
# Optimized builds, security hardening, minimal footprint
```

### Service Architecture

```
┌─────────────┐
│   Client    │
└─────┬───────┘
      │
┌─────▼───────┐ (Reverse Proxy + SSL Termination)
│    Nginx    │
│  Port 80/443│
└─────┬───────┘
      │
      ├─────────────┬─────────────────┐
      │             │                 │
┌─────▼─────────┐ ┌─▼───────────┐ ┌─▼─────────┐
│  Public UI    │ │Dashboard UI │ │    API    │
│  (Next.js)    │ │  (React)    │ │(Go/Fiber) │
│  Port 3001    │ │ Port 3000   │ │Port 7000  │
└───────────────┘ └─────────────┘ └─┬─────────┘
                                    │
                              ┌─────┴─────┬─────────────┐
                              │           │             │
                        ┌─────▼─────┐ ┌─▼─────┐ ┌─────▼─────┐
                        │ MongoDB   │ │ Redis │ │MongoExpr. │
                        │Port 27017 │ │Port   │ │Port 8081  │
                        │           │ │6379   │ │           │
                        └───────────┘ └───────┘ └───────────┘
```

## Environment Patterns

### Development Environment
- **Hot Reloading**: Source code mounted as volumes
- **Debug Logging**: Enhanced logging for troubleshooting
- **Development Servers**: Native dev servers (npm start, go run)
- **Volume Mounting**: Local files synchronized with containers

### Production Environment  
- **Optimized Builds**: Minified, compiled applications
- **Security Hardening**: Non-root users, minimal attack surface
- **Resource Limits**: Memory and CPU constraints
- **SSL/TLS**: HTTPS termination at Nginx
- **Health Checks**: Automatic service health monitoring

## Service Patterns

### API Service (Go/Fiber)
- **Development**: Hot reloading with reflex
- **Production**: Statically compiled binary in Alpine
- **Health Check**: HTTP endpoint monitoring
- **Dependencies**: MongoDB + Redis

### Frontend Services (React/Next.js)
- **Development**: Dev servers with hot module replacement
- **Production**: Static builds served by lightweight servers
- **Build Tools**: Webpack/Next.js for optimization
- **Environment Variables**: Runtime configuration

### Nginx (Reverse Proxy)
- **Template-Based Config**: Environment-specific configurations
- **Health Checks**: Dependency waiting before startup
- **SSL Termination**: HTTPS handling in production
- **Static Assets**: Efficient serving with caching

## Data Persistence Patterns

### Development
- **Volume Mounting**: Source code synchronization
- **Local Directories**: Logs and sessions on host
- **Named Volumes**: Database and cache persistence

### Production
- **Docker Volumes**: Persistent data storage
- **Backup Strategies**: Automated data protection
- **Resource Management**: Memory and storage limits

## Security Patterns

### Container Security
- **Non-Root Users**: All services run as unprivileged users
- **Minimal Images**: Alpine-based for reduced attack surface
- **Resource Limits**: Prevent resource exhaustion
- **Network Isolation**: Internal Docker networking

### Application Security
- **Environment Variables**: Secure configuration management
- **JWT Authentication**: Stateless authentication
- **SSL/TLS**: Encrypted communication
- **Input Validation**: Request sanitization

## Networking Patterns

### Service Discovery
- **Container Names**: Services reference each other by name
- **Internal Network**: fc-network for inter-service communication
- **Port Mapping**: Selective host exposure

### Load Balancing
- **Nginx Upstream**: Reverse proxy configuration
- **Health Check Integration**: Automatic failover
- **Static Asset Optimization**: CDN-like behavior

## Monitoring Patterns

### Health Checks
- **Application Level**: Custom health endpoints
- **Container Level**: Docker health check commands
- **Dependency Checking**: Service availability validation

### Logging
- **Centralized Logs**: Docker logging drivers
- **Structured Logging**: JSON formatted logs
- **Log Rotation**: Automatic log management

## Build and Deployment Patterns

### CI/CD Ready
- **Multi-Environment Support**: Dev/staging/production configs
- **Build Optimization**: Layer caching and multi-stage builds
- **Environment Promotion**: Configuration-based deployment

### Scaling Patterns
- **Horizontal Scaling**: Multiple container instances
- **Resource Allocation**: CPU and memory management
- **Database Scaling**: Read replicas and sharding support

## Configuration Management

### Environment Variables
- **Hierarchy**: .env file < environment variables < docker-compose overrides
- **Security**: Sensitive data through environment variables
- **Flexibility**: Runtime configuration without rebuilds

### Template Systems
- **Nginx Configuration**: envsubst for dynamic config generation
- **Build Arguments**: Compile-time configuration
- **Runtime Parameters**: Container startup configuration
