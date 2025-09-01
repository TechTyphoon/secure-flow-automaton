#!/bin/bash

# Monitoring Backup and Restore Script
# Handles backup and restore operations for monitoring data and configurations

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/monitoring"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="monitoring_backup_$TIMESTAMP"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
create_backup_directory() {
    log_info "Creating backup directory..."

    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/volumes"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/configs"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/databases"

    log_success "Backup directory created: $BACKUP_DIR/$BACKUP_NAME"
}

# Backup Docker volumes
backup_volumes() {
    log_info "Backing up Docker volumes..."

    cd "$PROJECT_ROOT"

    # List of volumes to backup
    volumes=(
        "secureflow-monitoring-logs"
        "secureflow-monitoring-data"
        "secureflow-prometheus-data"
        "secureflow-prometheus-config"
        "secureflow-grafana-data"
        "secureflow-grafana-config"
        "secureflow-grafana-logs"
        "secureflow-alertmanager-data"
    )

    for volume in "${volumes[@]}"; do
        if docker volume ls | grep -q "$volume"; then
            log_info "Backing up volume: $volume"

            # Create a temporary container to backup the volume
            container_name="backup_$volume"
            docker run --rm -d \
                --name "$container_name" \
                -v "$volume:/data" \
                -v "$BACKUP_DIR/$BACKUP_NAME/volumes:/backup" \
                alpine:latest \
                sh -c "tar czf /backup/${volume}.tar.gz -C /data ."

            # Wait for backup to complete
            docker wait "$container_name"

            if [ -f "$BACKUP_DIR/$BACKUP_NAME/volumes/${volume}.tar.gz" ]; then
                log_success "Volume $volume backed up successfully"
            else
                log_error "Failed to backup volume $volume"
            fi
        else
            log_warning "Volume $volume not found, skipping"
        fi
    done
}

# Backup configurations
backup_configurations() {
    log_info "Backing up configurations..."

    # Backup Docker Compose file
    if [ -f "$PROJECT_ROOT/docker-compose.monitoring.yml" ]; then
        cp "$PROJECT_ROOT/docker-compose.monitoring.yml" "$BACKUP_DIR/$BACKUP_NAME/configs/"
        log_success "Docker Compose configuration backed up"
    fi

    # Backup monitoring configurations
    if [ -d "$PROJECT_ROOT/docs/monitoring" ]; then
        cp -r "$PROJECT_ROOT/docs/monitoring" "$BACKUP_DIR/$BACKUP_NAME/configs/"
        log_success "Monitoring configurations backed up"
    fi

    # Backup environment file (if exists)
    if [ -f "$PROJECT_ROOT/.env.monitoring" ]; then
        cp "$PROJECT_ROOT/.env.monitoring" "$BACKUP_DIR/$BACKUP_NAME/configs/"
        log_success "Environment configuration backed up"
    fi

    # Backup deployment scripts
    if [ -d "$PROJECT_ROOT/scripts/deployment" ]; then
        cp -r "$PROJECT_ROOT/scripts/deployment" "$BACKUP_DIR/$BACKUP_NAME/configs/"
        log_success "Deployment scripts backed up"
    fi
}

# Backup Grafana dashboards
backup_grafana_dashboards() {
    log_info "Backing up Grafana dashboards..."

    # Check if Grafana is running
    if curl -f -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
        # Export dashboards via API
        dashboards=$(curl -s "http://localhost:3000/api/search?type=dash-db" | jq -r '.[].uid' 2>/dev/null || echo "")

        if [ -n "$dashboards" ]; then
            mkdir -p "$BACKUP_DIR/$BACKUP_NAME/grafana-dashboards"

            for uid in $dashboards; do
                log_info "Exporting dashboard: $uid"
                curl -s "http://localhost:3000/api/dashboards/uid/$uid" | jq '.' > "$BACKUP_DIR/$BACKUP_NAME/grafana-dashboards/${uid}.json"
            done

            log_success "Grafana dashboards backed up"
        else
            log_warning "No Grafana dashboards found to backup"
        fi
    else
        log_warning "Grafana is not running, skipping dashboard backup"
    fi
}

# Create backup manifest
create_backup_manifest() {
    log_info "Creating backup manifest..."

    manifest_file="$BACKUP_DIR/$BACKUP_NAME/manifest.json"

    # Get system information
    system_info=$(uname -a)
    docker_version=$(docker --version 2>/dev/null || echo "not available")
    docker_compose_version=$(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null || echo "not available")

    # Get file sizes
    volumes_size=$(du -sh "$BACKUP_DIR/$BACKUP_NAME/volumes" 2>/dev/null | cut -f1 || echo "0B")
    configs_size=$(du -sh "$BACKUP_DIR/$BACKUP_NAME/configs" 2>/dev/null | cut -f1 || echo "0B")
    grafana_size=$(du -sh "$BACKUP_DIR/$BACKUP_NAME/grafana-dashboards" 2>/dev/null | cut -f1 || echo "0B")

    cat > "$manifest_file" << EOF
{
    "backup_name": "$BACKUP_NAME",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "1.0",
    "system_info": {
        "hostname": "$(hostname)",
        "os": "$system_info",
        "docker_version": "$docker_version",
        "docker_compose_version": "$docker_compose_version"
    },
    "backup_contents": {
        "volumes": {
            "path": "volumes/",
            "size": "$volumes_size",
            "description": "Docker volumes containing persistent data"
        },
        "configurations": {
            "path": "configs/",
            "size": "$configs_size",
            "description": "Monitoring configuration files and scripts"
        },
        "grafana_dashboards": {
            "path": "grafana-dashboards/",
            "size": "$grafana_size",
            "description": "Grafana dashboard definitions"
        }
    },
    "services_backed_up": [
        "api-monitoring",
        "prometheus",
        "grafana",
        "alertmanager",
        "node-exporter"
    ],
    "restoration_instructions": [
        "Stop all monitoring services before restoration",
        "Restore volumes using the provided tar.gz files",
        "Restore configurations to appropriate locations",
        "Import Grafana dashboards via API or UI",
        "Start monitoring services after restoration"
    ]
}
EOF

    log_success "Backup manifest created: $manifest_file"
}

