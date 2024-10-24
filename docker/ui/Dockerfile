FROM node:18-alpine AS base

WORKDIR /app
COPY ./ui/package.json ./ui/package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY ./ui /app

EXPOSE 3000

FROM base AS development
RUN echo "Building the development environment..."
CMD ["npm", "run", "serve", "--", "--port", "3000"]

FROM base AS production
RUN echo "Building the production environment..."
RUN npm run build
RUN npm install -g serve
CMD ["sh", "-c", "serve -s dist -l 3000"]