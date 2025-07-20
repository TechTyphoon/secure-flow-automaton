# Multi-stage build for React + Vite application
ARG NODE_VERSION=18-alpine
ARG NGINX_VERSION=alpine

# Build stage
FROM node:${NODE_VERSION} AS builder

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build arguments for environment-specific builds
ARG NODE_ENV=production
ARG VITE_APP_NAME="SecureFlow Automaton"
ARG VITE_APP_VERSION="1.0.0"

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

# Build the application
RUN npm run build

# Production stage
FROM nginx:${NGINX_VERSION} AS production

# Install essential packages for monitoring and health checks
RUN apk update && apk add --no-cache \
    curl \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=UTC

# Use existing nginx user from Alpine image
# (nginx user already exists in nginx:alpine)

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy health check script
COPY docker/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Create directories for nginx
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp

# Switch to non-root user
USER nginx

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/health-check.sh || exit 1

# Add labels for better container management
LABEL org.opencontainers.image.title="SecureFlow Automaton"
LABEL org.opencontainers.image.description="Enterprise-grade DevSecOps Pipeline Automation Platform"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="TechTyphoon"
LABEL org.opencontainers.image.source="https://github.com/TechTyphoon/secure-flow-automaton"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
