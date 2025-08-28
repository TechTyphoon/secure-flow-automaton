#!/bin/bash

# EMERGENCY SCRIPT TO REMOVE SENSITIVE .ENV FILES FROM GIT
# Run this IMMEDIATELY to prevent further exposure

echo "🚨 EMERGENCY: Removing sensitive .env files from Git tracking..."

# Step 1: Remove .env files from tracking (but keep local copies)
git rm --cached .env
git rm --cached config/environment/.env
git rm --cached config/environment/.env.production
git rm --cached config/environment/.env.backup
git rm --cached config/environment/.env.production.backup
git rm --cached infrastructure/.env.jenkins

# Step 2: Update .gitignore to prevent future tracking
echo "" >> .gitignore
echo "# Environment files - NEVER commit these!" >> .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "*.env" >> .gitignore
echo "config/environment/.env*" >> .gitignore
echo "!config/environment/.env.example" >> .gitignore
echo "!config/environment/.env.*.template" >> .gitignore
echo "infrastructure/.env*" >> .gitignore

# Step 3: Commit the changes
git add .gitignore
git commit -m "SECURITY: Remove exposed environment files and update .gitignore"

echo "✅ Files removed from tracking. Now we need to clean history..."
echo ""
echo "⚠️  IMPORTANT: Your sensitive data is still in Git history!"
echo "To completely remove it, you need to:"
echo ""
echo "1. Use BFG Repo-Cleaner or git-filter-branch to clean history"
echo "2. Force push to all remote branches"
echo "3. Contact GitHub support to purge cached views"
echo ""
echo "Run these commands to clean history with BFG:"
echo "  wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar"
echo "  java -jar bfg-1.14.0.jar --delete-files '.env' ."
echo "  git reflog expire --expire=now --all && git gc --prune=now --aggressive"
echo "  git push --force --all"
echo "  git push --force --tags"