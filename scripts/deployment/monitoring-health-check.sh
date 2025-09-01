#!/bin/bash

# Monitoring Health Check Script
# Performs comprehensive health checks on the monitoring infrastructure

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.monitoring.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Health check results
HEALTH_RESULTS=()
OVERALL_STATUS="healthy"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    HEALTH_RESULTS+=("$1")
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    HEALTH_RESULTS+=("$1")
    if [ "$OVERALL_STATUS" = "healthy" ]; then
        OVERALL_STATUS="warning"
    fi
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    HEALTH_RESULTS+=("$1")
    OVERALL_STATUS="unhealthy"
}

# Check Docker services
check_docker_services() {
    log_info "Checking Docker services..."

    cd "$PROJECT_ROOT"

    # Check if docker-compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        return 1
    fi

    # Get service status
    if command -v docker-compose &> /dev/null; then
        SERVICES_STATUS=$(docker-compose -f "$COMPOSE_FILE" ps --format json)
    else
        SERVICES_STATUS=$(docker compose -f "$COMPOSE_FILE" ps --format json)
    fi

    # Parse and check each service
    echo "$SERVICES_STATUS" | jq -r '.[] | "\(.Service) \(.State)"' 2>/dev/null | while read -r service state; do
        case $state in
            "running")
                log_success "Service $service is running"
                ;;
            "exited"|"stopped")
                log_error "Service $service is stopped"
                ;;
            *)
                log_warning "Service $service is in unknown state: $state"
                ;;
        esac
    done
}

# Check service endpoints
check_service_endpoints() {
    log_info "Checking service endpoints..."

    # Define services and their health endpoints
    declare -A services=(
        ["API Monitoring"]="http://localhost:3002/health"
        ["Prometheus"]="http://localhost:9090/-/healthy"
        ["Grafana"]="http://localhost:3000/api/health"
        ["Alertmanager"]="http://localhost:9093/-/healthy"
        ["Node Exporter"]="http://localhost:9100/metrics"
    )

    for service in "${!services[@]}"; do
        endpoint=${services[$service]}

        if curl -f -s --max-time 10 "$endpoint" > /dev/null 2>&1; then
            log_success "$service endpoint is healthy"
        else
            log_error "$service endpoint is not responding"
        fi
    done
}

# Check resource usage
check_resource_usage() {
    log_info "Checking resource usage..."

    # Check Docker stats
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        # Get container stats
        containers=$(docker ps --filter "label=com.docker.compose.project=secureflow-automaton" --format "{{.Names}}")

        if [ -n "$containers" ]; then
            log_info "Found monitoring containers: $containers"

            # Check memory usage
            for container in $containers; do
                mem_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemPerc}}" | grep "$container" | awk '{print $3}')
                if [ -n "$mem_usage" ]; then
                    mem_percent=$(echo "$mem_usage" | sed 's/%//')
                    if (( $(echo "$mem_percent > 80" | bc -l 2>/dev/null || echo "0") )); then
                        log_warning "Container $container memory usage is high: $mem_usage"
                    else
                        log_success "Container $container memory usage: $mem_usage"
                    fi
                fi
            done
        else
            log_warning "No monitoring containers found"
        fi
    else
        log_warning "Docker not available for resource checking"
    fi
}

# Check monitoring data collection
check_monitoring_data() {
    log_info "Checking monitoring data collection..."

    # Check if metrics are being collected
    if curl -f -s "http://localhost:3002/api/metrics" > /dev/null 2>&1; then
        # Get metrics data
        metrics=$(curl -s "http://localhost:3002/api/metrics" 2>/dev/null)

        if [ -n "$metrics" ] && [ "$metrics" != "{}" ]; then
            log_success "Monitoring data collection is active"

            # Check if metrics have recent timestamps
            latest_timestamp=$(echo "$metrics" | jq -r '.timestamp // empty' 2>/dev/null)
            if [ -n "$latest_timestamp" ]; then
                current_time=$(date +%s)
                metrics_time=$(date -d "$latest_timestamp" +%s 2>/dev/null || echo "0")
                time_diff=$((current_time - metrics_time))

                if [ $time_diff -gt 300 ]; then # 5 minutes
                    log_warning "Metrics data is stale (last update: $latest_timestamp)"
                else
                    log_success "Metrics data is current"
                fi
            fi
        else
            log_warning "Monitoring data collection is running but no data available yet"
        fi
    else
        log_error "Monitoring data collection is not accessible"
    fi
}

# Check network connectivity
check_network_connectivity() {
    log_info "Checking network connectivity..."

    # Check if services can communicate
    if curl -f -s "http://localhost:3002/api/metrics" > /dev/null 2>&1; then
        # Test internal API calls
        if curl -f -s "http://localhost:3002/api/performance" > /dev/null 2>&1; then
            log_success "Internal service communication is working"
        else
            log_warning "Internal service communication may have issues"
        fi
    fi

    # Check external connectivity (optional)
    if curl -f -s --max-time 5 "https://httpbin.org/status/200" > /dev/null 2>&1; then
        log_success "External network connectivity is working"
    else
        log_warning "External network connectivity may be limited"
    fi
}

