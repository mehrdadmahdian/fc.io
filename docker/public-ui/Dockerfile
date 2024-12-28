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
WORKDIR /app
COPY public-ui/package.json public-ui/package-lock.json* ./
RUN npm install
COPY public-ui/ ./
RUN npm run build

FROM base AS production
WORKDIR /app
# Copy package files and install production dependencies
COPY public-ui/package.json public-ui/package-lock.json* ./
RUN npm install --omit=dev
# Copy the built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Set permissions
RUN chown -R node:node .
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]