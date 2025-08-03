#!/bin/bash

# 🚀 SecureFlow Automaton - Automatic Deployment Script
# This script provides one-command deployment to multiple platforms

set -e

echo "🚀 SecureFlow Automaton - Automatic Deployment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_info "Current directory: $(pwd)"
print_info "Project: $(grep -o '"name": "[^"]*' package.json | cut -d'"' -f4)"

echo ""
echo "Select deployment option:"
echo "1) 🚀 Vercel (Fastest - Static React App)"
echo "2) 🌐 Netlify (Alternative Static)"
echo "3) 🚂 Railway (Full-Stack with Database)"
echo "4) 🐳 Docker Local (localhost:8080)"
echo "5) 📄 GitHub Pages (Free Static)"
echo "6) 🛠️  Manual Setup (Show commands only)"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        print_info "Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        print_info "Building project..."
        npm run build
        
        print_info "Deploying to Vercel..."
        vercel --prod
        
        print_status "Deployment complete! Your app is live on Vercel."
        ;;
        
    2)
        echo ""
        print_info "Deploying to Netlify..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_warning "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
        fi
        
        print_info "Building project..."
        npm run build
        
        print_info "Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        
        print_status "Deployment complete! Your app is live on Netlify."
        ;;
        
    3)
        echo ""
        print_info "Setting up Railway deployment..."
        print_warning "Railway requires manual setup through their web interface."
        echo ""
        echo "🚂 Railway Deployment Steps:"
        echo "1. Go to https://railway.app"
        echo "2. Sign up/Login with GitHub"
        echo "3. Click 'Deploy from GitHub repo'"
        echo "4. Select 'TechTyphoon/secure-flow-automaton'"
        echo "5. ✅ Automatic deployment starts!"
        echo ""
        print_info "railway.yaml configuration file has been created for you."
        ;;
        
    4)
        echo ""
        print_info "Deploying with Docker locally..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            print_error "Docker not found. Please install Docker first."
            echo "Visit: https://docs.docker.com/get-docker/"
            exit 1
        fi
        
        # Setup environment
        if [ ! -f ".env" ]; then
            print_info "Creating environment file..."
            cp .env.production .env
            print_warning "Please edit .env file with your actual values before running."
        fi
        
        print_info "Building and starting containers..."
        docker-compose -f docker-compose.prod.yml up -d --build
        
        print_status "Deployment complete!"
        print_info "Your app is running at: http://localhost:8080"
        print_info "To stop: docker-compose -f docker-compose.prod.yml down"
        ;;
        
    5)
        echo ""
        print_info "Setting up GitHub Pages deployment..."
        
        # Check if gh-pages is installed
        if ! npm list gh-pages &> /dev/null; then
            print_info "Installing gh-pages..."
            npm install --save-dev gh-pages
        fi
        
        # Add deploy script if not exists
        if ! grep -q '"deploy"' package.json; then
            print_info "Adding deploy script to package.json..."
            # This is a simplified version - in practice you'd use a proper JSON editor
            print_warning "Please manually add this script to your package.json:"
            echo '"deploy": "npm run build && gh-pages -d dist"'
        fi
        
        print_info "Building project..."
        npm run build
        
        print_info "Deploying to GitHub Pages..."
        npx gh-pages -d dist
        
        print_status "Deployment complete!"
        print_info "Your app will be available at: https://techtyphoon.github.io/secure-flow-automaton"
        print_warning "Note: It may take a few minutes for GitHub Pages to update."
        ;;
        
    6)
        echo ""
        print_info "Manual Setup Commands:"
        echo ""
        echo "🚀 Vercel:"
        echo "  npm install -g vercel"
        echo "  npm run build"
        echo "  vercel --prod"
        echo ""
        echo "🌐 Netlify:"
        echo "  npm install -g netlify-cli"
        echo "  npm run build"
        echo "  netlify deploy --prod --dir=dist"
        echo ""
        echo "🐳 Docker:"
        echo "  cp .env.production .env"
        echo "  # Edit .env with your values"
        echo "  docker-compose -f docker-compose.prod.yml up -d"
        echo ""
        echo "📄 GitHub Pages:"
        echo "  npm install --save-dev gh-pages"
        echo "  npm run build"
        echo "  npx gh-pages -d dist"
        echo ""
        print_info "All configuration files have been created for you!"
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again and select 1-6."
        exit 1
        ;;
esac

echo ""
print_status "🎉 SecureFlow Automaton deployment process complete!"
echo ""
print_info "Your project includes:"
echo "  ✅ Security headers configured"
echo "  ✅ Performance optimizations enabled"
echo "  ✅ CI/CD pipelines ready"
echo "  ✅ Docker containerization complete"
echo "  ✅ Multiple deployment options configured"
echo ""
print_info "For more details, check DEPLOYMENT.md"
