#!/bin/bash

# GitHub Clone and Run Script
# This script helps users clone and run the application easily

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed."
        echo "Please install Docker from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_status "✅ Docker and Docker Compose are installed"
}

# Clone repository
clone_repo() {
    print_header "Cloning Repository"
    
    REPO_URL="https://github.com/TechTyphoon/secure-flow-automaton.git"
    REPO_DIR="secure-flow-automaton"
    
    if [ -d "$REPO_DIR" ]; then
        print_status "Repository already exists. Updating..."
        cd "$REPO_DIR"
        git pull origin main
    else
        print_status "Cloning repository..."
        git clone "$REPO_URL"
        cd "$REPO_DIR"
    fi
    
    print_status "✅ Repository ready"
}

# Setup and run
setup_and_run() {
    print_header "Setting Up and Running Application"
    
    # Make scripts executable
    chmod +x docker-run.sh
    
    # Start the application
    print_status "Starting Secure Flow Automaton..."
    ./docker-run.sh start-prod
    
    print_header "🎉 Setup Complete!"
    echo ""
    print_status "🌐 Application is running at: http://localhost:8080"
    print_status "🔌 API is running at: http://localhost:3000"
    print_status "📧 Email UI is running at: http://localhost:9000"
    echo ""
    print_status "📋 Useful commands:"
    print_status "  ./docker-run.sh logs     - View application logs"
    print_status "  ./docker-run.sh stop     - Stop the application"
    print_status "  ./docker-run.sh start-dev - Start in development mode"
    print_status "  ./docker-run.sh status   - Check service status"
    echo ""
    print_status "📚 For more information, see DOCKER.md"
}

# Main function
main() {
    print_header "Secure Flow Automaton - Easy Setup"
    echo ""
    
    check_prerequisites
    clone_repo
    setup_and_run
}

# Run main function
main "$@"
