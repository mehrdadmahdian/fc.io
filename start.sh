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
    echo "Usage: $0 [dev|prod|stop|restart|logs|status|clean]"
    echo ""
    echo "Commands:"
    echo "  dev      - Start development environment"
    echo "  prod     - Start production environment" 
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  logs     - Show logs for all services"
    echo "  status   - Show status of all services"
    echo "  clean    - Clean up Docker resources"
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

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    check_env_file
    
    # Update APP_ENV in .env for development
    sed -i.bak 's/APP_ENV=production/APP_ENV=development/' .env
    
    APP_ENV=development docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
}

# Start production environment
start_prod() {
    print_status "Starting production environment..."
    check_env_file
    
    # Update APP_ENV in .env for production
    sed -i.bak 's/APP_ENV=development/APP_ENV=production/' .env
    
    APP_ENV=production docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
    print_success "Production environment started in detached mode"
    print_status "Use '$0 logs' to view logs or '$0 status' to check service status"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.prod.yml down
    print_success "All services stopped"
}

# Restart services
restart_services() {
    print_status "Restarting services..."
    stop_services
    sleep 2
    
    # Check current environment
    if grep -q "APP_ENV=production" .env 2>/dev/null; then
        start_prod
    else
        print_status "Defaulting to development environment"
        start_dev
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
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
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
    *)
        show_usage
        ;;
esac
