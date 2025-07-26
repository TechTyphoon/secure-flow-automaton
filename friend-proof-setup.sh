#!/usr/bin/env bash

# 🛡️ SecureFlow Automaton - Ultimate Friend-Proof Setup
# This script ensures the project runs perfectly on any system
# Version: 3.0.0 - Bulletproof Edition

set -euo pipefail

# Enhanced colors that work everywhere
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

# Global variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="SecureFlow Automaton"
MIN_NODE_VERSION="18.0.0"
RECOMMENDED_NODE_VERSION="20.11.0"
DEFAULT_PORT="8080"

# Enhanced logging functions
log() {
    echo -e "$1" >&1
}

log_header() {
    echo -e "\n${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}${BOLD}║${NC}  🛡️  ${CYAN}${BOLD}$1${NC}  🛡️   ${PURPLE}${BOLD}║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}\n"
}

log_step() {
    echo -e "${BLUE}${BOLD}▶ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_tip() {
    echo -e "${PURPLE}💡 $1${NC}"
}

# Platform detection with enhanced support
detect_platform() {
    local platform="unknown"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v lsb_release >/dev/null 2>&1; then
            local distro=$(lsb_release -si 2>/dev/null || echo "Linux")
            platform="linux-$distro"
        else
            platform="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        local version=$(sw_vers -productVersion 2>/dev/null || echo "unknown")
        platform="macos-$version"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        platform="windows"
    elif [[ -n "${WSL_DISTRO_NAME:-}" ]]; then
        platform="wsl-${WSL_DISTRO_NAME}"
    fi
    
    echo "$platform"
}

# Enhanced command existence check
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Version comparison with error handling
version_compare() {
    if [[ "$1" == "$2" ]]; then
        echo "0"
        return
    fi
    
    local IFS=.
    local i ver1=($1) ver2=($2)
    
    # Fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            echo "1"
            return
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            echo "-1"
            return
        fi
    done
    echo "0"
}

# Enhanced Node.js version check
get_node_version() {
    if command_exists node; then
        node --version 2>/dev/null | sed 's/^v//' | sed 's/-.*//'
    else
        echo "0.0.0"
    fi
}

# System requirements check with detailed feedback
check_system_requirements() {
    log_step "Checking system requirements..."
    
    local platform=$(detect_platform)
    log_info "Platform: $platform"
    log_info "Shell: $SHELL"
    log_info "User: $(whoami)"
    
    local errors=0
    
    # Node.js check with installation hints
    if command_exists node; then
        local node_version=$(get_node_version)
        local version_check=$(version_compare "$node_version" "$MIN_NODE_VERSION")
        
        if [[ "$version_check" -ge 0 ]]; then
            log_success "Node.js: v$node_version ✓"
            
            # Check if it's the recommended version
            local rec_check=$(version_compare "$node_version" "$RECOMMENDED_NODE_VERSION")
            if [[ "$rec_check" -lt 0 ]]; then
                log_tip "Consider upgrading to Node.js v$RECOMMENDED_NODE_VERSION for best performance"
            fi
        else
            log_error "Node.js v$node_version is too old (minimum: v$MIN_NODE_VERSION)"
            show_node_installation_guide "$platform"
            ((errors++))
        fi
    else
        log_error "Node.js not found"
        show_node_installation_guide "$platform"
        ((errors++))
    fi
    
    # npm check
    if command_exists npm; then
        local npm_version=$(npm --version 2>/dev/null || echo "unknown")
        log_success "npm: v$npm_version ✓"
    else
        log_error "npm not found (usually comes with Node.js)"
        ((errors++))
    fi
    
    # Git check (recommended but not required)
    if command_exists git; then
        local git_version=$(git --version 2>/dev/null | awk '{print $3}' || echo "unknown")
        log_success "Git: v$git_version ✓"
    else
        log_warning "Git not found (recommended for version control)"
        log_tip "Install Git from: https://git-scm.com/"
    fi
    
    # Docker check (optional)
    if command_exists docker; then
        local docker_version=$(docker --version 2>/dev/null | awk '{print $3}' | sed 's/,$//' || echo "unknown")
        log_success "Docker: v$docker_version ✓ (optional)"
    else
        log_info "Docker not found (optional for containerized development)"
    fi
    
    # Memory check
    check_system_memory "$platform"
    
    # Disk space check
    check_disk_space
    
    if [[ $errors -gt 0 ]]; then
        log_error "Please fix the above issues before continuing"
        return 1
    fi
    
    log_success "All system requirements met!"
    return 0
}

