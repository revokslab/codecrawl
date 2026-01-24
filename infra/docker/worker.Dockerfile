# syntax=docker/dockerfile:1
# Lemma Background Worker Dockerfile
# Uses turbo prune for optimal monorepo builds

FROM oven/bun:1.3.6-alpine AS base

# Builder stage - prunes monorepo and installs dependencies
FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install turbo globally
RUN bun install -g turbo@^2

# Copy entire monorepo for pruning
COPY . .

# Generate a partial monorepo with pruned lockfile for api workspace (worker is part of api)
RUN turbo prune @codecrawl/api --docker

# Installer stage - installs dependencies from pruned workspace
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat python3 make g++ jq
WORKDIR /app

# Copy lockfile and package.json files from pruned workspace
COPY --from=builder /app/out/json/ .

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --filter=@codecrawl/api

# Copy source files
COPY --from=builder /app/out/full/ .

# Production stage
FROM base AS production
WORKDIR /app

# Copy installed dependencies with workspace links intact
COPY --from=installer --chown=bun:bun /app/node_modules ./node_modules
COPY --from=installer --chown=bun:bun /app/package.json ./package.json

# Copy the application code
COPY --from=builder --chown=bun:bun /app/out/full/apps/api ./api
COPY --from=builder --chown=bun:bun /app/out/full/packages ./packages

# Set environment variables
ENV ENV=production

USER bun

# Set working directory to the API app
WORKDIR /app/api

# Graceful shutdown signal for rolling updates
STOPSIGNAL SIGTERM

# Run the background worker
CMD ["bun", "run", "src/services/queue-worker.ts"]