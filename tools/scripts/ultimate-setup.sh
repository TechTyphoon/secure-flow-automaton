#!/usr/bin/env bash

# 🎯 ULTIMATE SecureFlow Automaton Setup
# The smoothest possible experience for your friend!
# Choose your adventure: Docker (easiest) or Node.js (traditional)

set -euo pipefail

# Enhanced colors and styling
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    PURPLE=$(tput setaf 5)
    CYAN=$(tput setaf 6)
    BOLD=$(tput bold)
    NC=$(tput sgr0)
else
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'
fi

# Project info
PROJECT_NAME="SecureFlow Automaton"
VERSION="2.0.0"
REPO_URL="https://github.com/TechTyphoon/secure-flow-automaton"

# Logging functions
log_header() {
    clear
    echo -e "\n${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}${BOLD}║${NC}  🛡️  ${CYAN}${BOLD}$1${NC} v$VERSION  🛡️   ${PURPLE}${BOLD}║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}\n"
}

log_step() { echo -e "${BLUE}${BOLD}▶ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
log_tip() { echo -e "${PURPLE}💡 $1${NC}"; }

# Show welcome message
show_welcome() {
    log_header "$PROJECT_NAME - Ultimate Setup"
    
    echo -e "${GREEN}${BOLD}🎉 Welcome to the smoothest setup experience ever!${NC}\n"
    
    echo -e "${CYAN}This DevSecOps Pipeline Automation Platform includes:${NC}"
    echo -e "  🔒 Real-time security monitoring and vulnerability scanning"
    echo -e "  🚀 Automated deployment pipelines with built-in security"
    echo -e "  📊 Interactive dashboards and compliance reporting"
    echo -e "  🔧 Developer-friendly security tools integration"
    echo -e "  🛡️ Enterprise-grade security automation workflows"
    echo
    
    echo -e "${YELLOW}${BOLD}Choose your setup method:${NC}\n"
    echo -e "${BLUE}1. 🐳 Docker Setup${NC} ${GREEN}(Recommended - Just works!)${NC}"
    echo -e "   ✅ No Node.js installation needed"
    echo -e "   ✅ Isolated environment"
    echo -e "   ✅ Includes database and Redis"
    echo -e "   ✅ One command and you're done"
    echo
    echo -e "${BLUE}2. 💻 Traditional Setup${NC} ${YELLOW}(Node.js required)${NC}"
    echo -e "   ✅ Direct system installation"
    echo -e "   ✅ Full development environment"
    echo -e "   ✅ Maximum customization"
    echo -e "   ✅ Best for active development"
    echo
    echo -e "${BLUE}3. ⚡ Quick Demo${NC} ${CYAN}(Fastest preview)${NC}"
    echo -e "   ✅ Pre-built Docker image"
    echo -e "   ✅ Starts in under 30 seconds"
    echo -e "   ✅ Perfect for first look"
    echo
}

# Get user choice
get_user_choice() {
    while true; do
        echo -e "${CYAN}${BOLD}Select your option [1-3]: ${NC}"
        read -r choice
        
        case $choice in
            1)
                echo -e "${GREEN}Great choice! Docker setup is the smoothest experience.${NC}"
                return 1
                ;;
            2)
                echo -e "${BLUE}Perfect! Traditional setup gives you full control.${NC}"
                return 2
                ;;
            3)
                echo -e "${CYAN}Excellent! Quick demo will get you started instantly.${NC}"
                return 3
                ;;
            *)
                log_warning "Please enter 1, 2, or 3"
                ;;
        esac
    done
}

# Check system requirements
check_system() {
    log_step "Checking your system..."
    
    local platform="unknown"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        platform="Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        platform="macOS"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        platform="Windows"
    elif [[ -n "${WSL_DISTRO_NAME:-}" ]]; then
        platform="WSL ($WSL_DISTRO_NAME)"
    fi
    
    log_success "Platform: $platform"
    log_success "User: $(whoami)"
    
    # Check available memory
    if command -v free >/dev/null 2>&1; then
        local mem_gb=$(free -g | awk '/^Mem:/{print $2}')
        log_success "Memory: ${mem_gb}GB available"
    elif command -v sysctl >/dev/null 2>&1; then
        local mem_gb=$(sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024/1024)}' || echo "Unknown")
        log_success "Memory: ${mem_gb}GB available"
    fi
    
    # Check disk space
    if command -v df >/dev/null 2>&1; then
        local space_gb=$(df . | awk 'NR==2 {print int($4/1024/1024)}')
        log_success "Disk space: ${space_gb}GB available"
    fi
    
    echo
}

