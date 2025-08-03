#!/bin/bash

# 🔑 Quick Token Setup Script
# Run this after getting your fresh tokens

echo "🔄 SecureFlow Automaton - Token Setup"
echo "====================================="

# Function to update .env
update_token() {
    local key=$1
    local value=$2
    
    # Update both VITE_ and non-VITE versions
    sed -i "s|^${key}=.*|${key}=${value}|g" .env
    sed -i "s|^VITE_${key}=.*|VITE_${key}=${value}|g" .env
    echo "✅ Updated $key"
}

echo ""
echo "Please provide your fresh tokens:"
echo ""

read -p "📊 SonarQube Token (squ_...): " SONAR_TOKEN
read -p "🔒 Snyk Token (UUID): " SNYK_TOKEN  
read -p "🐙 GitHub Token (ghp_...): " GITHUB_TOKEN
read -p "🐳 Docker Hub Token (dckr_pat_...): " DOCKER_TOKEN
read -p "🐳 Docker Hub Username: " DOCKER_USERNAME
read -p "🗄️ Supabase Anon Key: " SUPABASE_ANON_KEY

echo ""
echo "🔄 Updating configuration..."

# Update all tokens
update_token "SONAR_TOKEN" "$SONAR_TOKEN"
update_token "SNYK_TOKEN" "$SNYK_TOKEN"
update_token "GITHUB_TOKEN" "$GITHUB_TOKEN"
update_token "DOCKER_HUB_TOKEN" "$DOCKER_TOKEN"
update_token "DOCKER_TOKEN" "$DOCKER_TOKEN"
update_token "DOCKER_HUB_USERNAME" "$DOCKER_USERNAME"
update_token "DOCKER_USERNAME" "$DOCKER_USERNAME"
update_token "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
update_token "SUPABASE_SERVICE_KEY" "$SUPABASE_ANON_KEY"

echo ""
echo "✅ All tokens updated!"
echo ""
echo "🔍 Testing token validity..."

# Test the tokens
node test-api-integrations.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS: All tokens are working!"
    echo "🚀 Project now uses 100% real data!"
    echo ""
    echo "Next steps:"
    echo "1. npm run dev (restart dev server)"
    echo "2. Visit http://localhost:8080"
    echo "3. Check real data in dashboard"
else
    echo ""
    echo "⚠️ Some tokens may need verification"
    echo "Check the output above"
fi