# Memory check based on platform
check_system_memory() {
    local platform="$1"
    
    case "$platform" in
        linux*)
            if command -v free >/dev/null 2>&1; then
                local mem_gb=$(free -g | awk '/^Mem:/{print $2}')
                if [[ $mem_gb -ge 4 ]]; then
                    log_success "Memory: ${mem_gb}GB ✓"
                elif [[ $mem_gb -ge 2 ]]; then
                    log_warning "Memory: ${mem_gb}GB (recommended: 4GB+)"
                else
                    log_warning "Low memory: ${mem_gb}GB (minimum: 2GB)"
                fi
            fi
            ;;
        macos*)
            if command -v sysctl >/dev/null 2>&1; then
                local mem_gb=$(sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024/1024)}')
                log_success "Memory: ${mem_gb}GB ✓"
            fi
            ;;
        windows*|wsl*)
            log_info "Memory check skipped on this platform"
            ;;
    esac
}

# Disk space check
check_disk_space() {
    local available_mb
    if command -v df >/dev/null 2>&1; then
        available_mb=$(df . | awk 'NR==2 {print int($4/1024)}')
        if [[ $available_mb -gt 1000 ]]; then
            log_success "Disk space: ${available_mb}MB available ✓"
        else
            log_warning "Low disk space: ${available_mb}MB (recommended: 1GB+)"
        fi
    fi
}

# Node.js installation guide
show_node_installation_guide() {
    local platform="$1"
    
    log_info "Node.js installation options:"
    
    case "$platform" in
        linux*)
            log_info "• Official installer: https://nodejs.org/en/download/"
            log_info "• Using nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash"
            log_info "• Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
            ;;
        macos*)
            log_info "• Official installer: https://nodejs.org/en/download/"
            log_info "• Using Homebrew: brew install node"
            log_info "• Using nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash"
            ;;
        windows*)
            log_info "• Official installer: https://nodejs.org/en/download/"
            log_info "• Using Chocolatey: choco install nodejs"
            log_info "• Using winget: winget install OpenJS.NodeJS"
            ;;
        wsl*)
            log_info "• Same as Linux options above"
            log_info "• Or install via Windows and use from WSL"
            ;;
    esac
}

# Enhanced environment setup
setup_environment() {
    log_step "Setting up environment configuration..."
    
    # Create .env from .env.example if needed
    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.example" ]]; then
            cp ".env.example" ".env"
            log_success "Created .env from .env.example"
            log_warning "Please review and update .env with your actual values"
        else
            log_warning "No .env.example found, creating minimal .env"
            create_minimal_env
        fi
    else
        log_info ".env file already exists"
        # Validate existing .env
        validate_env_file
    fi
    
    # Set appropriate permissions
    if [[ -f ".env" ]]; then
        chmod 600 ".env" 2>/dev/null || true
        log_success "Set secure permissions on .env file"
    fi
}

# Create minimal environment file
create_minimal_env() {
    cat > .env << 'EOF'
# SecureFlow Automaton - Minimal Configuration
VITE_APP_NAME="SecureFlow Automaton"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV="development"

# Server Configuration
NODE_ENV=development
PORT=8080
HOST=0.0.0.0

# Development Features
VITE_DEV_TOOLS=true
VITE_HOT_RELOAD=true

# Add your actual configuration values below:
# VITE_SUPABASE_URL=your_supabase_url_here
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
    log_success "Created minimal .env configuration"
}

# Validate environment file
validate_env_file() {
    local issues=0
    
    # Check for common issues
    if grep -q "your_.*_here" ".env" 2>/dev/null; then
        log_warning "Some placeholder values found in .env - please update them"
        ((issues++))
    fi
    
    if [[ $issues -eq 0 ]]; then
        log_success "Environment file validation passed"
    fi
}

