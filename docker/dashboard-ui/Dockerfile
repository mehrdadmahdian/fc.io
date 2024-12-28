FROM node:18-alpine AS base

WORKDIR /app

COPY ./dashboard-ui/package.json ./dashboard-ui/package-lock.json* ./
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps && \
    npm install ajv@8.12.0 --save-exact && \
    npm install react-scripts@5.0.1 --save


COPY ./dashboard-ui /app

RUN npm run build


FROM node:18-alpine AS development

WORKDIR /app

COPY --from=base /app/package.json /app/package-lock.json* ./
RUN npm install --legacy-peer-deps && \
    npm install react-scripts@5.0.1 --save
COPY ./dashboard-ui .

# Set environment variables for development
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=true

# Expose the development port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]

# Production Stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy build artifacts from the base stage
COPY --from=base /app/build /app/build

RUN npm install -g serve
ENV NODE_ENV=production
EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]