# ------------------------
# Stage 1: Build
# ------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the project
RUN npm run build

# Remove dev dependencies
RUN npm prune --production


# ------------------------
# Stage 2: Runtime
# ------------------------
FROM node:20-alpine

WORKDIR /usr/src/app

# Runtime deps (Prisma needs openssl)
RUN apk add --no-cache openssl

# Set production mode
ENV NODE_ENV=production

# Copy only what is needed at runtime
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

# Web service will use this (worker ignores it)
EXPOSE 3000

# Default command (Render overrides per service)
CMD ["npm", "start"]
