#!/bin/bash

# SecureFlow Automaton Build Script
# This script performs a complete build and verification of the application

set -e  # Exit on any error

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

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Main build process
main() {
    print_header "SecureFlow Automaton Build Process"
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js $NODE_VERSION and npm $NPM_VERSION are available"
    
    # Clean previous builds
    print_header "Cleaning Previous Builds"
    print_status "Removing dist directory..."
    rm -rf dist/
    print_status "Removing node_modules cache..."
    rm -rf node_modules/.cache/
    print_success "Clean completed"
    
    # Install dependencies
    print_header "Installing Dependencies"
    print_status "Installing npm packages..."
    npm ci --silent
    print_success "Dependencies installed"
    
    # Run security checks
    print_header "Security Checks"
    print_status "Running npm audit..."
    if npm audit --audit-level=moderate; then
        print_success "No security vulnerabilities found"
    else
        print_warning "Security vulnerabilities detected - please review"
    fi
    
    # Run linting
    print_header "Code Quality Checks"
    print_status "Running ESLint..."
    if npm run lint; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        exit 1
    fi
    
    # Run security linting
    print_status "Running security linting..."
    if npm run lint:security; then
        print_success "Security linting passed"
    else
        print_warning "Security linting issues found"
    fi
    
    # Run type checking
    print_header "Type Checking"
    print_status "Running TypeScript type checking..."
    if npm run type-check; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed"
        exit 1
    fi
    
    # Run tests
    print_header "Testing"
    print_status "Running test suite..."
    if npm test; then
        print_success "Tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
    
    # Build the application
    print_header "Building Application"
    print_status "Building for production..."
    if npm run build:prod; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
    
    # Verify build output
    print_header "Verifying Build Output"
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist/ | cut -f1)
        print_success "Build output created successfully (Size: $DIST_SIZE)"
        
        # Check for essential files
        if [ -f "dist/index.html" ]; then
            print_success "index.html found"
        else
            print_error "index.html missing"
            exit 1
        fi
        
        # Check for assets
        if [ -d "dist/assets" ]; then
            ASSET_COUNT=$(ls -1 dist/assets/ | wc -l)
            print_success "Assets directory found ($ASSET_COUNT files)"
        else
            print_warning "Assets directory not found"
        fi
    else
        print_error "Build output directory not found"
        exit 1
    fi
    
    # Generate build report
    print_header "Build Report"
    print_status "Generating build report..."
    
    echo "Build Report - $(date)" > build-report.txt
    echo "=========================" >> build-report.txt
    echo "" >> build-report.txt
    echo "Environment:" >> build-report.txt
    echo "- Node.js: $NODE_VERSION" >> build-report.txt
    echo "- npm: $NPM_VERSION" >> build-report.txt
    echo "- Build size: $DIST_SIZE" >> build-report.txt
    echo "" >> build-report.txt
    echo "Build artifacts:" >> build-report.txt
    ls -la dist/ >> build-report.txt
    
    print_success "Build report generated: build-report.txt"
    
    # Final success message
    print_header "Build Complete"
    print_success "SecureFlow Automaton built successfully!"
    print_status "Build artifacts are available in the dist/ directory"
    print_status "To preview the build: npm run preview"
    print_status "To deploy with Docker: npm run docker:prod"
    
    # Optional: Start preview server
    read -p "Would you like to start the preview server? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting preview server..."
        npm run preview
    fi
}

# Trap errors and cleanup
trap 'print_error "Build failed at line $LINENO"' ERR

# Run main function
main "$@"
