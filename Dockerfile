# ============================================================================
# VIVR E-Commerce Platform - Production Dockerfile
# ============================================================================
# Multi-stage build for optimal production image
# Stage 1: Dependencies
# Stage 2: Builder
# Stage 3: Runtime (distroless for minimal footprint)
# ============================================================================

# ============================================================================
# STAGE 1: Dependencies
# ============================================================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy production node_modules for final image
RUN cp -R node_modules /prod_node_modules

# Install dev dependencies for build
RUN npm ci

# ============================================================================
# STAGE 2: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Build Next.js application
# This creates optimized production build
RUN npm run build

# Verify build output
RUN test -d .next || (echo "Build failed: .next directory not created" && exit 1)

# ============================================================================
# STAGE 3: Runtime (Distroless)
# ============================================================================
FROM gcr.io/distroless/nodejs20-debian11:nonroot

# Metadata labels
LABEL maintainer="VIVR Team"
LABEL description="VIVR E-Commerce Platform"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Copy production node_modules
COPY --from=dependencies /prod_node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Set NODE_ENV to production
ENV NODE_ENV=production

# Health check
# Verifies application is running and healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode); })"

# Expose port (must match process.env.PORT)
EXPOSE 3000

# Start application
# Uses exec form to handle signals properly for graceful shutdown
ENTRYPOINT ["node"]
CMD ["--enable-source-maps", "node_modules/.bin/next", "start"]

# ============================================================================
# SECURITY NOTES:
# ============================================================================
# 1. Non-root user: distroless images run as nonroot by default
# 2. No shell: distroless has no shell - prevents command injection
# 3. Read-only filesystem: Can be enforced with --read-only flag
# 4. Resource limits: Should be set in container orchestration (k8s/ECS)
# 5. No sudo: No privilege escalation possible
# ============================================================================

# ============================================================================
# BUILD INSTRUCTIONS:
# ============================================================================
# docker build -t vivr:latest .
# docker build -t vivr:1.0.0 -f Dockerfile .
# docker buildx build --push --platform linux/amd64,linux/arm64 -t username/vivr:latest .
# ============================================================================

# ============================================================================
# RUN INSTRUCTIONS:
# ============================================================================
# Local testing:
#   docker run -p 3000:3000 \
#     -e DATABASE_URL="postgresql://..." \
#     -e NEXTAUTH_SECRET="..." \
#     vivr:latest

# Production (with environment file):
#   docker run -d \
#     --name vivr-app \
#     --restart=unless-stopped \
#     --health-cmd='curl -f http://localhost:3000/api/health || exit 1' \
#     --health-interval=30s \
#     --health-timeout=10s \
#     -e NODE_ENV=production \
#     --env-file .env.production.local \
#     -p 3000:3000 \
#     vivr:latest
# ============================================================================
