# Base stage for shared settings
FROM node:18-alpine AS base
WORKDIR /app

# Development stage
FROM base AS development
COPY ./public-ui/package.json ./public-ui/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY ./public-ui/tailwind.config.js ./
COPY ./public-ui/postcss.config.js ./
COPY ./public-ui .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Dependencies stage for production
FROM base AS deps
COPY ./public-ui/package.json ./public-ui/package-lock.json ./
RUN npm ci --legacy-peer-deps

# Builder stage for production
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY ./public-ui .
RUN npm run build

# Production runner stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000
CMD ["node", "server.js"]