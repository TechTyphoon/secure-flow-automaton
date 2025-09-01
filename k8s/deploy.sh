#!/bin/bash

# SecureFlow Automaton Kubernetes Deployment Script
# This script provides an easy way to deploy SecureFlow Automaton to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="secureflow-automaton"
ENVIRONMENT="prod"
HELM_RELEASE_NAME="secureflow"
HELM_CHART_PATH="./helm/secureflow-automaton"

# Functions
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi

    # Check helm
    if ! command -v helm &> /dev/null; then
        log_error "Helm is not installed. Please install Helm first."
        exit 1
    fi

    # Check kubectl connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace: $NAMESPACE"
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    log_success "Namespace created"
}

# Setup secrets
setup_secrets() {
    log_info "Setting up secrets..."

    # Check if secrets already exist
    if kubectl get secret secureflow-secrets -n $NAMESPACE &> /dev/null; then
        log_warning "Secrets already exist. Skipping secret creation."
        return
    fi

    # Prompt for required secrets
    echo "Please provide the following secrets:"
    read -p "SonarQube Token: " SONAR_TOKEN
    read -p "Snyk Token: " SNYK_TOKEN
    read -p "JWT Secret: " JWT_SECRET
    read -p "Session Secret: " SESSION_SECRET
    read -p "Encryption Key: " ENCRYPTION_KEY

    # Create secrets
    kubectl create secret generic secureflow-secrets \
        --from-literal=sonar-token="$SONAR_TOKEN" \
        --from-literal=snyk-token="$SNYK_TOKEN" \
        --from-literal=jwt-secret="$JWT_SECRET" \
        --from-literal=session-secret="$SESSION_SECRET" \
        --from-literal=encryption-key="$ENCRYPTION_KEY" \
        --from-literal=api-encryption-key="$ENCRYPTION_KEY" \
        --namespace=$NAMESPACE

    log_success "Secrets created"
}

# Deploy using Helm
deploy_helm() {
    log_info "Deploying using Helm..."

    # Check if release already exists
    if helm list -n $NAMESPACE | grep -q $HELM_RELEASE_NAME; then
        log_info "Release exists. Upgrading..."
        helm upgrade $HELM_RELEASE_NAME $HELM_CHART_PATH \
            --namespace=$NAMESPACE \
            --values=$HELM_CHART_PATH/values.yaml \
            --set environment=$ENVIRONMENT
    else
        log_info "Installing new release..."
        helm install $HELM_RELEASE_NAME $HELM_CHART_PATH \
            --namespace=$NAMESPACE \
            --values=$HELM_CHART_PATH/values.yaml \
            --set environment=$ENVIRONMENT \
            --create-namespace
    fi

    log_success "Helm deployment completed"
}

# Deploy using Kustomize
deploy_kustomize() {
    log_info "Deploying using Kustomize..."

    case $ENVIRONMENT in
        dev)
            KUSTOMIZE_PATH="k8s/overlays/dev"
            ;;
        staging)
            KUSTOMIZE_PATH="k8s/overlays/staging"
            ;;
        prod)
            KUSTOMIZE_PATH="k8s/overlays/prod"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac

    kubectl apply -k $KUSTOMIZE_PATH
    log_success "Kustomize deployment completed"
}

# Wait for deployment
wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."

    # Wait for deployment to be available
    kubectl wait --for=condition=available --timeout=300s deployment/secureflow-automaton -n $NAMESPACE

    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=secureflow-automaton -n $NAMESPACE --timeout=300s

    log_success "Deployment is ready"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"

    echo ""
    echo "=== Pods ==="
    kubectl get pods -n $NAMESPACE

    echo ""
    echo "=== Services ==="
    kubectl get services -n $NAMESPACE

    echo ""
    echo "=== Ingress ==="
    kubectl get ingress -n $NAMESPACE

    echo ""
    echo "=== HPA ==="
    kubectl get hpa -n $NAMESPACE

    echo ""
    echo "=== PVC ==="
    kubectl get pvc -n $NAMESPACE

    # Get service URL
    SERVICE_IP=$(kubectl get svc secureflow-automaton -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ -n "$SERVICE_IP" ]; then
        log_success "Application URL: http://$SERVICE_IP"
    fi

    INGRESS_HOST=$(kubectl get ingress secureflow-automaton -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)
    if [ -n "$INGRESS_HOST" ]; then
        log_success "Application URL: https://$INGRESS_HOST"
    fi
}

# Main menu
show_menu() {
    echo "========================================"
    echo " SecureFlow Automaton Deployment Tool"
    echo "========================================"
    echo "1. Deploy using Helm (Recommended)"
    echo "2. Deploy using Kustomize"
    echo "3. Setup secrets only"
    echo "4. Show deployment status"
    echo "5. Delete deployment"
    echo "6. Exit"
    echo "========================================"
}

# Delete deployment
delete_deployment() {
    log_warning "This will delete the entire deployment!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deleting deployment..."
        helm uninstall $HELM_RELEASE_NAME -n $NAMESPACE 2>/dev/null || true
        kubectl delete namespace $NAMESPACE --ignore-not-found=true
        log_success "Deployment deleted"
    fi
}

# Main function
main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --environment=*)
                ENVIRONMENT="${1#*=}"
                shift
                ;;
            --namespace=*)
                NAMESPACE="${1#*=}"
                shift
                ;;
            --method=*)
                DEPLOY_METHOD="${1#*=}"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    check_prerequisites

    while true; do
        show_menu
        read -p "Select option (1-6): " choice

        case $choice in
            1)
                create_namespace
                setup_secrets
                deploy_helm
                wait_for_deployment
                show_status
                break
                ;;
            2)
                create_namespace
                setup_secrets
                deploy_kustomize
                wait_for_deployment
                show_status
                break
                ;;
            3)
                create_namespace
                setup_secrets
                break
                ;;
            4)
                show_status
                ;;
            5)
                delete_deployment
                ;;
            6)
                log_info "Goodbye!"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please choose 1-6."
                ;;
        esac
    done

    log_success "Deployment completed successfully!"
    log_info "You can now access SecureFlow Automaton at the URL shown above."
}

# Run main function
main "$@"
