# FC.io Project Brief

## Overview
FC.io is a flashcard application system consisting of multiple services orchestrated with Docker. The system includes:

- **API Service**: Go-based backend with Fiber framework
- **Dashboard UI**: React-based dashboard for flashcard management
- **Public UI**: Next.js-based public facing website
- **Nginx**: Reverse proxy and load balancer
- **MongoDB**: Primary database
- **Redis**: Caching and session storage
- **Mongo Express**: Database management interface

## Architecture
The system uses a microservices architecture with:
- Multi-environment support (development/production)
- Docker containerization for all services
- Nginx reverse proxy routing requests to appropriate services
- JWT authentication between services
- MongoDB for data persistence
- Redis for caching and sessions

## Current Challenge
Fix Dockerfiles for all services to work correctly in both:
1. **Production environment** - Optimized builds, SSL, proper caching
2. **Local development** - Hot reloading, volume mounting, debugging

## Environment Configuration
- Production: Uses SSL, optimized builds, proper networking
- Development: Hot reloading, source mounting, debug logging
- Services communicate via Docker network `fc-network`

## Key Requirements
- Multi-stage Docker builds for development and production
- Proper environment variable handling
- Volume mounting for development hot reloading
- SSL termination at Nginx for production
- Health checks and dependency management
