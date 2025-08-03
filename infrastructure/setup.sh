#!/bin/bash

# Jenkins Setup Script for SecureFlow Automaton
# This script sets up Jenkins with all required configurations

set -e

echo "🚀 Setting up Jenkins for SecureFlow Automaton..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install curl first."
        exit 1
    fi
    
    print_status "All requirements satisfied ✅"
}

# Create necessary directories
create_directories() {
    print_status "Creating directories..."
    
    mkdir -p jenkins/logs
    mkdir -p jenkins/backups
    mkdir -p jenkins/ssl
    mkdir -p jenkins/shared-library/vars
    mkdir -p jenkins/shared-library/src
    mkdir -p jenkins/pipelines
    
    print_status "Directories created ✅"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    print_status "Generating SSL certificates..."
    
    if [ ! -f jenkins/ssl/jenkins.crt ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout jenkins/ssl/jenkins.key \
            -out jenkins/ssl/jenkins.crt \
            -subj "/C=US/ST=State/L=City/O=SecureFlow/CN=jenkins.secureflow.com"
        
        print_status "SSL certificates generated ✅"
    else
        print_warning "SSL certificates already exist, skipping generation"
    fi
}

# Create nginx configuration
create_nginx_config() {
    print_status "Creating nginx configuration..."
    
    cat > jenkins/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream jenkins {
        server jenkins:8080;
    }

    upstream sonarqube {
        server sonarqube:9000;
    }

    server {
        listen 80;
        server_name jenkins.secureflow.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name jenkins.secureflow.com;

        ssl_certificate /etc/nginx/ssl/jenkins.crt;
        ssl_certificate_key /etc/nginx/ssl/jenkins.key;

        location / {
            proxy_pass http://jenkins;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }
    }

    server {
        listen 80;
        server_name sonar.secureflow.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name sonar.secureflow.com;

        ssl_certificate /etc/nginx/ssl/jenkins.crt;
        ssl_certificate_key /etc/nginx/ssl/jenkins.key;

        location / {
            proxy_pass http://sonarqube;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }
    }
}
EOF
    
    print_status "Nginx configuration created ✅"
}

# Create prometheus configuration
create_prometheus_config() {
    print_status "Creating prometheus configuration..."
    
    cat > jenkins/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'jenkins'
    static_configs:
      - targets: ['jenkins:8080']
    metrics_path: '/prometheus'
    
  - job_name: 'sonarqube'
    static_configs:
      - targets: ['sonarqube:9000']
    metrics_path: '/api/monitoring/metrics'
    
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF
    
    print_status "Prometheus configuration created ✅"
}

# Validate Jenkins configuration
validate_jenkins_config() {
    print_status "Validating Jenkins configuration..."
    
    if [ -f jenkins/jenkins.yaml ]; then
        print_status "Jenkins configuration file exists ✅"
    else
        print_error "Jenkins configuration file missing!"
        exit 1
    fi
    
    if [ -f jenkins/plugins.txt ]; then
        print_status "Jenkins plugins file exists ✅"
    else
        print_error "Jenkins plugins file missing!"
        exit 1
    fi
    
    if [ -f jenkins/.env.jenkins ]; then
        print_status "Jenkins environment file exists ✅"
    else
        print_error "Jenkins environment file missing!"
        exit 1
    fi
}

# Start Jenkins services
start_jenkins() {
    print_status "Starting Jenkins services..."
    
    # Pull latest images
    print_info "Pulling latest Docker images..."
    docker-compose -f jenkins/docker-compose.jenkins.yml pull
    
    # Start services
    print_info "Starting Jenkins services..."
    docker-compose -f jenkins/docker-compose.jenkins.yml up -d
    
    print_status "Jenkins services started ✅"
}

# Wait for Jenkins to be ready
wait_for_jenkins() {
    print_status "Waiting for Jenkins to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8080/login &> /dev/null; then
            print_status "Jenkins is ready ✅"
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts: Waiting for Jenkins..."
        sleep 10
        ((attempt++))
    done
    
    print_error "Jenkins did not start within expected time"
    exit 1
}

# Display Jenkins information
display_jenkins_info() {
    print_status "Jenkins setup completed successfully! 🎉"
    
    echo ""
    echo "=== Jenkins Information ==="
    echo "Jenkins URL: http://localhost:8080"
    echo "SonarQube URL: http://localhost:9000"
    echo "Grafana URL: http://localhost:3000"
    echo "Prometheus URL: http://localhost:9090"
    echo "Portainer URL: https://localhost:9443"
    echo ""
    echo "=== Default Credentials ==="
    echo "Jenkins: admin / (check initial admin password)"
    echo "SonarQube: admin / admin"
    echo "Grafana: admin / admin_password"
    echo ""
    echo "=== Initial Admin Password ==="
    echo "Run this command to get Jenkins initial admin password:"
    echo "docker exec secureflow-jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
    echo ""
    echo "=== Useful Commands ==="
    echo "View logs: npm run jenkins:logs"
    echo "Stop Jenkins: npm run jenkins:stop"
    echo "Start Jenkins: npm run jenkins:start"
    echo ""
    echo "=== Next Steps ==="
    echo "1. Open Jenkins at http://localhost:8080"
    echo "2. Enter the initial admin password"
    echo "3. Complete the setup wizard"
    echo "4. Configure credentials in Jenkins"
    echo "5. Create the SecureFlow-Automaton multibranch pipeline"
    echo ""
}

# Create Jenkins backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > jenkins/backup.sh << 'EOF'
#!/bin/bash

# Jenkins Backup Script
BACKUP_DIR="/var/jenkins_home/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="jenkins_backup_${TIMESTAMP}.tar.gz"

echo "Creating Jenkins backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude='workspace' \
    --exclude='builds/*/workspace' \
    --exclude='logs' \
    --exclude='cache' \
    /var/jenkins_home/

echo "Backup created: $BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 backups
find $BACKUP_DIR -name "jenkins_backup_*.tar.gz" -mtime +7 -delete

echo "Backup cleanup completed"
EOF
    
    chmod +x jenkins/backup.sh
    print_status "Backup script created ✅"
}

# Create monitoring script
create_monitoring_script() {
    print_status "Creating monitoring script..."
    
    cat > jenkins/monitor.sh << 'EOF'
#!/bin/bash

# Jenkins Monitoring Script
echo "=== Jenkins System Status ==="
docker-compose -f jenkins/docker-compose.jenkins.yml ps

echo ""
echo "=== Jenkins Disk Usage ==="
docker exec secureflow-jenkins df -h

echo ""
echo "=== Jenkins Memory Usage ==="
docker exec secureflow-jenkins free -h

echo ""
echo "=== Jenkins CPU Usage ==="
docker exec secureflow-jenkins top -bn1 | grep "Cpu(s)"

echo ""
echo "=== Jenkins Logs (last 20 lines) ==="
docker logs secureflow-jenkins --tail 20

echo ""
echo "=== Jenkins Health Check ==="
if curl -f http://localhost:8080/login &> /dev/null; then
    echo "✅ Jenkins is healthy"
else
    echo "❌ Jenkins is not responding"
fi
EOF
    
    chmod +x jenkins/monitor.sh
    print_status "Monitoring script created ✅"
}

# Main execution
main() {
    print_status "Starting Jenkins setup for SecureFlow Automaton..."
    
    check_requirements
    create_directories
    generate_ssl_certificates
    create_nginx_config
    create_prometheus_config
    validate_jenkins_config
    create_backup_script
    create_monitoring_script
    start_jenkins
    wait_for_jenkins
    display_jenkins_info
    
    print_status "Jenkins setup completed successfully! 🎉"
}

# Run main function
main "$@"