# Check disk space
check_disk_space() {
    log_info "Checking disk space..."

    # Check available disk space
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$disk_usage" -gt 90 ]; then
        log_error "Disk space is critically low: ${disk_usage}% used"
    elif [ "$disk_usage" -gt 80 ]; then
        log_warning "Disk space is getting low: ${disk_usage}% used"
    else
        log_success "Disk space usage is normal: ${disk_usage}% used"
    fi

    # Check Docker volume usage
    if command -v docker &> /dev/null; then
        volumes=$(docker volume ls --filter "name=secureflow" --format "{{.Name}}")
        for volume in $volumes; do
            volume_size=$(docker system df -v | grep "$volume" | awk '{print $3}' 2>/dev/null || echo "unknown")
            if [ "$volume_size" != "unknown" ]; then
                log_info "Volume $volume usage: $volume_size"
            fi
        done
    fi
}

# Generate health report
generate_health_report() {
    log_info "Generating health report..."

    report_file="$PROJECT_ROOT/monitoring-health-report-$(date +%Y%m%d-%H%M%S).json"

    cat > "$report_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "overall_status": "$OVERALL_STATUS",
    "hostname": "$(hostname)",
    "services_checked": $(echo "${#services[@]}" 2>/dev/null || echo "0"),
    "results": [
$(printf '        "%s",\n' "${HEALTH_RESULTS[@]}" | sed '$ s/,$//')
    ],
    "system_info": {
        "docker_version": "$(docker --version 2>/dev/null || echo 'not available')",
        "docker_compose_version": "$(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null || echo 'not available')",
        "disk_usage": "$(df / | tail -1 | awk '{print $5}')",
        "memory_usage": "$(free -h | grep '^Mem:' | awk '{print $3 \"/\" $2}')"
    },
    "recommendations": $(generate_recommendations)
}
EOF

    log_success "Health report generated: $report_file"
}

# Generate recommendations based on health check results
generate_recommendations() {
    recommendations=()

    # Check for common issues and provide recommendations
    if echo "${HEALTH_RESULTS[@]}" | grep -q "not responding\|not accessible"; then
        recommendations+=("Check if all Docker containers are running: docker-compose -f docker-compose.monitoring.yml ps")
        recommendations+=("Restart failed services: docker-compose -f docker-compose.monitoring.yml restart")
        recommendations+=("Check service logs: docker-compose -f docker-compose.monitoring.yml logs")
    fi

    if echo "${HEALTH_RESULTS[@]}" | grep -q "memory usage is high"; then
        recommendations+=("Monitor memory usage trends in Grafana dashboard")
        recommendations+=("Consider increasing memory limits for containers")
        recommendations+=("Check for memory leaks in application code")
    fi

    if echo "${HEALTH_RESULTS[@]}" | grep -q "stale\|no data"; then
        recommendations+=("Verify metrics collection is working properly")
        recommendations+=("Check API server connectivity")
        recommendations+=("Restart monitoring services if needed")
    fi

    if [ ${#recommendations[@]} -eq 0 ]; then
        recommendations+=("All systems are operating normally")
    fi

    # Convert to JSON format
    json_recommendations=""
    for rec in "${recommendations[@]}"; do
        json_recommendations="$json_recommendations\"$rec\","
    done
    json_recommendations="[${json_recommendations%,}]"

    echo "$json_recommendations"
}

# Display summary
display_summary() {
    echo ""
    echo "📊 Monitoring Health Check Summary"
    echo "=================================="

    case $OVERALL_STATUS in
        "healthy")
            echo -e "${GREEN}✅ Overall Status: HEALTHY${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  Overall Status: WARNING${NC}"
            ;;
        "unhealthy")
            echo -e "${RED}❌ Overall Status: UNHEALTHY${NC}"
            ;;
    esac

    echo ""
    echo "📋 Detailed Results:"
    for result in "${HEALTH_RESULTS[@]}"; do
        echo "  $result"
    done

    echo ""
    echo "🔧 Quick Actions:"
    echo "  View logs:     docker-compose -f docker-compose.monitoring.yml logs -f"
    echo "  Restart all:   docker-compose -f docker-compose.monitoring.yml restart"
    echo "  Stop all:      docker-compose -f docker-compose.monitoring.yml down"
    echo "  Start all:     docker-compose -f docker-compose.monitoring.yml up -d"
}

# Main function
main() {
    echo "🔍 SecureFlow Monitoring Health Check"
    echo "====================================="

    # Run all health checks
    check_docker_services
    check_service_endpoints
    check_resource_usage
    check_monitoring_data
    check_network_connectivity
    check_disk_space

    # Generate report and display summary
    generate_health_report
    display_summary

    # Exit with appropriate code
    case $OVERALL_STATUS in
        "healthy")
            exit 0
            ;;
        "warning")
            exit 1
            ;;
        "unhealthy")
            exit 2
            ;;
    esac
}

# Run main function
main "$@"
