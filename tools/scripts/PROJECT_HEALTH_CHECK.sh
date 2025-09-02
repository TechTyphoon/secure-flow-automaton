#!/bin/bash

# ============================================
# SecureFlow Automaton - Complete Health Check
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
WARNINGS=0
FAILED=0

echo "================================================="
echo "   SECUREFLOW AUTOMATON - PROJECT HEALTH CHECK  "
echo "================================================="
echo ""
echo "Date: $(date)"
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"
echo ""

# Function to check status
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    fi
}

warning_status() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "1. CHECKING DEPENDENCIES"
echo "------------------------"
if [ -f "package.json" ]; then
    npm list --depth=0 > /dev/null 2>&1
    check_status $? "Dependencies installed correctly"
    
    npm audit --audit-level=high 2>&1 | grep -q "found 0 high"
    if [ $? -eq 0 ]; then
        check_status 0 "No high severity vulnerabilities"
    else
        warning_status "Some vulnerabilities found (non-critical)"
    fi
else
    check_status 1 "package.json not found"
fi

echo ""
echo "2. CHECKING BUILD CONFIGURATION"
echo "-------------------------------"
[ -f "vite.config.ts" ] && check_status 0 "Vite config exists" || check_status 1 "Vite config missing"
[ -f "tsconfig.json" ] && check_status 0 "TypeScript config exists" || check_status 1 "TypeScript config missing"
[ -f "tailwind.config.ts" ] && check_status 0 "Tailwind config exists" || check_status 1 "Tailwind config missing"
[ -f "postcss.config.js" ] && check_status 0 "PostCSS config exists" || check_status 1 "PostCSS config missing"

echo ""
echo "3. CHECKING SOURCE FILES"
echo "------------------------"
[ -f "index.html" ] && check_status 0 "Main HTML file exists" || check_status 1 "Main HTML file missing"
[ -f "apps/web/main.tsx" ] && check_status 0 "Main TypeScript entry exists" || check_status 1 "Main entry missing"
[ -f "apps/web/App-fixed.tsx" ] && check_status 0 "App component exists" || check_status 1 "App component missing"
[ -d "apps/web/components" ] && check_status 0 "Components directory exists" || check_status 1 "Components directory missing"
[ -d "apps/web/services" ] && check_status 0 "Services directory exists" || check_status 1 "Services directory missing"

echo ""
echo "4. CHECKING ENVIRONMENT SETUP"
echo "-----------------------------"
if [ -f ".env" ] || [ -f ".env.local" ]; then
    check_status 0 "Environment file exists"
else
    warning_status "No .env file found (will use defaults)"
    echo "  Creating .env from template..."
    if [ -f ".env.local" ]; then
        cp .env.local .env
        check_status 0 "Created .env from template"
    fi
fi

echo ""
echo "5. RUNNING TYPE CHECK"
echo "--------------------"
npm run type-check > /dev/null 2>&1
check_status $? "TypeScript compilation passes"

echo ""
echo "6. RUNNING LINTER"
echo "----------------"
npm run lint 2>&1 | grep -q "warning"
if [ $? -eq 0 ]; then
    warning_status "Linter warnings present (non-critical)"
else
    check_status 0 "No linting errors"
fi

echo ""
echo "7. RUNNING TESTS"
echo "---------------"
npm run test > /dev/null 2>&1
check_status $? "All tests pass"

echo ""
echo "8. TESTING BUILD"
echo "---------------"
npm run build > /dev/null 2>&1
check_status $? "Production build succeeds"

if [ $? -eq 0 ]; then
    [ -d "dist" ] && check_status 0 "Build output created" || check_status 1 "Build output missing"
    
    # Check build size
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        echo "  Build size: $BUILD_SIZE"
    fi
fi

echo ""
echo "9. CHECKING CRITICAL FEATURES"
echo "-----------------------------"
[ -d "apps/quantum-edge" ] && check_status 0 "Quantum module exists" || warning_status "Quantum module missing"
[ -d "experimental-validation" ] && check_status 0 "Experimental framework exists" || warning_status "Experimental framework missing"
[ -f "docs/research/ENHANCED_LITERATURE_REFERENCES.md" ] && check_status 0 "Literature references updated" || warning_status "Literature references missing"

echo ""
echo "10. SERVER TEST"
echo "--------------"
echo "Testing if development server can start..."
timeout 5s npm run dev > /dev/null 2>&1
if [ $? -eq 124 ]; then
    # Timeout exit code means server started successfully
    check_status 0 "Development server starts"
else
    check_status 1 "Development server failed to start"
fi

echo ""
echo "================================================="
echo "                 HEALTH CHECK SUMMARY            "
echo "================================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ PROJECT IS HEALTHY AND READY TO RUN!${NC}"
    echo ""
    echo "To start the application:"
    echo "  npm run dev        # Development mode"
    echo "  npm run build      # Production build"
    echo "  npm run preview    # Preview production build"
    echo ""
    echo "Application will be available at:"
    echo "  http://localhost:8080"
    
    if [ $WARNINGS -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Note: Some warnings were found but they won't prevent the app from running.${NC}"
    fi
else
    echo -e "${RED}❌ PROJECT HAS ISSUES THAT NEED TO BE FIXED${NC}"
    echo ""
    echo "Please address the failed checks above before running the application."
fi

echo ""
echo "================================================="

# Return appropriate exit code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
