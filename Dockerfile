# Multi-stage production Dockerfile with enhanced security hardening
ARG NODE_VERSION=20-alpine
ARG NGINX_VERSION=1.24-alpine

# Build stage with security enhancements
FROM node:${NODE_VERSION} AS builder

# Security: Update packages and install only essential tools
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        ca-certificates && \
    rm -rf /var/cache/apk/*

# Security: Create non-root user early
RUN addgroup -g 1001 -S nodejs && \
    adduser -S secureflow -u 1001 -G nodejs

# Set working directory with proper ownership
WORKDIR /app
RUN chown secureflow:nodejs /app

# Switch to non-root user for dependency installation
USER secureflow

# Copy package files for better caching
COPY --chown=secureflow:nodejs package*.json ./
COPY --chown=secureflow:nodejs bun.lockb ./

# Install dependencies with security flags
RUN npm ci --silent --no-audit --no-fund --ignore-scripts

# Copy source code
COPY --chown=secureflow:nodejs . .

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

# Security: Clean up build artifacts and development dependencies
RUN npm prune --production && \
    rm -rf node_modules/.cache && \
    rm -rf .npm

# Production stage with maximum security
FROM nginx:${NGINX_VERSION} AS production

# Security: Install security updates and minimal tools
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        ca-certificates \
        curl \
        tzdata && \
    rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=UTC

# Security: Create dedicated nginx user (overriding default)
RUN deluser nginx && \
    addgroup -g 101 -S nginx && \
    adduser -S nginx -u 101 -G nginx -s /sbin/nologin -h /nonexistent

# Security: Remove default nginx content and create secure structure
RUN rm -rf /usr/share/nginx/html/* && \
    rm -rf /etc/nginx/conf.d/default.conf && \
    mkdir -p /var/log/nginx && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /tmp/nginx && \
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp

# Copy enhanced nginx configuration with security headers
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage with proper permissions
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy and setup health check script
COPY docker/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh && \
    chown nginx:nginx /usr/local/bin/health-check.sh

# Security: Set restrictive file permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /tmp/nginx && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

# Security: Remove unnecessary packages and files
RUN apk del curl && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/* && \
    rm -rf /var/tmp/*

# Security: Switch to non-root user
USER nginx

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/health-check.sh || exit 1

# Security and metadata labels
LABEL org.opencontainers.image.title="SecureFlow Automaton"
LABEL org.opencontainers.image.description="Enterprise-grade DevSecOps Pipeline Automation Platform"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="TechTyphoon"
LABEL org.opencontainers.image.source="https://github.com/TechTyphoon/secure-flow-automaton"
LABEL security.hardened="true"
LABEL security.non-root="true"
LABEL security.readonly-rootfs="supported"

# Security: Use dumb-init as PID 1 for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start nginx with secure configuration
CMD ["nginx", "-g", "daemon off;"]