# Compress backup
compress_backup() {
    log_info "Compressing backup..."

    cd "$BACKUP_DIR"

    # Create compressed archive
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"

    # Calculate sizes
    archive_size=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
    uncompressed_size=$(du -sh "$BACKUP_NAME" | cut -f1)

    log_success "Backup compressed: ${BACKUP_NAME}.tar.gz (${archive_size})"
    log_info "Uncompressed size: ${uncompressed_size}"

    # Remove uncompressed directory
    rm -rf "$BACKUP_NAME"
    log_info "Uncompressed backup directory cleaned up"
}

# List available backups
list_backups() {
    log_info "Available backups:"

    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "No backup directory found"
        return
    fi

    backups=$(ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)

    if [ "$backups" -eq 0 ]; then
        log_warning "No backups found"
        return
    fi

    echo ""
    printf "%-30s %-10s %-15s\n" "BACKUP NAME" "SIZE" "CREATED"
    printf "%-30s %-10s %-15s\n" "------------------------------" "----------" "---------------"

    for backup in "$BACKUP_DIR"/*.tar.gz; do
        if [ -f "$backup" ]; then
            name=$(basename "$backup" .tar.gz)
            size=$(du -sh "$backup" | cut -f1)
            created=$(stat -c %y "$backup" | cut -d' ' -f1)
            printf "%-30s %-10s %-15s\n" "$name" "$size" "$created"
        fi
    done
}

# Restore backup
restore_backup() {
    backup_name="$1"

    if [ -z "$backup_name" ]; then
        log_error "Backup name is required for restoration"
        echo "Usage: $0 restore <backup_name>"
        exit 1
    fi

    backup_file="$BACKUP_DIR/${backup_name}.tar.gz"

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi

    log_info "Restoring backup: $backup_name"

    # Extract backup
    cd "$BACKUP_DIR"
    tar -xzf "${backup_name}.tar.gz"

    # Stop monitoring services
    log_info "Stopping monitoring services..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.monitoring.yml down || true

    # Restore volumes
    if [ -d "$BACKUP_DIR/$backup_name/volumes" ]; then
        log_info "Restoring volumes..."
        for volume_backup in "$BACKUP_DIR/$backup_name/volumes"/*.tar.gz; do
            if [ -f "$volume_backup" ]; then
                volume_name=$(basename "$volume_backup" .tar.gz)
                log_info "Restoring volume: $volume_name"

                # Create a temporary container to restore the volume
                container_name="restore_$volume_name"
                docker run --rm -d \
                    --name "$container_name" \
                    -v "$volume_name:/data" \
                    -v "$BACKUP_DIR/$backup_name/volumes:/backup" \
                    alpine:latest \
                    sh -c "tar xzf /backup/${volume_name}.tar.gz -C /data"

                docker wait "$container_name"
                log_success "Volume $volume_name restored"
            fi
        done
    fi

    # Restore configurations
    if [ -d "$BACKUP_DIR/$backup_name/configs" ]; then
        log_info "Restoring configurations..."
        cp -r "$BACKUP_DIR/$backup_name/configs"/* "$PROJECT_ROOT/" 2>/dev/null || true
        log_success "Configurations restored"
    fi

    # Clean up extracted backup
    rm -rf "$BACKUP_DIR/$backup_name"

    # Restart monitoring services
    log_info "Starting monitoring services..."
    docker-compose -f docker-compose.monitoring.yml up -d

    log_success "Backup restoration completed: $backup_name"
}

# Clean old backups
cleanup_old_backups() {
    retention_days="${1:-30}"

    log_info "Cleaning up backups older than $retention_days days..."

    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "No backup directory found"
        return
    fi

    # Find and remove old backups
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +"$retention_days" -delete

    log_success "Old backups cleaned up"
}

# Display usage information
usage() {
    echo "Monitoring Backup and Restore Script"
    echo "===================================="
    echo ""
    echo "Usage:"
    echo "  $0 backup              Create a new backup"
    echo "  $0 list                List available backups"
    echo "  $0 restore <name>      Restore a backup"
    echo "  $0 cleanup [days]      Clean up old backups (default: 30 days)"
    echo ""
    echo "Examples:"
    echo "  $0 backup              # Create backup with current timestamp"
    echo "  $0 list                # Show all available backups"
    echo "  $0 restore monitoring_backup_20240101_120000  # Restore specific backup"
    echo "  $0 cleanup 7           # Remove backups older than 7 days"
    echo ""
}

# Main function
main() {
    case "${1:-}" in
        "backup")
            echo "📦 Creating monitoring backup..."
            create_backup_directory
            backup_volumes
            backup_configurations
            backup_grafana_dashboards
            create_backup_manifest
            compress_backup
            log_success "Backup completed: $BACKUP_NAME"
            ;;
        "list")
            list_backups
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "cleanup")
            cleanup_old_backups "$2"
            ;;
        *)
            usage
            ;;
    esac
}

# Run main function
main "$@"
