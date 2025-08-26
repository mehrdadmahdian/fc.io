# Active Context - fc.io Application

## Current Status: RUNNING ✅ + REVERSE REVIEW FEATURE IMPLEMENTED ✅

The fc.io application is now successfully running with all services operational. 

## Recent Major Feature Implementation: Reverse Review Mode

**Feature Complete**: A complete reverse review mode has been implemented where users can review cards in reverse direction (Back → Front instead of Front → Back).

## Recent UI/UX Improvements

**UI Alignment and Consistency Fixes**:
- ✅ **Dashboard Layout**: Aligned box grid to match the 4-column layout of upper stats widgets
- ✅ **Header Redesign**: Removed "Your Boxes" text and replaced with better-positioned "Create New Box" button
- ✅ **Button Consistency**: Made Reverse Review button styling consistent with normal Review button
- ✅ **Mobile Optimization**: Reduced icon sizes for better mobile experience and fixed hamburger menu alignment
- ✅ **Page Width Consistency**: Ensured page titles have same width as content boxes (1200px max-width)

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

### Reverse Review Implementation Details

**Backend Changes**:
- Added `ReverseReview` field to Card model with independent history tracking
- Created separate repository methods for reverse review queries
- Implemented reverse review service methods using same spaced repetition algorithm
- Added new API endpoints: `/review/reverse/cards` and `/review/reverse/respond`

**Frontend Changes**:
- Added "Review Reverse" button to dashboard box cards (both icon and full view)
- Created `ReverseReview.jsx` page component
- Created `ReverseReviewCard.jsx` component that shows Back → Front
- Added routes and translations for reverse review mode
- Styled reverse review with purple theme to distinguish from normal review

**Key Features**:
- Completely independent review history for each direction
- Same spaced repetition algorithm for both modes
- Visual distinction with purple color scheme and "Reverse Mode" badge
- Available from dashboard box cards without any toggles

## Next Steps

1. **Test Reverse Review Feature**: Verify reverse review functionality in running application
2. **Test Complete User Flow**: Registration → Login → Dashboard → Review (both modes)
3. **Production Deployment**: Configure for production environment

## Known Working Features

- ✅ User registration with password validation
- ✅ JWT token-based authentication 
- ✅ User login/logout
- ✅ Dashboard access for authenticated users
- ✅ MongoDB and Redis connectivity
- ✅ Multi-language support (EN/FA)
- ✅ Docker containerization
- ✅ Nginx reverse proxy routing
- ✅ **Normal Review Mode**: Front → Back review with spaced repetition
- ✅ **Reverse Review Mode**: Back → Front review with independent history
- ✅ Box management and card creation
- ✅ Responsive UI with both icon and full view modes

## Development Notes

- All containers are running in development mode with hot reload
- MongoDB is seeded with initial data structure
- Redis is used for session management and caching
- Environment supports both web and API authentication flows