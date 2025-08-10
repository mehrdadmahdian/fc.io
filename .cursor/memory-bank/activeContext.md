# Active Context - fc.io Application

## Current Status: RUNNING ✅

The fc.io application is now successfully running with all services operational.

## Recent Issues Fixed

### Frontend API Configuration Issue
**Problem**: The React dashboard UI was not properly configured to call API endpoints with the `/api` prefix.

**Root Cause**: 
- The `REACT_APP_API_BASE_URL` environment variable was set to `http://127.0.0.1:7000`
- Frontend was calling endpoints like `/auth/login` which resulted in `http://127.0.0.1:7000/auth/login`
- But the actual API endpoints are at `/api/auth/login` (i.e., `http://127.0.0.1:7000/api/auth/login`)

**Solution Applied**:
- Updated `.env` file: `API_URL=http://127.0.0.1/api` (removed port 7000, added `/api` suffix)
- Restarted all containers to pick up the new environment variable
- Now `REACT_APP_API_BASE_URL=http://127.0.0.1/api` in the dashboard UI container
- Frontend now correctly routes through nginx proxy instead of direct API access

## Application Access Points

### Main Services
- **Landing Page**: http://localhost (Next.js public UI)
- **Dashboard**: http://localhost/dashboard (React dashboard UI)
- **API**: http://localhost/api (Go Fiber API)
- **MongoDB Express**: http://localhost:8082 (admin/admin123)

### API Endpoints Working
- `POST /api/auth/register` - User registration ✅
- `POST /api/auth/login` - User login ✅
- `GET /api/auth/user` - Get user info (authenticated) ✅
- `GET /api/dashboard/boxes` - Get user boxes (authenticated) ✅

## Environment Configuration

Key environment variables in `.env`:
```bash
API_URL=http://127.0.0.1/api  # Routes through nginx proxy with /api prefix
REACT_APP_API_BASE_URL=http://127.0.0.1/api  # Set in container, no direct port access
```

## Next Steps

1. **Test Complete User Flow**: Registration → Login → Dashboard
2. **Test Card Creation**: Ensure users can create flashcards
3. **Test Review System**: Verify spaced repetition functionality
4. **Production Deployment**: Configure for production environment

## Known Working Features

- ✅ User registration with password validation
- ✅ JWT token-based authentication 
- ✅ User login/logout
- ✅ Dashboard access for authenticated users
- ✅ MongoDB and Redis connectivity
- ✅ Multi-language support (EN/FA)
- ✅ Docker containerization
- ✅ Nginx reverse proxy routing

## Development Notes

- All containers are running in development mode with hot reload
- MongoDB is seeded with initial data structure
- Redis is used for session management and caching
- Environment supports both web and API authentication flows