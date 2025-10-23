# Production Deployment Guide

## Overview

This guide explains the optimized production deployment process that prevents server resource exhaustion during builds.

## Problem Solved

Previously, running `./scripts/start.sh prod --build --fast` would:
- Build all services in parallel
- Consume excessive memory (especially Node.js builds)
- Cause server to run out of resources
- Lead to failed deployments or system instability

## Solution

The deployment system now includes:

1. **Automatic Resource Detection** - Detects available memory and adjusts build strategy
2. **Intelligent Build Modes** - Sequential, limited, or parallel builds based on resources
3. **Memory Limits** - Node.js builds limited to 2GB max memory
4. **Runtime Resource Limits** - All containers have CPU and memory limits
5. **Aggressive Cleanup** - Removes old Docker resources during build

## Build Modes

### Sequential Mode (Low Memory < 2GB)
- Builds one service at a time
- Cleans up between builds
- Slowest but most memory-efficient
- Recommended for: Small VPS, limited resources

### Limited Mode (Moderate Memory 2-4GB)
- Builds lightweight services together (nginx + api)
- Builds heavy Node.js apps separately
- Balanced approach
- Recommended for: Medium-sized servers

### Parallel Mode (High Memory > 4GB)
- Builds all services simultaneously
- Fastest deployment
- Recommended for: Large servers, development machines

## Usage

### Standard Production Deployment
```bash
./scripts/start.sh prod --build --fast
```

The script will automatically:
1. Detect available memory
2. Choose appropriate build mode
3. Clean up old resources
4. Build images with memory limits
5. Deploy with zero downtime

### Manual Build Strategy Override

If you want to force a specific build mode, modify the script or set environment variables:

```bash
# Force sequential build (safest)
export BUILD_MODE=sequential
./scripts/start.sh prod --build --fast

# Force limited parallel build
export BUILD_MODE=limited
./scripts/start.sh prod --build --fast

# Force full parallel build
export BUILD_MODE=parallel
./scripts/start.sh prod --build --fast
```

### Build Only (Pre-build for faster deployment)
```bash
./scripts/fast-deploy.sh build-only
```

This builds all images without deploying, useful for:
- Pre-building during low-traffic periods
- Testing build process
- Preparing for quick deployment later

## Resource Limits

### Build Time Limits
- **Node.js builds**: 2GB max memory (`NODE_OPTIONS=--max-old-space-size=2048`)
- **Docker BuildKit**: Enabled for better caching and efficiency

### Runtime Limits (per container)

| Service | CPU Limit | Memory Limit | Memory Reserved |
|---------|-----------|--------------|-----------------|
| nginx | 0.5 cores | 128MB | 64MB |
| api | 1.0 cores | 512MB | 256MB |
| dashboard-ui | 0.5 cores | 256MB | 128MB |
| public-ui | 0.5 cores | 256MB | 128MB |
| redis | 0.25 cores | 256MB | 128MB |
| mongodb | 1.0 cores | 1GB | 512MB |

These limits:
- Prevent any single container from consuming all resources
- Ensure system stability
- Can be adjusted in `docker-compose.prod.yml`

## Monitoring During Deployment

### Check System Resources
```bash
# Linux
free -h
htop

# macOS
vm_stat
top
```

### Check Docker Resources
```bash
# View container resource usage
docker stats

# View build cache size
docker system df

# View detailed disk usage
docker system df -v
```

### Watch Deployment Progress
```bash
# In another terminal during deployment
docker compose logs -f --tail=50
```

## Cleanup Commands

### Manual Cleanup (if needed)
```bash
# Remove all unused images, containers, networks
docker system prune -a

# Remove build cache
docker builder prune -a

# Remove specific old images
docker image prune -a --filter "until=24h"
```

### Scheduled Cleanup
Consider adding a cron job for regular cleanup:
```bash
# Add to crontab (runs daily at 3 AM)
0 3 * * * docker system prune -f --filter "until=24h" > /dev/null 2>&1
```

## Troubleshooting

### Build Still Fails with Out of Memory

1. **Check actual available memory:**
   ```bash
   free -h  # Linux
   vm_stat  # macOS
   ```

2. **Force sequential build:**
   ```bash
   export BUILD_MODE=sequential
   ./scripts/start.sh prod --build --fast
   ```

3. **Reduce Node.js memory limit further:**
   Edit `docker-compose.prod.yml` and change:
   ```yaml
   NODE_OPTIONS: "--max-old-space-size=1024"  # Reduce from 2048
   ```

4. **Build services individually:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx
   docker compose -f docker-compose.yml -f docker-compose.prod.yml build api
   docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui
   docker compose -f docker-compose.yml -f docker-compose.prod.yml build public-ui
   ```

### Deployment is Slow

- **Sequential mode is active** - This is expected with low memory
- **Solution**: Upgrade server resources or use pre-built images
- **Alternative**: Build on a more powerful machine and push to registry

### Container Keeps Restarting

1. **Check logs:**
   ```bash
   docker compose logs [service-name]
   ```

2. **Check resource limits:**
   - Container might need more memory
   - Adjust limits in `docker-compose.prod.yml`

3. **Check health checks:**
   - Service might be slow to start
   - Increase `start_period` in health checks

## Best Practices

1. **Pre-build during off-peak hours:**
   ```bash
   ./scripts/fast-deploy.sh build-only
   ```

2. **Monitor resource usage:**
   - Use `docker stats` during deployment
   - Set up monitoring (Prometheus, Grafana)

3. **Regular cleanup:**
   - Schedule daily cleanup jobs
   - Remove old images after successful deployment

4. **Gradual rollout:**
   - Use rolling deployment (default)
   - Test on staging first

5. **Keep Docker updated:**
   - Newer versions have better resource management
   - Update Docker Engine and Docker Compose regularly

## Deployment Strategies

### Rolling Deployment (Default)
- Zero downtime
- Updates services one by one
- Safest option

### Blue-Green Deployment
- Requires more resources
- Complete new environment
- Easy rollback

### Quick Restart
- Minimal downtime (few seconds)
- Faster than rolling
- Good for non-critical updates

Choose strategy:
```bash
./scripts/fast-deploy.sh rolling      # Default
./scripts/fast-deploy.sh blue-green   # More resources needed
./scripts/fast-deploy.sh quick        # Faster but brief downtime
```

## Performance Tips

1. **Use Docker layer caching:**
   - Don't change Dockerfiles unnecessarily
   - Order commands from least to most frequently changed

2. **Optimize npm install:**
   - Use `npm ci` instead of `npm install`
   - Copy package.json first for better caching

3. **Enable BuildKit:**
   - Already enabled in scripts
   - Provides better caching and parallel builds

4. **Use multi-stage builds:**
   - Already implemented in Dockerfiles
   - Reduces final image size

## Support

If you continue to experience issues:
1. Check system requirements (minimum 2GB RAM recommended)
2. Review Docker logs for specific errors
3. Consider upgrading server resources
4. Use pre-built images from a registry

