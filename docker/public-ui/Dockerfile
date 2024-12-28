FROM node:18-alpine AS base
WORKDIR /app

FROM base AS development
ENV NODE_ENV=development
COPY public-ui/package.json public-ui/package-lock.json* ./
RUN npm install
COPY public-ui/ ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
ENV NODE_ENV=production
COPY public-ui/package.json public-ui/package-lock.json* ./
RUN npm install
COPY public-ui/ ./
RUN mkdir -p public
RUN npm run build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Copy package files first
COPY public-ui/package.json public-ui/package-lock.json* ./
# Install dependencies including those needed for build
RUN npm install
# Create public directory
RUN mkdir -p public
# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["npm", "start"]