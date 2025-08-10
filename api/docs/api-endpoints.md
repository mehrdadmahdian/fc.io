gt# FC.io API Endpoints

## Overview

The FC.io API provides two sets of routes for box management to support different frontend integrations:

1. **Dashboard Routes**: `/api/dashboard/*` (original)
2. **Direct Box Routes**: `/api/boxes/*` (simplified, added for compatibility)

## Authentication

All endpoints except `/api/health-check` and `/api/auth/*` require authentication via Bearer token:

```
Authorization: Bearer <token>
```

## Endpoints

### Health Check
- `GET /api/health-check` - Check API status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout (requires auth)
- `GET /api/auth/user` - Get current user info (requires auth)
- `GET /api/auth/refresh` - Refresh token
- `GET /api/auth/check` - Check authentication status (requires auth)

### Box Management (Dashboard Routes)
- `GET /api/dashboard/boxes` - Get user's boxes
- `POST /api/dashboard/boxes` - Create new box
- `GET /api/dashboard/boxes/:boxid` - Get specific box
- `PUT /api/dashboard/boxes/:boxid` - Update box
- `DELETE /api/dashboard/boxes/:boxid` - Delete box

### Box Management (Direct Routes)
- `GET /api/boxes` - Get user's boxes
- `POST /api/boxes` - Create new box
- `POST /api/boxes/create` - Create new box (alternative)
- `GET /api/boxes/:boxid` - Get specific box
- `PUT /api/boxes/:boxid` - Update box
- `DELETE /api/boxes/:boxid` - Delete box

### Card Management (Dashboard Routes)
- `GET /api/dashboard/boxes/:boxid/cards` - Get box cards
- `POST /api/dashboard/boxes/:boxid/cards` - Create new card
- `GET /api/dashboard/boxes/:boxid/cards/:cardid` - Get specific card
- `PUT /api/dashboard/boxes/:boxid/cards/:cardid` - Update card
- `DELETE /api/dashboard/boxes/:boxid/cards/:cardid` - Delete card
- `POST /api/dashboard/boxes/:boxid/cards/:cardid/archive` - Archive card

### Card Management (Direct Routes)
- `GET /api/boxes/:boxid/cards` - Get box cards
- `POST /api/boxes/:boxid/cards` - Create new card
- `GET /api/boxes/:boxid/cards/:cardid` - Get specific card
- `PUT /api/boxes/:boxid/cards/:cardid` - Update card
- `DELETE /api/boxes/:boxid/cards/:cardid` - Delete card
- `POST /api/boxes/:boxid/cards/:cardid/archive` - Archive card

### Review System (Dashboard Routes)
- `GET /api/dashboard/boxes/:boxid/review/cards` - Get cards for review
- `POST /api/dashboard/boxes/:boxid/review/respond` - Submit review response

### Review System (Direct Routes)
- `GET /api/boxes/:boxid/review/cards` - Get cards for review
- `POST /api/boxes/:boxid/review/respond` - Submit review response

## Request/Response Examples

### Create Box
```bash
POST /api/boxes
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Spanish Vocabulary",
  "description": "Basic Spanish words and phrases"
}
```

Alternative endpoint:
```bash
POST /api/boxes/create
# Same request body as above
```

### Response
```json
{
  "status": "SUCCESS",
  "message": "box created successfully",
  "data": {
    "box": {
      "ID": "507f1f77bcf86cd799439011",
      "Name": "Spanish Vocabulary",
      "Description": "Basic Spanish words and phrases",
      "CreatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Error Response
```json
{
  "status": "FAILD",
  "message": "Invalid token provided"
}
```

## Status Codes

- `200` - Success
- `401` - Unauthorized (invalid/missing token)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

## Notes

Both route sets (`/dashboard/*` and `/boxes/*`) point to the same handlers and provide identical functionality. The `/boxes/*` routes were added for simpler integration and backward compatibility.

All requests are logged with full context including request ID, user ID, performance metrics, and error details for troubleshooting.
