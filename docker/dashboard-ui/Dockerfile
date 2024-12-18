FROM node:18-alpine AS base

WORKDIR /app

# First, copy only package files
COPY ./dashboard-ui/package.json ./dashboard-ui/package-lock.json* ./

# Clear npm cache and remove any existing node_modules
RUN npm cache clean --force && \
    rm -rf node_modules

# Install dependencies with specific ajv version and ensure react-scripts is installed
RUN npm install --legacy-peer-deps && \
    npm install ajv@8.12.0 --save-exact && \
    npm install react-scripts@5.0.1 --save

# Copy the rest of the application
COPY ./dashboard-ui /app

EXPOSE 3000

# Base development stage
FROM node:18-alpine AS development

WORKDIR /app

# Install dependencies first (better layer caching)
COPY ./dashboard-ui/package.json ./dashboard-ui/package-lock.json* ./
RUN npm install --legacy-peer-deps && \
    npm install react-scripts@5.0.1 --save

# Copy the rest of the application code
COPY ./dashboard-ui .

# Environment setup
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=true

# Expose port
EXPOSE 3000

# Start in development mode
CMD ["npm", "start"]

# Production stage (if needed)
FROM development AS production
ENV NODE_ENV=production
RUN npm install --legacy-peer-deps && \
    npm install react-scripts@5.0.1 --save && \
    npm run build
RUN npm install -g serve
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
CMD ["serve", "-s", "build", "-l", "3000"]