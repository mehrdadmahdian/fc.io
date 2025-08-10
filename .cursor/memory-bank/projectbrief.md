# fc.io Project Brief

## Overview
fc.io is a smart flashcards application designed to help users master any subject using spaced repetition learning techniques. The application consists of multiple components working together to provide a comprehensive learning platform.

## Core Requirements
- **Spaced Repetition Learning**: Implement intelligent flashcard review scheduling
- **User Management**: Registration, authentication, and user profiles
- **Box-based Organization**: Organize flashcards into themed boxes/collections
- **Multi-language Support**: Support for English and Farsi (Persian)
- **Cross-platform Access**: Web-based application accessible across devices

## Architecture Components
1. **API Backend** (Go/Fiber): RESTful API server handling business logic
2. **Public UI** (Next.js): Landing page and marketing site
3. **Dashboard UI** (React): User dashboard for managing flashcards
4. **Database** (MongoDB): Data persistence layer
5. **Cache** (Redis): Session management and caching
6. **Reverse Proxy** (Nginx): Load balancing and routing

## Key Features
- User authentication and authorization (JWT-based)
- Flashcard creation and management
- Review system with spaced repetition algorithm
- Box/collection organization
- Multi-language interface
- Admin tools for database management

## Technology Stack
- **Backend**: Go 1.23, Fiber framework
- **Frontend**: React 18, Next.js 14
- **Database**: MongoDB with mongo-express admin
- **Cache**: Redis
- **Infrastructure**: Docker, Docker Compose, Nginx
- **Styling**: Tailwind CSS, custom CSS
- **Internationalization**: i18next

## Development Environment
- Dockerized development setup
- Hot reloading for all components
- MongoDB Express for database administration
- Environment-based configuration
