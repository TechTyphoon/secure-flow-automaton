#!/bin/bash

# 🔑 Update API Tokens Script
# This script updates all API tokens for 100% real data

echo "🔄 Updating API Tokens for Real Data Integration..."

# Function to update .env file
update_env_var() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        # Update existing variable
        sed -i "s|^${key}=.*|${key}=${value}|" .env
        echo "✅ Updated ${key}"
    else
        # Add new variable
        echo "${key}=${value}" >> .env
        echo "✅ Added ${key}"
    fi
}

# Check if tokens are provided as arguments
if [ $# -eq 0 ]; then
    echo "📋 Usage: ./update-tokens.sh"
    echo ""
    echo "Please provide the following tokens when prompted:"
    echo "1. SonarQube Token (from sonarcloud.io)"
    echo "2. Snyk Token (from snyk.io)"
    echo "3. GitHub Token (from github.com)"
    echo "4. Docker Hub Token (from hub.docker.com)"
    echo ""
    
    # Interactive token input
    read -p "🔑 Enter SonarQube Token: " SONAR_TOKEN
    read -p "🔑 Enter Snyk Token: " SNYK_TOKEN
    read -p "🔑 Enter GitHub Token: " GITHUB_TOKEN
    read -p "🔑 Enter Docker Hub Token: " DOCKER_TOKEN
    
    echo ""
    echo "🔄 Updating .env file..."
    
    # Update all tokens
    update_env_var "SONAR_TOKEN" "$SONAR_TOKEN"
    update_env_var "VITE_SONAR_TOKEN" "$SONAR_TOKEN"
    
    update_env_var "SNYK_TOKEN" "$SNYK_TOKEN"
    update_env_var "VITE_SNYK_TOKEN" "$SNYK_TOKEN"
    
    update_env_var "GITHUB_TOKEN" "$GITHUB_TOKEN"
    update_env_var "VITE_GITHUB_TOKEN" "$GITHUB_TOKEN"
    
    update_env_var "DOCKER_HUB_TOKEN" "$DOCKER_TOKEN"
    update_env_var "VITE_DOCKER_TOKEN" "$DOCKER_TOKEN"
    
    echo ""
    echo "✅ All tokens updated successfully!"
    echo ""
    echo "🔍 Testing token validity..."
    
    # Test tokens
    node validate-real-data.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS: All tokens are valid!"
        echo "🚀 Project is now using 100% real data!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Restart development server: npm run dev"
        echo "2. Test the dashboard at http://localhost:8080"
        echo "3. Verify real data is loading"
    else
        echo ""
        echo "❌ Some tokens failed validation"
        echo "🔧 Please check the tokens and try again"
    fi
else
    echo "❌ Invalid usage. Run without arguments for interactive mode."
    exit 1
fi