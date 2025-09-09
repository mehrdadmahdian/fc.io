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
    
    # Pre-build all images in parallel
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    
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
    
    export COMPOSE_PROJECT_NAME="fcio-green"
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    check_health api && check_health dashboard-ui && check_health public-ui && check_health nginx
    
    print_warning "Blue-green deployment requires additional nginx configuration"
    print_success "Blue-green deployment completed - manually switch load balancer"
}

# Strategy 3: Build Only (Pre-build for faster deployment)
build_only() {
    print_status "Building images..."
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    print_success "Images built - ready for deployment"
}

# Strategy 4: Quick Restart (Minimal Downtime)
quick_restart() {
    print_status "Quick restart deployment..."
    
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
    
    sleep 10
    check_health api && check_health dashboard-ui && check_health public-ui && check_health nginx
    
    print_success "Quick restart completed"
}

# Pre-deployment optimizations
optimize_for_speed() {
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    docker image prune -af --filter "until=24h" >/dev/null 2>&1
    docker builder prune -af >/dev/null 2>&1
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