# Ultra-safe dependency installation
install_dependencies() {
    log_step "Installing dependencies (this may take a few minutes)..."
    
    # Pre-installation cleanup
    log_info "Preparing for clean installation..."
    
    # Remove any existing problematic files
    rm -rf node_modules package-lock.json .npm 2>/dev/null || true
    
    # Clear npm cache to prevent corruption issues
    if command_exists npm; then
        npm cache clean --force >/dev/null 2>&1 || true
        log_success "Cleared npm cache"
    fi
    
    # Configure npm for reliability
    configure_npm_settings
    
    # Install with multiple fallback strategies
    local install_success=false
    local attempt=1
    local max_attempts=3
    
    while [[ $attempt -le $max_attempts && "$install_success" == "false" ]]; do
        log_info "Installation attempt $attempt of $max_attempts..."
        
        if attempt_npm_install "$attempt"; then
            install_success=true
            log_success "Dependencies installed successfully!"
        else
            log_warning "Installation attempt $attempt failed"
            ((attempt++))
            
            if [[ $attempt -le $max_attempts ]]; then
                log_info "Trying alternative installation method..."
                sleep 2
            fi
        fi
    done
    
    if [[ "$install_success" == "false" ]]; then
        log_error "All installation attempts failed"
        show_installation_troubleshooting
        return 1
    fi
    
    # Post-installation verification
    verify_installation
}

# Configure npm for maximum compatibility
configure_npm_settings() {
    log_info "Configuring npm for optimal compatibility..."
    
    # Set recommended npm configurations
    npm config set fund false 2>/dev/null || true
    npm config set audit-level moderate 2>/dev/null || true
    npm config set prefer-offline false 2>/dev/null || true
    npm config set progress true 2>/dev/null || true
    
    # Platform-specific configurations
    local platform=$(detect_platform)
    case "$platform" in
        windows*)
            npm config set script-shell bash 2>/dev/null || true
            ;;
    esac
    
    log_success "npm configured"
}

# Attempt npm install with different strategies
attempt_npm_install() {
    local attempt="$1"
    
    case "$attempt" in
        1)
            # Standard installation
            log_info "Standard npm install..."
            npm install --no-audit --no-fund
            ;;
        2)
            # With legacy peer deps
            log_info "Installing with legacy peer dependencies..."
            npm install --legacy-peer-deps --no-audit --no-fund
            ;;
        3)
            # Force installation
            log_info "Force installation (last resort)..."
            npm install --force --no-audit --no-fund
            ;;
    esac
}

# Installation troubleshooting guide
show_installation_troubleshooting() {
    log_error "Installation failed. Here are some solutions:"
    echo
    log_info "1. Check your internet connection"
    log_info "2. Try clearing npm cache: npm cache clean --force"
    log_info "3. Delete node_modules and try again: rm -rf node_modules package-lock.json"
    log_info "4. Check if you're behind a corporate firewall (configure proxy)"
    log_info "5. Try using a different Node.js version with nvm"
    echo
    log_tip "Run 'npm run verify' after fixing issues to check your setup"
}

# Comprehensive installation verification
verify_installation() {
    log_step "Verifying installation..."
    
    local issues=0
    
    # Check critical files and directories
    local critical_paths=(
        "node_modules"
        "node_modules/.bin/vite"
        "node_modules/react"
        "node_modules/typescript"
    )
    
    for path in "${critical_paths[@]}"; do
        if [[ -e "$path" ]]; then
            log_success "Found: $path"
        else
            log_error "Missing: $path"
            ((issues++))
        fi
    done
    
    # Test npm scripts
    if npm run type-check >/dev/null 2>&1; then
        log_success "TypeScript compilation check passed"
    else
        log_warning "TypeScript check failed (may need configuration)"
    fi
    
    # Test build process
    log_info "Testing production build..."
    if timeout 60 npm run build >/dev/null 2>&1; then
        log_success "Production build test passed"
    else
        log_warning "Build test failed or timed out"
        ((issues++))
    fi
    
    if [[ $issues -eq 0 ]]; then
        log_success "Installation verification completed successfully!"
        return 0
    else
        log_warning "Some verification checks failed, but project may still work"
        return 0  # Don't fail completely
    fi
}

