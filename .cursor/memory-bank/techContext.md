# Technical Context - FC.io Platform

## Technology Stack Overview

FC.io is built with modern technologies designed for scalability, performance, and developer productivity.

## Backend Technologies

### Core Framework & Language
- **Go 1.23.0**: Primary backend language
- **Fiber v2**: High-performance web framework (Express-like for Go)
- **MongoDB Driver**: Official Go MongoDB driver v1.17.1
- **Redis Client**: go-redis/redis/v8 for caching and sessions

### Key Dependencies
```go
// Authentication & Security
github.com/golang-jwt/jwt/v5 v5.2.1          // JWT token management
golang.org/x/crypto v0.26.0                  // Password hashing, crypto

// Validation & HTTP
github.com/go-playground/validator/v10 v10.22.1 // Request validation
github.com/gofiber/template/html/v2 v2.1.2      // HTML templating

// Utilities
github.com/google/uuid v1.5.0                   // UUID generation
```

### Database Technologies
- **MongoDB**: Primary database for persistent storage
  - Document-based NoSQL for flexible schema
  - Native ObjectID support
  - Aggregation pipeline for complex queries
- **Redis**: Session storage and caching
  - JWT token blacklisting
  - Session management
  - Rate limiting capabilities

## Frontend Technologies

### Public UI (Landing Page)
- **Next.js 14.1.0**: React framework with SSR/SSG
- **TypeScript 5.x**: Type-safe development
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 11.0.0**: Advanced animations

```json
{
  "framework": "Next.js",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "animations": "Framer Motion",
  "deployment": "Standalone build"
}
```

### Dashboard UI (Application)
- **React 18.2.0**: Modern React with hooks
- **React Router DOM 6.22.0**: Client-side routing
- **Axios 1.7.9**: HTTP client with interceptors
- **i18next**: Internationalization support
- **Framer Motion**: UI animations

```json
{
  "framework": "React SPA",
  "routing": "React Router",
  "http": "Axios",
  "i18n": "react-i18next",
  "animations": "Framer Motion"
}
```

## Development Tools & Environment

### Build Tools
- **Go Modules**: Dependency management
- **NPM**: Node.js package management
- **Webpack**: Module bundling (via React Scripts)
- **ESBuild**: Fast compilation (Next.js)

### Development Workflow
- **Docker Compose**: Local development environment
- **Hot Reload**: Live development experience
  - Go: `reflex` for auto-restart
  - React: React Scripts dev server
  - Next.js: Built-in fast refresh
- **Environment Variables**: `.env` configuration

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Go Validator**: Request validation
- **Type Safety**: TypeScript for frontends

## Infrastructure & Deployment

### Containerization
- **Docker**: Multi-stage builds for all services
- **Docker Compose**: Orchestration for development and production
- **Nginx**: Reverse proxy and static file serving

### Service Architecture
```yaml
services:
  - nginx:        # Reverse proxy, SSL termination
  - api:          # Go backend service
  - dashboard-ui: # React dashboard app
  - public-ui:    # Next.js landing page
  - mongodb:      # Primary database
  - redis:        # Caching & sessions
  - mongo-express: # Database admin (dev only)
```

### Network Configuration
- **Nginx Routing**: Path-based service routing
  - `/` → Public UI (Next.js)
  - `/dashboard` → Dashboard UI (React)
  - `/api` → Go API server
  - `/web` → Go server-side pages
- **SSL/TLS**: HTTPS with self-signed certificates
- **CORS**: Configured for cross-origin requests

## Data Architecture

### Database Design
- **MongoDB Collections**:
  - `users`: User accounts and authentication
  - `boxes`: Flashcard collections
  - `cards`: Individual flashcards with review data
  - `labels`: Card categorization tags
  - `stages`: Learning progression stages

- **Redis Keys**:
  - `blacklisted_tokens`: JWT token revocation
  - `user_sessions`: Session data
  - `rate_limits`: API rate limiting

### Data Relationships
```
User (1) ←→ (N) Box (1) ←→ (N) Card (N) ←→ (N) Label
```

## API Architecture

### REST API Design
- **Base URL**: `/api/v1` (implied structure)
- **Authentication**: Bearer JWT tokens
- **Content Type**: JSON for API, HTML for web routes
- **Error Handling**: Structured error responses

### Endpoint Patterns
```
Authentication:
POST /api/auth/login      # User login
POST /api/auth/register   # User registration
GET  /api/auth/refresh    # Token refresh
POST /api/auth/logout     # User logout

Dashboard:
GET    /api/dashboard/boxes                    # List user boxes
GET    /api/dashboard/boxes/:id/review/cards   # Get cards for review
POST   /api/dashboard/boxes/:id/review/respond # Submit review response
POST   /api/dashboard/boxes/:id/cards          # Create new card
PUT    /api/dashboard/boxes/:id/cards/:cardId  # Update card
```

## Security Implementation

### Authentication Flow
1. **Registration/Login**: Password hashing with bcrypt
2. **JWT Tokens**: Access (24h) + Refresh (30d) tokens
3. **Token Refresh**: Automatic renewal on expiration
4. **Logout**: Token blacklisting in Redis

### Security Middleware
- **CORS**: Cross-origin request handling
- **CSP**: Content Security Policy headers
- **CSRF**: Token-based CSRF protection (web routes)
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request payload validation

## Performance Optimizations

### Backend Performance
- **Connection Pooling**: MongoDB and Redis connections
- **Caching Strategy**: Redis for frequently accessed data
- **Efficient Queries**: MongoDB aggregation pipelines
- **Static Assets**: Nginx serving for optimal performance

### Frontend Performance
- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Image optimization and compression
- **CDN Ready**: Static assets optimized for CDN delivery
- **Caching**: Browser and proxy caching strategies

## Development Setup

### Prerequisites
- **Docker & Docker Compose**: Container orchestration
- **Go 1.23+**: Backend development
- **Node.js 18+**: Frontend development
- **Git**: Version control

### Environment Configuration
```bash
# Required environment variables
MONGODB_URI=mongodb://username:password@host:port/database
REDIS_ADDRESS=host:port
JWT_SECRET=your-secret-key
API_SERVER_PORT=8080
```

### Local Development Commands
```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Backend development
cd api && go run cmd/server/main.go

# Frontend development
cd dashboard-ui && npm start
cd public-ui && npm run dev
```

This technical foundation provides a robust, scalable platform for the flashcard learning application while maintaining developer productivity and system reliability.
