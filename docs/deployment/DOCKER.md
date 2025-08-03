# 🐳 Docker Setup for Secure Flow Automaton

This project has been fully dockerized for easy deployment and development. You can run the entire application stack with just a few commands.

## 🚀 Quick Start

### Prerequisites
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Running the Application

#### Option 1: Using the Helper Script (Recommended)
```bash
# Start in production mode
./docker-run.sh start-prod

# Start in development mode
./docker-run.sh start-dev

# Stop all services
./docker-run.sh stop

# View logs
./docker-run.sh logs

# Show service status
./docker-run.sh status

# Clean up Docker resources
./docker-run.sh clean
```

#### Option 2: Using Docker Compose Directly

**Production Mode:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Development Mode:**
```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🌐 Service URLs

Once the application is running, you can access:

- **🖥️ Frontend Application**: http://localhost:8080
- **🔌 API Server**: http://localhost:3000
- **🔐 Authentication Service**: http://localhost:9999
- **📧 Email Testing Interface**: http://localhost:9000
- **💾 Database**: localhost:5432
- **📁 Storage API**: http://localhost:5000
- **🔄 Realtime Service**: http://localhost:4000

## 🏗️ Architecture

The Docker setup includes:

### Core Services
- **secure-flow-app**: Main React application (Nginx + built assets)
- **supabase-db**: PostgreSQL database with migrations
- **supabase-rest**: PostgREST API server
- **supabase-auth**: Authentication service (GoTrue)
- **supabase-realtime**: Real-time subscriptions
- **supabase-storage**: File storage service

### Development Services
- **supabase-imgproxy**: Image transformation service
- **supabase-inbucket**: Email testing service

## 🔧 Configuration

### Environment Variables
- Production: `.env.docker`
- Development: Uses default values in `docker-compose.dev.yml`

### Database
- Default credentials: `postgres/your-super-secret-and-long-postgres-password`
- Database: `postgres`
- Port: `5432`

### Security
- JWT Secret: `your-super-secret-jwt-token-with-at-least-32-characters-long`
- Change these secrets in production!

## 📁 File Structure

```
.
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── docker-run.sh           # Helper script
├── nginx.conf              # Nginx configuration
├── .dockerignore           # Docker ignore patterns
└── .env.docker            # Environment variables
```

## 🛠️ Development

### Hot Reload
Development mode includes hot reload for the frontend:
```bash
./docker-run.sh start-dev
```

### Database Migrations
Migrations are automatically applied when the database starts:
```bash
# Check migration status
docker-compose exec supabase-db psql -U postgres -c "SELECT * FROM schema_migrations;"
```

### Debugging
```bash
# View logs for specific service
docker-compose logs -f secure-flow-app

# Execute commands in container
docker-compose exec secure-flow-app sh

# Connect to database
docker-compose exec supabase-db psql -U postgres
```

## 🚨 Production Deployment

### Security Checklist
1. **Change default passwords** in `.env.docker`
2. **Update JWT secrets** with secure random values
3. **Configure proper domains** in environment variables
4. **Set up SSL/TLS** (use reverse proxy like Traefik/Nginx)
5. **Configure backups** for database volumes
6. **Set up monitoring** and logging

### Scaling
```bash
# Scale specific services
docker-compose up -d --scale secure-flow-app=3
```

## 📊 Monitoring

### Health Checks
All services include health checks:
```bash
# Check service health
docker-compose ps
```

### Resource Usage
```bash
# Monitor resource usage
docker stats

# View system info
docker system df
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
docker-compose exec supabase-db pg_dump -U postgres postgres > backup.sql

# Restore backup
docker-compose exec -T supabase-db psql -U postgres postgres < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v secure-flow-automaton_supabase-db-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using a port
sudo netstat -tulpn | grep :8080

# Stop conflicting services
sudo systemctl stop apache2  # or nginx
```

**Permission issues:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

**Database connection issues:**
```bash
# Check database logs
docker-compose logs supabase-db

# Restart database
docker-compose restart supabase-db
```

**Clean installation:**
```bash
# Complete cleanup and fresh start
./docker-run.sh clean
./docker-run.sh start-prod
```

## 📝 Logs

### Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f secure-flow-app

# Last 100 lines
docker-compose logs --tail=100 secure-flow-app
```

### Log Rotation
Logs are automatically rotated by Docker. Configure in `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test with Docker: `./docker-run.sh start-dev`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

For more information about the application features and usage, see the main [README.md](README.md) file.
