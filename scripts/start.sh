#!/bin/bash
set -e

# Simple dev script - create .env if missing
if [ ! -f .env ]; then
    echo "Creating .env from template..."
    cp env.template .env
fi

case "${1:-dev}" in
    "dev"|"start")
        echo "🚀 Starting development environment..."
        sed -i.bak 's/APP_ENV=production/APP_ENV=development/' .env
        if [[ "$*" == *"--build"* ]]; then
            docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
        else
            docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
        fi
        echo "✅ Dev environment running with hot reload"
        ;;
    "prod")
        echo "🏭 Starting production environment..."
        sed -i.bak 's/APP_ENV=development/APP_ENV=production/' .env
        if [[ "$*" == *"--fast"* ]]; then
            ./scripts/fast-deploy.sh rolling
        elif [[ "$*" == *"--build"* ]]; then
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
        else
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        fi
        echo "✅ Production environment running"
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker compose down
        ;;
    "logs")
        docker compose logs -f --tail=50
        ;;
    "restart")
        echo "🔄 Restarting..."
        docker compose down
        if grep -q "APP_ENV=production" .env 2>/dev/null; then
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        else
            docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
        fi
        ;;
    *)
        echo "Usage: $0 [dev|prod|stop|logs|restart] [--build|--fast]"
        echo ""
        echo "  dev      - Start development (default)"
        echo "  prod     - Start production"  
        echo "  stop     - Stop all services"
        echo "  logs     - Show logs"
        echo "  restart  - Restart current environment"
        echo "  --build  - Force rebuild images"
        echo "  --fast   - Use fast deployment (prod only)"
        ;;
esac