# Start development server with error handling
start_development_server() {
    log_step "Starting development server..."
    
    # Check if port is available
    local port="${PORT:-$DEFAULT_PORT}"
    if command -v lsof >/dev/null 2>&1 && lsof -i :$port >/dev/null 2>&1; then
        log_warning "Port $port is already in use"
        log_info "The development server will automatically find an available port"
    fi
    
    log_success "Starting server... (this may take a moment)"
    log_info "The browser should open automatically"
    log_info "If not, visit: http://localhost:$port"
    echo
    log_info "Press Ctrl+C to stop the server"
    echo
    
    # Start the server
    npm run dev
}

# Comprehensive setup completion summary
show_setup_complete() {
    log_header "🎉 Setup Complete! 🎉"
    
    echo -e "${GREEN}Your SecureFlow Automaton is ready to go!${NC}\n"
    
    echo -e "${CYAN}🚀 Quick Start Commands:${NC}"
    echo -e "  ${YELLOW}npm run dev${NC}           # Start development server"
    echo -e "  ${YELLOW}npm run build${NC}         # Build for production"
    echo -e "  ${YELLOW}npm run test${NC}          # Run tests"
    echo -e "  ${YELLOW}npm run lint${NC}          # Check code quality"
    echo -e "  ${YELLOW}npm run format${NC}        # Format code"
    echo
    
    echo -e "${CYAN}🔧 Maintenance Commands:${NC}"
    echo -e "  ${YELLOW}npm run verify${NC}        # Verify installation"
    echo -e "  ${YELLOW}npm run setup:full${NC}    # Complete setup from scratch"
    echo -e "  ${YELLOW}npm run clean${NC}         # Clean build artifacts"
    echo
    
    echo -e "${CYAN}🐳 Docker Options:${NC}"
    echo -e "  ${YELLOW}npm run docker:dev${NC}    # Run with Docker (development)"
    echo -e "  ${YELLOW}npm run docker:prod${NC}   # Run with Docker (production)"
    echo
    
    echo -e "${CYAN}📚 Documentation:${NC}"
    echo -e "  • README.md - Complete project documentation"
    echo -e "  • TROUBLESHOOTING.md - Solutions for common issues"
    echo -e "  • system-report.txt - Your system configuration"
    echo
    
    echo -e "${GREEN}Happy coding! 🛡️✨${NC}\n"
}

# Error handling and cleanup
cleanup_on_error() {
    local exit_code=$?
    log_error "Setup encountered an error (exit code: $exit_code)"
    log_info "Check the output above for details"
    log_tip "Run this script again or try 'npm run setup:full'"
    exit $exit_code
}

# Main execution flow
main() {
    # Set up error handling
    trap cleanup_on_error ERR
    
    # Introduction
    log_header "$PROJECT_NAME - Ultimate Setup"
    
    log_info "This script will set up the project with maximum compatibility"
    log_info "It works on Windows, macOS, Linux, and WSL"
    echo
    
    # Main setup sequence
    check_system_requirements || exit 1
    
    setup_environment
    install_dependencies
    
    # Create necessary directories
    mkdir -p logs temp coverage 2>/dev/null || true
    log_success "Created project directories"
    
    # Final verification
    log_step "Running final verification..."
    if command -v node >/dev/null 2>&1 && [[ -f "scripts/post-install-verify.cjs" ]]; then
        node scripts/post-install-verify.cjs
    else
        log_warning "Skipping verification (scripts not available)"
    fi
    
    # Setup complete
    show_setup_complete
    
    # Ask if user wants to start development server
    echo -e "${CYAN}Would you like to start the development server now? [y/N]:${NC} "
    if [[ "${1:-}" == "--auto-start" ]]; then
        echo "y (auto-start enabled)"
        start_development_server
    else
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            start_development_server
        else
            log_info "You can start the server later with: npm run dev"
        fi
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
