# SecureFlow Automaton Makefile
# Provides common development tasks and shortcuts

.PHONY: help install dev build test clean docker-dev docker-prod security lint format

# Default target
.DEFAULT_GOAL := help

# Variables
NODE_VERSION := $(shell node --version 2>/dev/null || echo "not found")
NPM_VERSION := $(shell npm --version 2>/dev/null || echo "not found")
DOCKER_VERSION := $(shell docker --version 2>/dev/null || echo "not found")

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)SecureFlow Automaton Development Commands$(NC)"
	@echo ""
	@echo "Environment:"
	@echo "  Node.js: $(NODE_VERSION)"
	@echo "  npm: $(NPM_VERSION)"
	@echo "  Docker: $(DOCKER_VERSION)"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm ci
	@echo "$(GREEN)Dependencies installed successfully!$(NC)"

dev: ## Start development server
	@echo "$(YELLOW)Starting development server...$(NC)"
	npm run dev

build: ## Build the application
	@echo "$(YELLOW)Building application...$(NC)"
	npm run build
	@echo "$(GREEN)Build completed successfully!$(NC)"

build-prod: ## Build for production
	@echo "$(YELLOW)Building for production...$(NC)"
	npm run build:prod
	@echo "$(GREEN)Production build completed!$(NC)"

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	npm test
	@echo "$(GREEN)Tests completed!$(NC)"

lint: ## Run linting
	@echo "$(YELLOW)Running ESLint...$(NC)"
	npm run lint
	@echo "$(GREEN)Linting completed!$(NC)"

lint-fix: ## Fix linting issues
	@echo "$(YELLOW)Fixing linting issues...$(NC)"
	npm run lint:fix
	@echo "$(GREEN)Linting issues fixed!$(NC)"

format: ## Format code with Prettier
	@echo "$(YELLOW)Formatting code...$(NC)"
	npx prettier --write src/
	@echo "$(GREEN)Code formatted!$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(YELLOW)Running TypeScript type checking...$(NC)"
	npm run type-check
	@echo "$(GREEN)Type checking completed!$(NC)"

security: ## Run security checks
	@echo "$(YELLOW)Running security checks...$(NC)"
	npm run security:scan
	@echo "$(GREEN)Security checks completed!$(NC)"

security-pipeline: ## Run complete security pipeline
	@echo "$(YELLOW)Running security pipeline...$(NC)"
	npm run security:pipeline
	@echo "$(GREEN)Security pipeline completed!$(NC)"

clean: ## Clean build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf dist/
	rm -rf node_modules/
	rm -rf .vite/
	@echo "$(GREEN)Cleaned successfully!$(NC)"

docker-dev: ## Start development environment with Docker
	@echo "$(YELLOW)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up --build
	@echo "$(GREEN)Development environment started!$(NC)"

docker-prod: ## Start production environment with Docker
	@echo "$(YELLOW)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml up --build
	@echo "$(GREEN)Production environment started!$(NC)"

docker-stop: ## Stop all Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.prod.yml down
	@echo "$(GREEN)Docker containers stopped!$(NC)"

docker-clean: ## Clean Docker artifacts
	@echo "$(YELLOW)Cleaning Docker artifacts...$(NC)"
	docker system prune -f
	docker volume prune -f
	@echo "$(GREEN)Docker artifacts cleaned!$(NC)"

db-migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	npm run db:migrate
	@echo "$(GREEN)Database migrations completed!$(NC)"

db-reset: ## Reset database
	@echo "$(YELLOW)Resetting database...$(NC)"
	npm run db:reset
	@echo "$(GREEN)Database reset completed!$(NC)"

db-seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(NC)"
	npm run db:seed
	@echo "$(GREEN)Database seeded!$(NC)"

setup: install ## Initial project setup
	@echo "$(YELLOW)Setting up project...$(NC)"
	cp .env.example .env.local
	@echo "$(GREEN)Project setup completed!$(NC)"
	@echo "$(YELLOW)Please edit .env.local with your configuration$(NC)"

check: lint type-check security ## Run all checks
	@echo "$(GREEN)All checks passed!$(NC)"

all: clean install build test check ## Run complete build pipeline
	@echo "$(GREEN)Complete build pipeline finished!$(NC)"

# Development shortcuts
start: dev ## Alias for dev
serve: dev ## Alias for dev
run: dev ## Alias for dev

# Docker shortcuts
up: docker-dev ## Alias for docker-dev
down: docker-stop ## Alias for docker-stop

# Database shortcuts
migrate: db-migrate ## Alias for db-migrate
reset: db-reset ## Alias for db-reset
seed: db-seed ## Alias for db-seed

# Quality shortcuts
qa: check ## Alias for check
quality: check ## Alias for check
