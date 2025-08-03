#!/bin/bash

# 🚀 SecureFlow Automaton Development Setup Script
# This script sets up the development environment automatically

set -e

echo "🛡️ Setting up SecureFlow Automaton Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is >= 18
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: v$NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local from .env.example..."
        cp .env.example .env.local
        print_warning "Please update .env.local with your actual configuration values"
    else
        print_success ".env.local already exists"
    fi
}

# Run type check
run_type_check() {
    print_status "Running TypeScript type check..."
    if npm run type-check; then
        print_success "TypeScript compilation successful"
    else
        print_warning "TypeScript compilation has issues (non-blocking)"
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    if npm test; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed (non-blocking)"
    fi
}

# Main setup process
main() {
    echo "🚀 Starting development environment setup..."
    echo ""
    
    check_node
    check_npm
    setup_env
    install_dependencies
    run_type_check
    run_tests
    
    echo ""
    print_success "🎉 Development environment setup complete!"
    echo ""
    echo "🏃 Quick start commands:"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build for production"
    echo "  npm run test         - Run tests"
    echo "  npm run lint         - Run linting"
    echo ""
    echo "📝 Don't forget to:"
    echo "  1. Update .env.local with your actual values"
    echo "  2. Review the README.md for detailed setup instructions"
    echo ""
}

# Run main function
main
