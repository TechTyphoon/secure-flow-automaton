#!/bin/bash

# Simple test script to verify application is working

echo "==========================================="
echo "   TESTING SECUREFLOW AUTOMATON"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting development server..."
echo "The app will open at http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server when done testing"
echo ""
echo "----------------------------------------"

# Start the dev server
npm run dev

echo ""
echo "==========================================="
echo "Server stopped. Test complete!"
echo "==========================================="
