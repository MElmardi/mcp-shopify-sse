FROM node:22-alpine AS builder

WORKDIR /app

# Copy only package files first to leverage cache
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm ci --omit=dev

# Run the application
CMD ["node", "dist/index.js"]