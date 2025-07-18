# Quick Docker Setup Guide

## 🚀 One-Command Setup

After cloning the repository, run:

```bash
# Make the script executable
chmod +x docker-run.sh

# Start the application (production mode)
./docker-run.sh start-prod
```

That's it! The application will be available at http://localhost:8080

## 🔧 Alternative Commands

```bash
# Development mode with hot reload
./docker-run.sh start-dev

# Stop all services
./docker-run.sh stop

# View logs
./docker-run.sh logs

# Clean up everything
./docker-run.sh clean
```

## 📋 Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)

## 🌐 Access Points

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **Database**: localhost:5432
- **Email UI**: http://localhost:9000

## 🛠️ Manual Docker Commands

If you prefer not to use the helper script:

```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose down
```

## 📚 Full Documentation

See [DOCKER.md](DOCKER.md) for complete Docker documentation.
