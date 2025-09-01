#!/bin/bash

# SecureFlow Automaton - Monitoring Deployment Script
# This script deploys the complete monitoring infrastructure

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.monitoring.yml"
ENV_FILE="$PROJECT_ROOT/.env.monitoring"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker service."
        exit 1
    fi

    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available."
        exit 1
    fi

    # Check if .env.monitoring file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file $ENV_FILE not found. Creating template..."
        create_env_template
        log_error "Please configure $ENV_FILE with your settings and run the script again."
        exit 1
    fi

    log_success "Prerequisites check completed"
}

# Create environment template
create_env_template() {
    cat > "$ENV_FILE" << 'EOF'
# SecureFlow Monitoring Environment Configuration
# Copy this file and configure with your actual values

# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=your_secure_password_here

# SMTP Configuration (for Alertmanager)
SMTP_PASSWORD=your_smtp_password_here

# Slack Configuration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Node.js Configuration
NODE_ENV=production
MONITORING_PORT=3002

# API Configuration
API_BASE_URL=http://api-server:8080/api/v1

# Database Configuration (if using external DB)
DATABASE_URL=postgresql://user:password@db-host:5432/monitoring

# Redis Configuration (if using external Redis)
REDIS_URL=redis://redis-host:6379

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Security Configuration
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_char_encryption_key_here
EOF

    log_info "Created environment template at $ENV_FILE"
    log_info "Please edit this file with your actual configuration values"
}

# Validate configuration
validate_configuration() {
    log_info "Validating configuration..."

    # Check required environment variables
    required_vars=("GRAFANA_ADMIN_PASSWORD" "SMTP_PASSWORD")

    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$ENV_FILE" 2>/dev/null; then
            log_error "Required environment variable $var not found in $ENV_FILE"
            exit 1
        fi

        value=$(grep "^$var=" "$ENV_FILE" | cut -d'=' -f2-)
        if [ -z "$value" ] || [ "$value" = "your_${var,,}_here" ]; then
            log_error "Environment variable $var has default/placeholder value. Please configure it."
            exit 1
        fi
    done

    # Validate Docker Compose file
    if ! docker-compose -f "$COMPOSE_FILE" config --quiet 2>/dev/null; then
        log_error "Docker Compose configuration is invalid"
        exit 1
    fi

    log_success "Configuration validation completed"
}

# Create required networks and volumes
create_infrastructure() {
    log_info "Creating Docker networks and volumes..."

    # Create monitoring network if it doesn't exist
    if ! docker network ls | grep -q "secureflow-monitoring"; then
        docker network create secureflow-monitoring
        log_success "Created monitoring network"
    else
        log_info "Monitoring network already exists"
    fi

    # Create external volumes if they don't exist
    volumes=("monitoring-logs" "monitoring-data" "prometheus-data" "prometheus-config" "grafana-data" "grafana-config" "grafana-logs" "alertmanager-data")

    for volume in "${volumes[@]}"; do
        if ! docker volume ls | grep -q "secureflow-$volume"; then
            docker volume create "secureflow-$volume"
            log_success "Created volume: secureflow-$volume"
        fi
    done

    log_success "Infrastructure setup completed"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."

    cd "$PROJECT_ROOT"

    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a

    # Pull required images
    log_info "Pulling Docker images..."
    docker-compose -f "$COMPOSE_FILE" pull

    # Start monitoring services
    log_info "Starting monitoring services..."
    docker-compose -f "$COMPOSE_FILE" up -d

    log_success "Monitoring stack deployment initiated"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    services=(
        "api-monitoring:http://localhost:3002/health"
        "prometheus:http://localhost:9090/-/healthy"
        "grafana:http://localhost:3000/api/health"
        "alertmanager:http://localhost:9093/-/healthy"
    )

    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name health_url <<< "$service_info"

        log_info "Waiting for $service_name..."

        # Wait up to 120 seconds for service to be healthy
        timeout=120
        elapsed=0

        while [ $elapsed -lt $timeout ]; do
            if curl -f -s "$health_url" > /dev/null 2>&1; then
                log_success "$service_name is healthy"
                break
            fi

            sleep 5
            elapsed=$((elapsed + 5))
        done

        if [ $elapsed -ge $timeout ]; then
            log_error "$service_name failed to become healthy within $timeout seconds"
            return 1
        fi
    done

    log_success "All services are healthy"
}

# Initialize Grafana
initialize_grafana() {
    log_info "Initializing Grafana..."

    # Wait a bit for Grafana to be fully ready
    sleep 10

    # Check if Grafana is accessible
    if ! curl -f -s "http://localhost:3000/api/health" > /dev/null; then
        log_error "Grafana is not accessible"
        return 1
    fi

    log_success "Grafana initialization completed"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    # Test monitoring dashboard
    if curl -f -s "http://localhost:3002/health" > /dev/null; then
        log_success "Monitoring dashboard is accessible"
    else
        log_error "Monitoring dashboard is not accessible"
        return 1
    fi

    # Test Prometheus
    if curl -f -s "http://localhost:9090/-/healthy" > /dev/null; then
        log_success "Prometheus is accessible"
    else
        log_error "Prometheus is not accessible"
        return 1
    fi

    # Test Grafana
    if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
        log_success "Grafana is accessible"
    else
        log_error "Grafana is not accessible"
        return 1
    fi

    log_success "Deployment verification completed"
}

# Display deployment information
display_deployment_info() {
    log_success "Monitoring deployment completed successfully!"
    echo ""
    echo "🌐 Service URLs:"
    echo "  📊 Monitoring Dashboard: http://localhost:3002"
    echo "  📈 Grafana:              http://localhost:3000"
    echo "  📋 Prometheus:           http://localhost:9090"
    echo "  🚨 Alertmanager:         http://localhost:9093"
    echo ""
    echo "🔐 Default Credentials:"
    echo "  📊 Grafana Admin: admin / $GRAFANA_ADMIN_PASSWORD"
    echo ""
    echo "📚 Useful Commands:"
    echo "  # View service logs"
    echo "  docker-compose -f docker-compose.monitoring.yml logs -f"
    echo ""
    echo "  # Stop monitoring stack"
    echo "  docker-compose -f docker-compose.monitoring.yml down"
    echo ""
    echo "  # Restart monitoring stack"
    echo "  docker-compose -f docker-compose.monitoring.yml restart"
    echo ""
    echo "  # View service status"
    echo "  docker-compose -f docker-compose.monitoring.yml ps"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup logic here if needed
}

# Main deployment function
main() {
    echo "🚀 SecureFlow Automaton - Monitoring Deployment"
    echo "=============================================="

    # Trap for cleanup on exit
    trap cleanup EXIT

    # Run deployment steps
    check_prerequisites
    validate_configuration
    create_infrastructure
    deploy_monitoring
    wait_for_services
    initialize_grafana
    verify_deployment
    display_deployment_info

    log_success "🎉 Monitoring deployment completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    "check")
        check_prerequisites
        validate_configuration
        log_success "Configuration check completed"
        ;;
    "cleanup")
        log_info "Cleaning up monitoring infrastructure..."
        cd "$PROJECT_ROOT"
        docker-compose -f "$COMPOSE_FILE" down -v
        docker network rm secureflow-monitoring 2>/dev/null || true
        log_success "Cleanup completed"
        ;;
    "status")
        log_info "Checking monitoring status..."
        cd "$PROJECT_ROOT"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    "logs")
        log_info "Showing monitoring logs..."
        cd "$PROJECT_ROOT"
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    *)
        main
        ;;
esac
