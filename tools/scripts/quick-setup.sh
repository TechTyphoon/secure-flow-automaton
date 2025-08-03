#!/usr/bin/env bash

# Cross-Platform Setup Script for SecureFlow Automaton
# Works on Windows (Git Bash/WSL), macOS, and Linux
# Version: 2.0.0

set -euo pipefail  # Exit on any error

# Colors for output (works across platforms)
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    CYAN='\033[0;36m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    PURPLE=''
    CYAN=''
    NC=''
fi

# Platform detection
detect_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Print styled messages
print_header() {
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}  🛡️  ${CYAN}SecureFlow Automaton - Cross-Platform Setup${NC}  🛡️   ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get Node.js version
get_node_version() {
    if command_exists node; then
        node --version | sed 's/^v//'
    else
        echo "0.0.0"
    fi
}

# Version comparison function
version_gte() {
    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

# Check system requirements
check_requirements() {
    print_step "Checking system requirements..."
    
    local platform
    platform=$(detect_platform)
    print_info "Detected platform: $platform"
    
    # Check Node.js
    if command_exists node; then
        local node_version
        node_version=$(get_node_version)
        if version_gte "$node_version" "18.0.0"; then
            print_success "Node.js $node_version (✓)"
        else
            print_warning "Node.js $node_version detected. Recommended: 18.0.0+"
            print_info "Consider using Node Version Manager (nvm) to upgrade"
        fi
    else
        print_error "Node.js not found. Please install Node.js 18.0.0 or higher"
        print_info "Visit: https://nodejs.org/ or use a version manager like nvm"
        return 1
    fi
    
    # Check npm
    if command_exists npm; then
        local npm_version
        npm_version=$(npm --version)
        print_success "npm $npm_version (✓)"
    else
        print_error "npm not found. Please install npm"
        return 1
    fi
    
    # Check Git
    if command_exists git; then
        local git_version
        git_version=$(git --version | awk '{print $3}')
        print_success "Git $git_version (✓)"
    else
        print_warning "Git not found. Some features may not work properly"
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        local docker_version
        docker_version=$(docker --version | awk '{print $3}' | sed 's/,$//')
        print_success "Docker $docker_version (✓)"
    else
        print_info "Docker not found (optional for development)"
    fi
}

# Setup environment files
setup_environment() {
    print_step "Setting up environment configuration..."
    
    if [[ ! -f ".env" && -f ".env.example" ]]; then
        cp ".env.example" ".env"
        print_success "Created .env file from .env.example"
        print_warning "Please update .env with your actual configuration values"
    elif [[ -f ".env" ]]; then
        print_info ".env file already exists"
    else
        print_warning "No .env.example found. Creating basic .env file..."
        cat > .env << EOF
# Basic configuration for SecureFlow Automaton
VITE_APP_NAME="SecureFlow Automaton"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV="development"
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
EOF
        print_success "Created basic .env file"
    fi
}

# Clean previous installations
clean_installation() {
    print_step "Cleaning previous installation..."
    
    # Remove node_modules and lock files for fresh install
    if [[ -d "node_modules" ]]; then
        rm -rf node_modules
        print_success "Removed node_modules directory"
    fi
    
    if [[ -f "package-lock.json" ]]; then
        rm -f package-lock.json
        print_success "Removed package-lock.json"
    fi
    
    # Clear npm cache
    if command_exists npm; then
        npm cache clean --force >/dev/null 2>&1 || true
        print_success "Cleared npm cache"
    fi
    
    # Clear build artifacts
    if [[ -d "dist" ]]; then
        rm -rf dist
        print_success "Removed dist directory"
    fi
    
    if [[ -d ".vite" ]]; then
        rm -rf .vite
        print_success "Removed .vite cache"
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Set npm configuration for better cross-platform compatibility
    npm config set fund false >/dev/null 2>&1 || true
    npm config set audit-level moderate >/dev/null 2>&1 || true
    
    # Install with platform-specific optimizations
    local platform
    platform=$(detect_platform)
    
    if [[ "$platform" == "windows" ]]; then
        # Windows-specific npm configuration
        npm config set script-shell bash >/dev/null 2>&1 || true
        npm install --no-optional --legacy-peer-deps || {
            print_warning "Standard install failed, trying with --force..."
            npm install --force
        }
    else
        # Unix-like systems
        npm install || {
            print_warning "Standard install failed, trying with --legacy-peer-deps..."
            npm install --legacy-peer-deps
        }
    fi
    
    print_success "Dependencies installed successfully"
}

# Verify installation
verify_installation() {
    print_step "Verifying installation..."
    
    # Check if key dependencies are available
    if [[ -d "node_modules" ]] && [[ -f "node_modules/.bin/vite" ]]; then
        print_success "Vite build tool installed"
    else
        print_error "Vite not found. Installation may have failed"
        return 1
    fi
    
    # Run TypeScript type checking
    if npm run type-check >/dev/null 2>&1; then
        print_success "TypeScript compilation check passed"
    else
        print_warning "TypeScript compilation check failed (may need configuration)"
    fi
}

# Setup development tools
setup_dev_tools() {
    print_step "Setting up development tools..."
    
    # Setup Git hooks if husky is available
    if [[ -f "node_modules/.bin/husky" ]]; then
        npx husky install >/dev/null 2>&1 || true
        print_success "Git hooks configured"
    fi
    
    # Create necessary directories
    mkdir -p logs temp coverage >/dev/null 2>&1 || true
    print_success "Development directories created"
}

# Show next steps
show_next_steps() {
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}                    🎉 Setup Complete! 🎉                     ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${CYAN}Next steps:${NC}\n"
    echo -e "${BLUE}1.${NC} Update configuration:"
    echo -e "   ${YELLOW}nano .env${NC} (or use your preferred editor)"
    echo ""
    echo -e "${BLUE}2.${NC} Start development server:"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${BLUE}3.${NC} Open in browser:"
    echo -e "   ${YELLOW}http://localhost:8080${NC}"
    echo ""
    echo -e "${BLUE}4.${NC} Available commands:"
    echo -e "   ${YELLOW}npm run build${NC}         # Build for production"
    echo -e "   ${YELLOW}npm run test${NC}          # Run tests"
    echo -e "   ${YELLOW}npm run lint${NC}          # Check code quality"
    echo -e "   ${YELLOW}npm run format${NC}        # Format code"
    echo -e "   ${YELLOW}npm run type-check${NC}    # Check TypeScript"
    echo ""
    echo -e "${PURPLE}🐳 Docker alternatives:${NC}"
    echo -e "   ${YELLOW}npm run docker:dev${NC}    # Run with Docker"
    echo -e "   ${YELLOW}npm run docker:prod${NC}   # Production Docker"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}\n"
}

# Main execution
main() {
    print_header
    
    # Trap errors and cleanup
    trap 'print_error "Setup failed! Check the output above for details."' ERR
    
    check_requirements
    setup_environment
    clean_installation
    install_dependencies
    verify_installation
    setup_dev_tools
    show_next_steps
    
    print_success "Setup completed successfully! 🎉"
    
    # Ask if user wants to start the development server
    echo -e "${CYAN}Would you like to start the development server now? [y/N]:${NC} "
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Starting development server..."
        npm run dev
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
