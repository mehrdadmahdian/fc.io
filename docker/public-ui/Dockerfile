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
ENV NODE_ENV=production
COPY public-ui/package.json public-ui/package-lock.json* ./
RUN npm install --omit=dev
COPY --from=builder /app/.next ./.next
RUN chown -R node:node .
USER node
EXPOSE 3000
CMD ["npm", "start"]