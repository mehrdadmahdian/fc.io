#!/bin/bash

# Fast Zero-Downtime Production Deployment Script
set -e

print_status() {
    echo "$1"
}

print_success() {
    echo "✅ $1"
}

print_warning() {
    echo "⚠️  $1"
}

print_error() {
    echo "❌ $1"
}

# Function to check available memory and set build limits
check_and_set_resource_limits() {
    # Get available memory in MB (works on Linux and macOS)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
        TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        TOTAL_MEM=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024)}')
        AVAILABLE_MEM=$(vm_stat | grep "Pages free" | awk '{print int($3 * 4096 / 1024 / 1024)}')
    else
        # Default conservative values
        TOTAL_MEM=4096
        AVAILABLE_MEM=2048
    fi
    
    print_status "System Memory: ${TOTAL_MEM}MB total, ${AVAILABLE_MEM}MB available"
    
    # Set conservative build limits based on available memory
    if [ "$AVAILABLE_MEM" -lt 2048 ]; then
        print_warning "Low memory detected. Using sequential build mode."
        export BUILD_MODE="sequential"
        export NODE_OPTIONS="--max-old-space-size=1024"
    elif [ "$AVAILABLE_MEM" -lt 4096 ]; then
        print_warning "Moderate memory available. Using limited parallel builds."
        export BUILD_MODE="limited"
        export NODE_OPTIONS="--max-old-space-size=2048"
    else
        print_status "Sufficient memory available. Using parallel builds."
        export BUILD_MODE="parallel"
        export NODE_OPTIONS="--max-old-space-size=3072"
    fi
}

# Function to check service health
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker compose ps $service | grep -q 'healthy\|Up'; then
            return 0
        fi
        sleep 5
        ((attempt++))
    done
    print_error "$service failed to start"
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
    print_status "Starting rolling deployment..."
    
    # Check resources and set limits
    check_and_set_resource_limits
    
    # Build images based on available resources
    if [ "$BUILD_MODE" = "sequential" ]; then
        print_status "Building images sequentially to conserve memory..."
        # Build one service at a time
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build api
        
        # Clean up intermediate layers before building heavy Node.js apps
        docker builder prune -f --filter "until=1h" >/dev/null 2>&1
        
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui
        
        # Clean up again before final build
        docker builder prune -f --filter "until=1h" >/dev/null 2>&1
        
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build public-ui
    elif [ "$BUILD_MODE" = "limited" ]; then
        print_status "Building images with limited parallelism..."
        # Build lightweight services together, heavy ones separately
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx api
        docker builder prune -f --filter "until=1h" >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui public-ui
    else
        print_status "Building all images in parallel..."
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    fi
    
    # Clean up after build
    docker builder prune -f >/dev/null 2>&1
    
    # Rolling update strategy - update services one by one
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps redis mongodb
    check_health redis && check_health mongodb
    
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps api
    check_health api
    
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps dashboard-ui public-ui
    check_health dashboard-ui && check_health public-ui
    
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps nginx
    check_health nginx
    
    print_success "Rolling deployment completed"
}

# Strategy 2: Blue-Green Deployment
blue_green_deployment() {
    print_status "Starting blue-green deployment..."
    
    # Check resources and set limits
    check_and_set_resource_limits
    
    export COMPOSE_PROJECT_NAME="fcio-green"
    
    # Build based on available resources
    if [ "$BUILD_MODE" = "sequential" ]; then
        print_status "Building images sequentially..."
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx api
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build public-ui
    elif [ "$BUILD_MODE" = "limited" ]; then
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx api
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui public-ui
    else
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    fi
    
    docker builder prune -f >/dev/null 2>&1
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    check_health api && check_health dashboard-ui && check_health public-ui && check_health nginx
    
    print_warning "Blue-green deployment requires additional nginx configuration"
    print_success "Blue-green deployment completed - manually switch load balancer"
}

# Strategy 3: Build Only (Pre-build for faster deployment)
build_only() {
    print_status "Building images..."
    
    # Check resources and set limits
    check_and_set_resource_limits
    
    # Build based on available resources
    if [ "$BUILD_MODE" = "sequential" ]; then
        print_status "Building images sequentially..."
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx api
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build public-ui
    elif [ "$BUILD_MODE" = "limited" ]; then
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx api
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui public-ui
    else
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    fi
    
    docker builder prune -f >/dev/null 2>&1
    print_success "Images built - ready for deployment"
}

# Strategy 4: Quick Restart (Minimal Downtime)
quick_restart() {
    print_status "Quick restart deployment..."
    
    # Check resources and set limits
    check_and_set_resource_limits
    
    # Build based on available resources
    if [ "$BUILD_MODE" = "sequential" ]; then
        print_status "Building images sequentially..."
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx api
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build public-ui
    elif [ "$BUILD_MODE" = "limited" ]; then
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build nginx api
        docker builder prune -f >/dev/null 2>&1
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build dashboard-ui public-ui
    else
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    fi
    
    docker builder prune -f >/dev/null 2>&1
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
    
    sleep 10
    check_health api && check_health dashboard-ui && check_health public-ui && check_health nginx
    
    print_success "Quick restart completed"
}

# Pre-deployment optimizations
optimize_for_speed() {
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    print_status "Cleaning up old Docker resources..."
    
    # Remove dangling images and build cache older than 24h
    docker image prune -f --filter "until=24h" >/dev/null 2>&1
    
    # Clean up build cache but keep recent layers for faster rebuilds
    docker builder prune -f --filter "until=24h" >/dev/null 2>&1
    
    # Remove stopped containers older than 1 hour
    docker container prune -f --filter "until=1h" >/dev/null 2>&1
    
    print_success "Docker cleanup completed"
}

# Main deployment function
deploy() {
    local strategy=${1:-rolling}
    
    print_status "Deploying with $strategy strategy..."
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
    
    docker image prune -af --filter "until=1h" >/dev/null 2>&1
    print_success "Deployment completed"
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
