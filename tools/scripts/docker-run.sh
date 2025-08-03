#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed."
}

# Build and run the application
start_production() {
    print_header "Starting Secure Flow Automaton in Production Mode"
    
    # Stop any existing containers
    print_status "Stopping existing containers..."
    docker-compose down
    
    # Build and start containers
    print_status "Building and starting containers..."
    docker-compose up --build -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    print_status "Checking service status..."
    docker-compose ps
    
    echo ""
    print_status "🚀 Application is starting up!"
    print_status "📱 Frontend: http://localhost:8080"
    print_status "🔌 API: http://localhost:3000"
    print_status "🔐 Auth: http://localhost:9999"
    print_status "📧 Mail UI: http://localhost:9000"
    print_status "💾 Database: localhost:5432"
    echo ""
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
}

# Start development mode
start_development() {
    print_header "Starting Secure Flow Automaton in Development Mode"
    
    # Stop any existing containers
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.dev.yml down
    
    # Build and start containers
    print_status "Building and starting containers..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    print_status "Checking service status..."
    docker-compose -f docker-compose.dev.yml ps
    
    echo ""
    print_status "🚀 Development server is starting up!"
    print_status "📱 Frontend: http://localhost:8080"
    print_status "🔌 API: http://localhost:3000"
    print_status "💾 Database: localhost:5432"
    echo ""
    print_status "To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    print_status "To stop: docker-compose -f docker-compose.dev.yml down"
}

# Stop all services
stop_services() {
    print_header "Stopping All Services"
    
    print_status "Stopping production services..."
    docker-compose down
    
    print_status "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
    
    print_status "All services stopped."
}

# Show logs
show_logs() {
    print_header "Service Logs"
    
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Show help
show_help() {
    echo "Secure Flow Automaton Docker Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start-prod    Start application in production mode"
    echo "  start-dev     Start application in development mode"
    echo "  stop          Stop all services"
    echo "  logs          Show production logs"
    echo "  logs-dev      Show development logs"
    echo "  status        Show service status"
    echo "  clean         Clean up Docker resources"
    echo "  help          Show this help message"
    echo ""
}

# Show status
show_status() {
    print_header "Service Status"
    
    echo "Production services:"
    docker-compose ps
    echo ""
    echo "Development services:"
    docker-compose -f docker-compose.dev.yml ps
}

# Clean up Docker resources
clean_docker() {
    print_header "Cleaning Docker Resources"
    
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    
    print_status "Removing unused images..."
    docker image prune -f
    
    print_status "Removing unused volumes..."
    docker volume prune -f
    
    print_status "Cleanup completed."
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "start-prod")
            start_production
            ;;
        "start-dev")
            start_development
            ;;
        "stop")
            stop_services
            ;;
        "logs")
            show_logs "prod"
            ;;
        "logs-dev")
            show_logs "dev"
            ;;
        "status")
            show_status
            ;;
        "clean")
            clean_docker
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run the main function
main "$@"
