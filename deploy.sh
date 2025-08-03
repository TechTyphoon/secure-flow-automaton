#!/bin/bash

# 🚀 FREE DEPLOYMENT SCRIPT
# This script deploys your DevSecOps platform for FREE!

echo "🚀 Starting FREE deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo "🎯 Deploying to Vercel (FREE)..."
    cd apps/web
    vercel --prod --yes
    echo "✅ Deployed to Vercel!"
    echo "🌐 Your app is now live at: https://your-app.vercel.app"
else
    echo "📋 Vercel CLI not found. Here are your deployment options:"
    echo ""
    echo "🎯 Option 1: Deploy to Vercel (FREE)"
    echo "   1. Install Vercel CLI: npm i -g vercel"
    echo "   2. Run: cd apps/web && vercel --prod"
    echo ""
    echo "🎯 Option 2: Deploy to Netlify (FREE)"
    echo "   1. Go to https://netlify.com"
    echo "   2. Drag the 'dist' folder to deploy"
    echo ""
    echo "🎯 Option 3: Deploy to GitHub Pages (FREE)"
    echo "   1. Push to GitHub"
    echo "   2. Enable GitHub Pages in settings"
    echo ""
    echo "📊 All options are FREE and include:"
    echo "   ✅ SSL certificates"
    echo "   ✅ CDN"
    echo "   ✅ Custom domains"
    echo "   ✅ Automatic deployments"
fi

echo ""
echo "🎉 Your DevSecOps platform is ready for FREE deployment!"
echo "💰 Total cost: $0"
echo "🚀 Total time: 5 minutes" 