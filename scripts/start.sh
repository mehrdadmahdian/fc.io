#!/bin/bash

# FC.io Docker Startup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to show usage
show_usage() {
    echo "Usage: $0 [dev|prod|stop|restart|logs|status|clean|build|attach|deploy]"
    echo ""
    echo "Commands:"
    echo "  dev      - Start development environment (with hot reload)"
    echo "  prod     - Start production environment" 
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  logs     - Show logs for all services"
    echo "  status   - Show status of all services"
    echo "  clean    - Clean up Docker resources"
    echo "  build    - Force rebuild all images"
    echo "  attach   - Attach to running development environment"
    echo "  deploy   - Fast zero-downtime deployment (uses scripts/fast-deploy.sh)"
    echo ""
    echo "Options:"
    echo "  --build  - Force rebuild images (can be used with dev/prod)"
    echo ""
    echo "Fast Deployment:"
    echo "  ./start.sh deploy          # Zero-downtime rolling deployment"
    echo "  scripts/fast-deploy.sh     # More deployment options"
    echo ""
    echo "Hot Reload Info:"
    echo "  In development mode, your code changes are automatically reloaded:"
    echo "  • Go files: Automatically recompiled and restarted"
    echo "  • React files: Hot module replacement (HMR)"
    echo "  • Next.js files: Fast refresh"
    echo ""
    exit 1
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        print_status "Creating .env file from template..."
        if [ -f env.template ]; then
            cp env.template .env
            print_success ".env file created. Please review and update it."
        else
            print_error "env.template file not found!"
            exit 1
        fi
    fi
}

# Check if we should force rebuild
should_build() {
    if [[ "$*" == *"--build"* ]]; then
        return 0  # true
    fi
    return 1  # false
}

# Check if images exist and are recent
check_images_exist() {
    # Get the project name from docker-compose (usually the directory name)
    local project_name=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    local images=("${project_name}-api" "${project_name}-dashboard-ui" "${project_name}-public-ui" "${project_name}-nginx")
    local missing_images=()
    
    for image in "${images[@]}"; do
        if ! docker images --format "{{.Repository}}" | grep -q "^${image}$"; then
            missing_images+=("$image")
        fi
    done
    
    if [ ${#missing_images[@]} -gt 0 ]; then
        print_warning "Missing Docker images: ${missing_images[*]}"
        print_status "This appears to be your first run. Images will be built automatically..."
        return 1  # false - images don't exist
    fi
    
    return 0  # true - all images exist
}

# Check if containers are running
check_containers_running() {
    local running_containers=$(docker compose ps --services --filter "status=running" 2>/dev/null | wc -l)
    if [ "$running_containers" -gt 0 ]; then
        return 0  # true - containers are running
    fi
    return 1  # false - no containers running
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    check_env_file
    
    # Update APP_ENV in .env for development
    sed -i.bak 's/APP_ENV=production/APP_ENV=development/' .env
    
    # Determine if we should build
    local build_flag=""
    if should_build "$@"; then
        print_status "Force building images (--build flag detected)..."
        build_flag="--build"
    elif ! check_images_exist; then
        print_status "Building images for first-time setup..."
        build_flag="--build"
    elif check_containers_running; then
        print_success "Development environment is already running!"
        print_status "Your code changes will be automatically reloaded (hot reload enabled)"
        print_status "Use 'docker compose logs -f' to see logs, or './start.sh stop' to stop"
        return 0
    else
        print_success "Using existing images - starting with hot reload enabled"
        print_status "✅ Go files: Auto-reload on save"
        print_status "✅ React files: Hot reload on save" 
        print_status "✅ Next.js files: Hot reload on save"
    fi
    
    APP_ENV=development docker compose -f docker-compose.yml -f docker-compose.dev.yml up $build_flag
}

# Start production environment
start_prod() {
    print_status "Starting production environment..."
    check_env_file
    
    # Update APP_ENV in .env for production
    sed -i.bak 's/APP_ENV=development/APP_ENV=production/' .env
    
    # Determine if we should build
    local build_flag=""
    if should_build "$@" || ! check_images_exist; then
        print_status "Building images..."
        build_flag="--build"
    else
        print_status "Using existing images (use --build to force rebuild)"
    fi
    
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up $build_flag -d
    print_success "Production environment started in detached mode"
    print_status "Use '$0 logs' to view logs or '$0 status' to check service status"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.prod.yml down
    print_success "All services stopped"
}

# Force build all images
build_images() {
    print_status "Force building all images..."
    check_env_file
    
    # Build for both environments to ensure images are ready
    print_status "Building development images..."
    APP_ENV=development docker compose -f docker-compose.yml -f docker-compose.dev.yml build
    
    print_status "Building production images..."  
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build
    
    print_success "All images built successfully"
    print_status "You can now use './start.sh dev' or './start.sh prod' for fast startup"
}

# Restart services
restart_services() {
    print_status "Restarting services..."
    stop_services
    sleep 2
    
    # Check current environment and pass through arguments
    if grep -q "APP_ENV=production" .env 2>/dev/null; then
        start_prod "$@"
    else
        print_status "Defaulting to development environment"
        start_dev "$@"
    fi
}

# Show logs
show_logs() {
    print_status "Showing logs for all services..."
    docker compose -f docker-compose.yml logs --follow --tail=50
}

# Show status
show_status() {
    print_status "Service status:"
    docker compose -f docker-compose.yml ps
    
    print_status "\nContainer health status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Attach to running development environment
attach_dev() {
    if check_containers_running; then
        print_success "Attaching to running development environment..."
        print_status "Press Ctrl+C to detach (containers will keep running)"
        docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --follow --tail=50
    else
        print_warning "Development environment is not running"
        print_status "Use './start.sh dev' to start it"
    fi
}

# Fast zero-downtime deployment
fast_deploy() {
    print_status "Starting fast zero-downtime deployment..."
    
    if [ -f "scripts/fast-deploy.sh" ]; then
        print_status "Using advanced deployment script..."
        ./scripts/fast-deploy.sh rolling
    else
        print_warning "Advanced deployment script not found, using basic rolling update..."
        
        # Basic rolling update
        print_status "Building new images..."
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel
        
        print_status "Rolling update - updating services one by one..."
        
        # Update databases first
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps redis mongodb
        sleep 5
        
        # Update API
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps api
        sleep 10
        
        # Update frontend services
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps dashboard-ui public-ui
        sleep 5
        
        # Update nginx last
        APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps nginx
        
        print_success "Basic rolling deployment completed!"
    fi
}

# Clean up Docker resources
clean_docker() {
    print_warning "This will remove stopped containers, unused networks, and build cache"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker system prune -f
        docker volume prune -f
        print_success "Docker cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main script logic
case "${1:-}" in
    "dev")
        start_dev "$@"
        ;;
    "prod")
        start_prod "$@"
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services "$@"
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_docker
        ;;
    "build")
        build_images
        ;;
    "attach")
        attach_dev
        ;;
    "deploy")
        fast_deploy
        ;;
    *)
        show_usage
        ;;
esac
