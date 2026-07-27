# Multi-stage build: dependencies stage
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build tools like TypeScript)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy only necessary files from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy static assets
COPY assets ./assets

# Create non-root user for security and clean up cache to reduce layer size
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    npm cache clean --force

USER nodejs

# Expose port 4000
EXPOSE 4000

# Start application (Node.js handles SIGTERM)
CMD ["node", "dist/index.js"]