# Docker setup path
setup_with_docker() {
    log_header "🐳 Docker Setup"
    
    log_step "Checking Docker installation..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed!"
        echo
        log_info "Please install Docker first:"
        echo -e "${YELLOW}Windows/Mac:${NC} https://www.docker.com/products/docker-desktop"
        echo -e "${YELLOW}Linux:${NC} https://docs.docker.com/engine/install/"
        echo
        log_tip "After installing Docker, run this script again!"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running!"
        log_info "Please start Docker Desktop or the Docker daemon"
        exit 1
    fi
    
    log_success "Docker is ready!"
    
    # Run the Docker setup
    log_step "Starting Docker setup..."
    if [[ -f "docker-setup.sh" ]]; then
        bash docker-setup.sh
    else
        log_error "Docker setup script not found"
        log_info "Please ensure you're in the project directory"
        exit 1
    fi
}

# Traditional Node.js setup
setup_with_nodejs() {
    log_header "💻 Traditional Setup"
    
    # Run the friend-proof setup
    if [[ -f "friend-proof-setup.sh" ]]; then
        bash friend-proof-setup.sh
    else
        log_error "Setup script not found"
        log_info "Please ensure you're in the project directory"
        exit 1
    fi
}

# Quick demo setup
setup_quick_demo() {
    log_header "⚡ Quick Demo"
    
    log_step "Checking Docker for quick demo..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is required for quick demo"
        log_info "Install Docker or choose option 2 (Traditional Setup)"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running"
        log_info "Please start Docker and try again"
        exit 1
    fi
    
    log_step "Pulling and starting pre-built demo..."
    log_info "This will download a ready-to-use version..."
    
    # Create a simple demo setup
    cat > docker-compose.demo.yml << 'EOF'
version: '3.8'
services:
  secureflow-demo:
    build:
      context: .
      dockerfile: Dockerfile.ultimate
      target: development
    container_name: secureflow-demo
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - VITE_DEMO_MODE=true
    restart: unless-stopped
EOF
    
    # Start the demo
    local compose_cmd="docker compose"
    if ! docker compose version >/dev/null 2>&1; then
        compose_cmd="docker-compose"
    fi
    
    if $compose_cmd -f docker-compose.demo.yml up --build -d; then
        log_success "Demo is starting up..."
        
        # Wait for startup
        log_step "Waiting for demo to be ready..."
        local attempts=0
        while [[ $attempts -lt 20 ]]; do
            if curl -s http://localhost:8080 >/dev/null 2>&1; then
                break
            fi
            echo -n "."
            sleep 2
            ((attempts++))
        done
        
        echo
        log_success "🎉 Demo is ready!"
        echo
        echo -e "${GREEN}${BOLD}🌐 Access your demo at: ${YELLOW}http://localhost:8080${NC}"
        echo
        echo -e "${CYAN}Demo Features:${NC}"
        echo -e "  🔒 Security Dashboard"
        echo -e "  📊 Vulnerability Monitoring" 
        echo -e "  🚀 Pipeline Automation"
        echo -e "  📈 Real-time Metrics"
        echo
        echo -e "${YELLOW}Stop demo: ${NC}$compose_cmd -f docker-compose.demo.yml down"
        echo
        log_tip "Ready to develop? Run this script again and choose option 1 or 2!"
        
    else
        log_error "Failed to start demo"
        log_info "Try option 1 (Docker Setup) for full installation"
    fi
}

# Show final success message
show_success() {
    echo
    log_header "🎉 Setup Complete!"
    
    echo -e "${GREEN}${BOLD}Your SecureFlow Automaton is ready to go!${NC}\n"
    
    echo -e "${CYAN}🚀 What you can do now:${NC}"
    echo -e "  • Explore the security dashboard"
    echo -e "  • Set up your first security pipeline"
    echo -e "  • Configure vulnerability scanning"
    echo -e "  • Try the automated compliance tools"
    echo
    
    echo -e "${CYAN}📚 Learn more:${NC}"
    echo -e "  • ${YELLOW}README.md${NC} - Complete documentation"
    echo -e "  • ${YELLOW}TROUBLESHOOTING.md${NC} - If you need help"
    echo -e "  • ${YELLOW}$REPO_URL${NC} - GitHub repository"
    echo
    
    echo -e "${GREEN}${BOLD}Happy secure coding! 🛡️✨${NC}\n"
}

# Error handling
handle_error() {
    local exit_code=$?
    echo
    log_error "Setup encountered an issue (exit code: $exit_code)"
    echo
    log_info "Don't worry! Here are your options:"
    echo -e "  1. ${YELLOW}Try a different setup method${NC}"
    echo -e "  2. ${YELLOW}Check TROUBLESHOOTING.md${NC} for solutions"
    echo -e "  3. ${YELLOW}Run the script again${NC}"
    echo
    log_tip "Most issues are easily fixable!"
    exit $exit_code
}

# Main execution
main() {
    # Set up error handling
    trap handle_error ERR
    
    # Show welcome and get choice
    show_welcome
    get_user_choice
    local choice=$?
    
    # Check system
    check_system
    
    # Execute chosen setup method
    case $choice in
        1)
            setup_with_docker
            ;;
        2)
            setup_with_nodejs
            ;;
        3)
            setup_quick_demo
            ;;
    esac
    
    # Show success message
    show_success
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
