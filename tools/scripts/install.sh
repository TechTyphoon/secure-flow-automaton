#!/usr/bin/env bash

# 🚀 One-Line Installer for SecureFlow Automaton
# curl -fsSL https://raw.githubusercontent.com/TechTyphoon/secure-flow-automaton/main/install.sh | bash

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🛡️  SecureFlow Automaton - One-Line Installer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if git is available
if ! command -v git >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Git not found. Please install Git first.${NC}"
    exit 1
fi

# Clone the repository
echo -e "${BLUE}📥 Cloning SecureFlow Automaton...${NC}"
if [[ -d "secure-flow-automaton" ]]; then
    echo -e "${YELLOW}Directory exists, updating...${NC}"
    cd secure-flow-automaton
    git pull origin main
else
    git clone https://github.com/TechTyphoon/secure-flow-automaton.git
    cd secure-flow-automaton
fi

# Make scripts executable
chmod +x *.sh 2>/dev/null || true

echo -e "${GREEN}✅ Repository ready!${NC}"
echo

# Run the ultimate setup
echo -e "${CYAN}🚀 Starting ultimate setup...${NC}"
if [[ -f "ultimate-setup.sh" ]]; then
    ./ultimate-setup.sh
else
    echo -e "${YELLOW}Falling back to friend-proof setup...${NC}"
    ./friend-proof-setup.sh
fi
