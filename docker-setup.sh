#!/usr/bin/env bash

# 🚀 One-Click Docker Setup for SecureFlow Automaton
# The ultimate easy setup experience for your friend!

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Project info
PROJECT_NAME="SecureFlow Automaton"
DOCKER_SERVICE="secureflow-dev"

# Functions
log_header() {
    echo -e "\n${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}${BOLD}║${NC}  🐳  ${CYAN}${BOLD}$1${NC}  🐳   ${PURPLE}${BOLD}║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}\n"
}

log_step() { echo -e "${BLUE}${BOLD}▶ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }

# Check if Docker is installed and running
check_docker() {
    log_step "Checking Docker installation..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed!"
        echo
        log_info "Please install Docker from:"
        log_info "• Windows/Mac: https://www.docker.com/products/docker-desktop"
        log_info "• Linux: https://docs.docker.com/engine/install/"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running!"
        log_info "Please start Docker Desktop or the Docker daemon"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is not available!"
        log_info "Please install Docker Compose or use Docker Desktop"
        exit 1
    fi
    
    local docker_version=$(docker --version | awk '{print $3}' | sed 's/,$//')
    log_success "Docker $docker_version is ready!"
}

# Setup environment for Docker
setup_docker_env() {
    log_step "Setting up Docker environment..."
    
    # Create .env for Docker if it doesn't exist
    if [[ ! -f ".env" ]]; then
        cat > .env << 'EOF'
# SecureFlow Automaton - Docker Configuration
COMPOSE_PROJECT_NAME=secureflow-automaton

# Application
NODE_ENV=development
PORT=8080
HOST=0.0.0.0

# Database
POSTGRES_DB=secureflow
POSTGRES_USER=secureflow
POSTGRES_PASSWORD=SecureFlow2024!

# Redis
REDIS_PASSWORD=SecureRedis2024!

# Security
GENERATE_SOURCEMAP=false
VITE_DEV_TOOLS=true
VITE_HOT_RELOAD=true
EOF
        log_success "Created Docker environment configuration"
    else
        log_info "Using existing .env file"
    fi
    
    # Create necessary directories
    mkdir -p nginx/ssl logs temp coverage 2>/dev/null || true
    log_success "Created necessary directories"
}

# Build and start the Docker containers
start_docker() {
    log_step "Building and starting Docker containers..."
    log_info "This may take a few minutes on first run..."
    
    # Use docker compose (new) or docker-compose (legacy)
    local compose_cmd="docker compose"
    if ! docker compose version >/dev/null 2>&1; then
        compose_cmd="docker-compose"
    fi
    
    # Build and start in development mode
    if $compose_cmd -f docker-compose.ultimate.yml up --build -d $DOCKER_SERVICE; then
        log_success "Docker containers started successfully!"
    else
        log_error "Failed to start Docker containers"
        log_info "Check the output above for details"
        return 1
    fi
    
    # Wait for the service to be ready
    log_step "Waiting for application to be ready..."
    local attempts=0
    local max_attempts=30
    
    while [[ $attempts -lt $max_attempts ]]; do
        if curl -s http://localhost:8080 >/dev/null 2>&1; then
            log_success "Application is ready!"
            break
        fi
        
        ((attempts++))
        echo -n "."
        sleep 2
    done
    
    if [[ $attempts -eq $max_attempts ]]; then
        log_warning "Application took longer than expected to start"
        log_info "Check container logs: docker logs $DOCKER_SERVICE"
    fi
}

# Show status and next steps
show_status() {
    log_header "🎉 Docker Setup Complete!"
    
    echo -e "${GREEN}Your SecureFlow Automaton is running in Docker! 🐳${NC}\n"
    
    echo -e "${CYAN}🌐 Access Your Application:${NC}"
    echo -e "  ${YELLOW}http://localhost:8080${NC} - Main Application"
    echo
    
    echo -e "${CYAN}🔧 Container Management:${NC}"
    echo -e "  ${YELLOW}docker logs secureflow-automaton-dev${NC}     # View logs"
    echo -e "  ${YELLOW}docker exec -it secureflow-automaton-dev bash${NC} # Access container"
    echo
    
    echo -e "${CYAN}🛠️ Useful Commands:${NC}"
    local compose_cmd="docker compose"
    if ! docker compose version >/dev/null 2>&1; then
        compose_cmd="docker-compose"
    fi
    
    echo -e "  ${YELLOW}$compose_cmd -f docker-compose.ultimate.yml up -d${NC}    # Start containers"
    echo -e "  ${YELLOW}$compose_cmd -f docker-compose.ultimate.yml down${NC}     # Stop containers"
    echo -e "  ${YELLOW}$compose_cmd -f docker-compose.ultimate.yml logs -f${NC}  # Follow logs"
    echo -e "  ${YELLOW}$compose_cmd -f docker-compose.ultimate.yml restart${NC}  # Restart containers"
    echo
    
    echo -e "${CYAN}🗄️ Services Running:${NC}"
    echo -e "  ${YELLOW}Application${NC}  - http://localhost:8080"
    echo -e "  ${YELLOW}Database${NC}     - localhost:5432 (PostgreSQL)"
    echo -e "  ${YELLOW}Redis${NC}        - localhost:6379"
    echo
    
    log_info "Press Ctrl+C to stop viewing logs, containers will keep running"
    echo -e "${GREEN}Happy coding with Docker! 🐳✨${NC}\n"
    
    # Show live logs
    log_step "Showing live application logs (Ctrl+C to exit)..."
    docker logs -f $DOCKER_SERVICE 2>/dev/null || true
}

# Error handling
cleanup_on_error() {
    local exit_code=$?
    log_error "Docker setup failed (exit code: $exit_code)"
    log_info "Try running: docker-compose -f docker-compose.ultimate.yml down"
    log_info "Then run this script again"
    exit $exit_code
}

# Main execution
main() {
    trap cleanup_on_error ERR
    
    log_header "$PROJECT_NAME - One-Click Docker Setup"
    
    log_info "🐳 This script will set up your application using Docker"
    log_info "✨ No Node.js installation required on your system!"
    log_info "🔄 Everything runs in isolated containers"
    echo
    
    check_docker
    setup_docker_env
    start_docker
    show_status
}

# Auto-start if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
