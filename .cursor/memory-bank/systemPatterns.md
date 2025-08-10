# System Architecture & Patterns - FC.io

## Overall Architecture

FC.io follows a **microservices-inspired architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐
│   Public UI     │    │  Dashboard UI   │
│   (Next.js)     │    │   (React SPA)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
        ┌─────────────────────────┐
        │     Nginx Proxy         │
        └─────────┬───────────────┘
                  │
        ┌─────────────────────────┐
        │    Go API Server        │
        │  (Fiber Framework)      │
        └─────────┬───────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌────▼────┐   ┌────▼────┐
│MongoDB│    │  Redis  │   │  Logs   │
└───────┘    └─────────┘   └─────────┘
```

## Core Architectural Patterns

### 1. Clean Architecture (Hexagonal)

The Go backend follows clean architecture principles:

```
┌─────────────────────────────────────┐
│           Handlers Layer            │
│  (HTTP endpoints, middleware)       │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│         Services Layer              │
│  (Business logic, orchestration)   │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│       Repository Layer              │
│  (Data access, MongoDB queries)    │
└─────────────────────────────────────┘
```

### 2. Dependency Injection Container

The application uses a custom DI container pattern:

```go
type Container struct {
    LoggerService *logger_service.LoggerService
    MongoService  *mongo_service.MongoService
    RedisService  *redis_service.RedisService
    AuthService   *auth_service.AuthService
    BoxService    *box_service.BoxService
    CardService   *card_service.CardService
    Seeder        *seeders.Seeder
    ApiHandler    *api_handlers.ApiHandler
    WebHandler    *web_handlers.WebHandler
}
```

### 3. Repository Pattern

Data access is abstracted through repository interfaces:
- `UserRepository` - User management and authentication
- `BoxRepository` - Flashcard box operations
- `CardRepository` - Individual card management
- `StageRepository` - Learning stage tracking
- `LabelRepository` - Card categorization

### 4. Service Layer Pattern

Business logic is encapsulated in service layers:
- `AuthService` - Authentication, JWT tokens, user sessions
- `BoxService` - Box creation, management, statistics
- `CardService` - Card CRUD, review algorithm
- `LoggerService` - Centralized logging
- `MongoService` - Database connection management
- `RedisService` - Caching and session storage

## Key Design Patterns

### 1. Middleware Chain Pattern

Both API and web routes use middleware chains:
```go
// API middleware chain
apiGroup.Use(ApiCSPMiddleware)
dashboardGroup := apiGroup.Group("/dashboard").Use(AuthMiddleware)

// Web middleware chain  
webGroup.Use(ErrorHandlingMiddleware, CSPMiddleware)
dashboardGroup.Use(WebAuthMiddleware, GenerateCSRFMiddleware, CheckCSRFMiddleware)
```

### 2. Factory Pattern

Services are created through factory functions:
```go
func NewAuthService(userRepository *repositories.UserRepository, config map[string]interface{}) (*AuthService, error)
func NewBoxService(boxRepo, cardRepo, stageRepo, labelRepo repositories) (*BoxService, error)
```

### 3. Error Handling Pattern

Consistent error handling with custom error types:
```go
type ServiceCreationError struct {
    ServiceName          string
    Err                  error
    OriginalErrorMessage string
}
```

### 4. Configuration Pattern

Environment-based configuration with defaults:
```go
type Config struct {
    MongoURI   string
    RedisAddr  string
    ServerAddr string
    Auth       map[string]interface{}
}
```

## Data Models & Domain Logic

### 1. Core Domain Models

**User**: Authentication and profile management
```go
type User struct {
    ID       primitive.ObjectID `bson:"_id,omitempty"`
    Name     string            `bson:"name"`
    Email    string            `bson:"email"`
    Password string            `bson:"password"`
}
```

**Box**: Collection container for related flashcards
```go
type Box struct {
    ID          primitive.ObjectID `bson:"_id,omitempty"`
    UserID      primitive.ObjectID `bson:"user_id"`
    Name        string            `bson:"name"`
    Description string            `bson:"description"`
    User        *User             `bson:user,omitempty`
}
```

**Card**: Individual flashcard with spaced repetition data
```go
type Card struct {
    ID        primitive.ObjectID   `bson:"_id,omitempty"`
    BoxID     primitive.ObjectID   `bson:"box_id"`
    LabelIDs  []primitive.ObjectID `bson:"label_ids"`
    Front     string              `bson:"front"`
    Back      string              `bson:"back"`
    Extra     string              `bson:"extra"`
    Review    Review              `bson:"review"`
    CreatedAt time.Time           `bson:"created_at"`
    UpdatedAt time.Time           `bson:"updated_at"`
}
```

### 2. Spaced Repetition Logic

The review system implements a modified SM-2 algorithm:
```go
type Review struct {
    LastReviewDate *time.Time            `bson:"last_review_date"`
    NextDueDate    *time.Time            `bson:"next_due_date"`
    Interval       int                   `bson:"current_interval"`
    EaseFactor     float64               `bson:"ease_factor"`
    ReviewsCount   int                   `bson:"reviews_count"`
    ReviewHistory  []ReviewHistoryRecord `bson:"review_history"`
}
```

## Frontend Architecture Patterns

### 1. Component-Based Architecture (React/Next.js)

Both frontends use component-based patterns:
- **Atomic Design**: Small, reusable components
- **Container/Presentation**: Smart vs. dumb components
- **Context Providers**: Global state management
- **Custom Hooks**: Shared logic abstraction

### 2. Route-Based Code Splitting

```jsx
// Protected route pattern
<Route 
    path="/dashboard" 
    element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth/login" />} 
/>
```

### 3. API Integration Pattern

Centralized API service with interceptors:
```javascript
// Request interceptor for authentication
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

## Security Patterns

### 1. JWT Authentication Flow
- Access tokens for API calls (short-lived)
- Refresh tokens for token renewal (long-lived)
- Token blacklisting for logout
- Automatic token refresh on 401 responses

### 2. CSRF Protection
- CSRF tokens for web forms
- SameSite cookie attributes
- Origin validation

### 3. Content Security Policy
- Middleware-enforced CSP headers
- Environment-specific policies
- XSS prevention

## Deployment Patterns

### 1. Multi-Stage Docker Builds
- Development and production stages
- Optimized layer caching
- Environment-specific configurations

### 2. Reverse Proxy Pattern
- Nginx as API gateway
- Path-based routing
- Static asset serving
- SSL termination

### 3. Service Orchestration
- Docker Compose for local development
- Environment variable configuration
- Network isolation
- Volume management

This architecture provides scalability, maintainability, and clear separation of concerns while supporting the complex learning algorithms and user experience requirements of the flashcard platform.
