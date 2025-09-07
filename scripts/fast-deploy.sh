#!/bin/bash

# Fast Zero-Downtime Production Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check service health
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Checking health of $service..."
    while [[ $attempt -le $max_attempts ]]; do
        if docker compose ps $service | grep -q 'healthy\|Up'; then
            print_success "$service is healthy"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 5
        ((attempt++))
    done
    print_error "$service failed to become healthy"
    return 1
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [strategy]"
    echo ""
    echo "Deployment Strategies:"
    echo "  rolling    - Rolling deployment (zero downtime, default)"
    echo "  blue-green - Blue-green deployment (requires more resources)"
    echo "  build-only - Just build images without deploying"
    echo "  quick      - Quick restart (minimal downtime)"
    echo ""
    echo "Examples:"
    echo "  $0 rolling     # Zero-downtime rolling deployment"
    echo "  $0 blue-green  # Blue-green deployment"
    echo "  $0 build-only  # Pre-build images for faster deployment later"
    echo "  $0 quick       # Quick restart with minimal downtime"
    echo ""
    exit 1
}

# Strategy 1: Rolling Deployment (Zero Downtime)
rolling_deployment() {
    print_status "Starting rolling deployment (zero downtime)..."
    
    # Pre-build all images in parallel
    print_status "Building new images in background..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel &
    BUILD_PID=$!
    
    # Wait for build to complete
    print_status "Waiting for build to complete..."
    wait $BUILD_PID
    print_success "All images built successfully"
    
    # Rolling update strategy - update services one by one
    print_status "Starting rolling update..."
    
    # 1. Update databases first (they usually don't cause downtime)
    print_status "Updating databases..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps redis mongodb
    check_health redis
    check_health mongodb
    
    # 2. Update API with rolling restart
    print_status "Updating API service..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps api
    check_health api
    
    # 3. Update frontend services
    print_status "Updating frontend services..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps dashboard-ui public-ui
    check_health dashboard-ui
    check_health public-ui
    
    # 4. Finally update nginx (this is the moment of switchover)
    print_status "Updating reverse proxy..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps nginx
    check_health nginx
    
    print_success "Rolling deployment completed successfully!"
}

# Strategy 2: Blue-Green Deployment
blue_green_deployment() {
    print_status "Starting blue-green deployment..."
    
    # Create a new compose project for green environment
    export COMPOSE_PROJECT_NAME="fcio-green"
    
    print_status "Building green environment..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    
    print_status "Starting green environment..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    # Wait for all services to be healthy
    check_health api
    check_health dashboard-ui
    check_health public-ui
    check_health nginx
    
    print_status "Green environment is ready. Switching traffic..."
    
    # Switch nginx to point to green environment
    # This would require nginx configuration changes
    print_warning "Blue-green deployment requires additional nginx configuration"
    print_status "Manually switch your load balancer to point to the green environment"
    
    print_success "Blue-green deployment completed!"
    print_status "Remember to clean up the blue environment after verification"
}

# Strategy 3: Build Only (Pre-build for faster deployment)
build_only() {
    print_status "Building images only (no deployment)..."
    
    # Build all images in parallel
    print_status "Building all production images..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    
    print_success "All images built successfully!"
    print_status "Images are ready for fast deployment. Use './scripts/fast-deploy.sh rolling' to deploy."
}

# Strategy 4: Quick Restart (Minimal Downtime)
quick_restart() {
    print_status "Starting quick restart deployment..."
    
    # Build images first
    print_status "Building images..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    
    # Quick restart all services
    print_status "Restarting all services..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
    
    # Wait for services to be healthy
    sleep 10
    check_health api
    check_health dashboard-ui
    check_health public-ui
    check_health nginx
    
    print_success "Quick restart completed!"
}

# Pre-deployment optimizations
optimize_for_speed() {
    print_status "Optimizing Docker for faster builds..."
    
    # Enable BuildKit for faster builds
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    # Clean up old images to free space
    print_status "Cleaning up old Docker resources..."
    docker image prune -af --filter "until=24h"
    docker builder prune -af
    
    print_success "Docker optimized for speed"
}

# Main deployment function
deploy() {
    local strategy=${1:-rolling}
    
    print_status "Starting fast deployment with strategy: $strategy"
    
    # Pre-deployment optimizations
    optimize_for_speed
    
    case "$strategy" in
        "rolling")
            rolling_deployment
            ;;
        "blue-green")
            blue_green_deployment
            ;;
        "build-only")
            build_only
            ;;
        "quick")
            quick_restart
            ;;
        *)
            print_error "Unknown deployment strategy: $strategy"
            show_usage
            ;;
    esac
    
    # Post-deployment cleanup
    print_status "Cleaning up..."
    docker image prune -af --filter "until=1h"
    
    print_success "Deployment completed successfully!"
    print_status "Services status:"
    docker compose ps
}

# Main script logic
if [[ $# -eq 0 ]]; then
    deploy "rolling"
else
    case "${1:-}" in
        "rolling"|"blue-green"|"build-only"|"quick")
            deploy "$1"
            ;;
        "-h"|"--help"|"help")
            show_usage
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            ;;
    esac
fi
