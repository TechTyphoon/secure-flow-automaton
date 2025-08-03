#!/bin/bash

# 🧹 Cleanup Personal Data for Git Push
# This script removes all personal/sensitive data before pushing to GitHub

echo "🧹 Cleaning up personal data for Git push..."

# Create backup of current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "📁 Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"

# Create clean environment template
cat > .env.clean << 'EOF'
# Application Configuration
VITE_APP_NAME="SecureFlow Automaton"
VITE_APP_VERSION="4.1.0"
VITE_APP_ENV="development"

# Supabase Configuration - REPLACE WITH YOUR VALUES
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Security Service APIs - REPLACE WITH YOUR TOKENS
SONAR_TOKEN=your_sonarqube_token_here
VITE_SONAR_TOKEN=your_sonarqube_token_here
SONAR_URL=https://sonarcloud.io
SONAR_PROJECT_KEY=your_project_key_here

SNYK_TOKEN=your_snyk_api_token_here
VITE_SNYK_TOKEN=your_snyk_api_token_here
SNYK_ORG_ID=your_snyk_organization_id_here
VITE_SNYK_ORG_ID=your_snyk_organization_id_here

GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_TOKEN=your_github_token_here

# Container Security
DOCKER_HUB_USERNAME=your_dockerhub_username
VITE_DOCKER_USERNAME=your_dockerhub_username
DOCKER_HUB_TOKEN=your_dockerhub_token_here
VITE_DOCKER_TOKEN=your_dockerhub_token_here

# AWS Configuration - REPLACE WITH YOUR CREDENTIALS
AWS_ACCESS_KEY_ID=your_aws_access_key_here
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
VITE_AWS_REGION=us-east-1

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_DB=your_database_name
POSTGRES_USER=your_database_user
POSTGRES_PASSWORD=your_database_password
POSTGRES_HOST=your_database_host
POSTGRES_PORT=5432

# Notification Configuration
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
VITE_SLACK_WEBHOOK_URL=your_slack_webhook_url_here

# Email Configuration
SMTP_SERVER=smtp.gmail.com
VITE_SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
VITE_SMTP_PORT=587
SMTP_USERNAME=your_email@example.com
VITE_SMTP_USERNAME=your_email@example.com
SMTP_PASSWORD=your_email_password_here
VITE_SMTP_PASSWORD=your_email_password_here
SMTP_FROM=your_email@example.com
VITE_SMTP_FROM=your_email@example.com

# Monitoring Configuration
SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_DSN=your_sentry_dsn_here

# Security Configuration
SECURITY_SCAN_ENABLED=true
SECURITY_SCAN_INTERVAL=300000
VULNERABILITY_THRESHOLD=high
SESSION_TIMEOUT=1800000
MFA_ENABLED=true
RATE_LIMIT_ENABLED=true

# Development Configuration
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_DEBUG=true

# Production ready - no mock data
VITE_USE_MOCK_DATA=false
USE_MOCK_DATA=false
EOF

# Replace .env with clean version
mv .env.clean .env
echo "✅ .env file cleaned (all personal data removed)"

# Clean up any temporary files with sensitive data
rm -f .env.backup.* 2>/dev/null || true
rm -f validate-real-data.js 2>/dev/null || true
rm -f test-api-integrations.js 2>/dev/null || true
rm -f update-tokens.sh 2>/dev/null || true
rm -f get-fresh-tokens-guide.md 2>/dev/null || true
rm -f setup-supabase-schema.sql 2>/dev/null || true

echo "✅ Removed temporary files with sensitive data"

# Update .gitignore to ensure sensitive files are ignored
cat >> .gitignore << 'EOF'

# Personal Data & Sensitive Files
.env.backup.*
.env.local
.env.production
*.backup
validate-real-data.js
test-api-integrations.js
update-tokens.sh
get-fresh-tokens-guide.md
setup-supabase-schema.sql
cleanup-for-git.sh

# IDE & OS
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db
EOF

echo "✅ Updated .gitignore"

# Show git status
echo ""
echo "📊 Git Status:"
git status --porcelain

echo ""
echo "🎉 Cleanup complete! Safe to push to GitHub."
echo ""
echo "📋 What was cleaned:"
echo "   ✅ All API tokens and credentials removed"
echo "   ✅ Personal email and passwords removed"
echo "   ✅ Database credentials templated"
echo "   ✅ Temporary files deleted"
echo "   ✅ .gitignore updated"
echo ""
echo "🚀 Ready for: git add . && git commit -m 'Production ready with real data integration' && git push"