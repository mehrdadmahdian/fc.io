FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY ./dashboard-ui/package.json ./dashboard-ui/package-lock.json* ./
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps && \
    npm install ajv@8.12.0 --save-exact && \
    npm install react-scripts@5.0.1 --save

# Copy source code
COPY ./dashboard-ui .

# Build the application with the correct base URL
ENV PUBLIC_URL=/dashboard
ARG REACT_APP_API_BASE_URL  
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
RUN npm run build

FROM node:18-alpine AS development

WORKDIR /app

# Copy package files first for better layer caching
COPY ./dashboard-ui/package.json ./dashboard-ui/package-lock.json* ./
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps && \
    npm install react-scripts@5.0.1 --save

# Set environment variables for development HOT RELOAD
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=true
ENV WDS_SOCKET_HOST=0.0.0.0
ENV WDS_SOCKET_PORT=0
ENV GENERATE_SOURCEMAP=false

# Create a startup script to handle volume mounting properly
RUN echo '#!/bin/sh' > /start-dev.sh && \
    echo 'echo "Starting React development server with hot reload..."' >> /start-dev.sh && \
    echo 'echo "Waiting for source files to be mounted..."' >> /start-dev.sh && \
    echo 'while [ ! -f "/app/src/index.js" ] && [ ! -f "/app/src/index.jsx" ]; do sleep 1; done' >> /start-dev.sh && \
    echo 'echo "Source files detected, starting server..."' >> /start-dev.sh && \
    echo 'npm start' >> /start-dev.sh && \
    chmod +x /start-dev.sh

# Expose the development port
EXPOSE 3000

# Start the development server with proper hot reload
CMD ["/start-dev.sh"]

# Production Stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy build artifacts from the base stage
COPY --from=base /app/build /app/build

RUN npm install -g serve
EXPOSE 3000

# Correct serve command syntax
CMD ["serve", "-s", "build", "-l", "3000", "--single"]