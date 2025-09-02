# Secure Flow Automaton - Development Makefile
# Provides consistent interface for common development tasks

.PHONY: help install test build clean deploy lint security-check health-check

# Default target
help:
	@echo "Secure Flow Automaton - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install        Install dependencies"
	@echo "  test           Run tests"
	@echo "  build          Build the application"
	@echo "  lint           Run linting"
	@echo "  type-check     Run TypeScript type checking"
	@echo ""
	@echo "Security & Quality:"
	@echo "  security-check Run security scans"
	@echo "  health-check   Run project health checks"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy         Deploy to production"
	@echo "  deploy-staging Deploy to staging"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean          Clean build artifacts"
	@echo "  clean-all      Clean all generated files"

# Development tasks
install:
	npm ci

test:
	npm test

build:
	npm run build

lint:
	npm run lint

type-check:
	npm run type-check

# Security and quality tasks
security-check:
	@echo "Running security checks..."
	@npm audit --audit-level=moderate
	@npx eslint . --ext .ts,.tsx --config .eslintrc.security.cjs

health-check:
	@echo "Running project health checks..."
	@bash tools/scripts/PROJECT_HEALTH_CHECK.sh

# Deployment tasks
deploy:
	@echo "Deploying to production..."
	@bash tools/scripts/deploy.sh

deploy-staging:
	@echo "Deploying to staging..."
	@bash tools/scripts/deploy.sh staging

# Maintenance tasks
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist/
	@rm -rf node_modules/.cache/
	@rm -rf coverage/

clean-all: clean
	@echo "Cleaning all generated files..."
	@rm -rf node_modules/
	@rm -rf .next/
	@rm -rf .nuxt/
	@rm -rf .output/
	@find . -name "*.log" -delete
	@find . -name "*.tmp" -delete

# Quick setup for new developers
setup: install
	@echo "Setup complete! Run 'make help' to see available commands."
