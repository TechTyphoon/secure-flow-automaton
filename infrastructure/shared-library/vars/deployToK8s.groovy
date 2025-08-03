#!/usr/bin/env groovy

/**
 * Kubernetes Deployment Pipeline Function
 * 
 * Deploys SecureFlow Automaton to Kubernetes cluster with security best practices
 * 
 * @param config Deployment configuration
 */
def call(Map config = [:]) {
    
    // Default configuration
    def defaultConfig = [
        namespace: 'secureflow',
        replicas: 3,
        image: 'secureflow-automaton',
        tag: 'latest',
        resources: [
            requests: [
                cpu: '100m',
                memory: '128Mi'
            ],
            limits: [
                cpu: '500m',
                memory: '512Mi'
            ]
        ],
        healthCheck: [
            enabled: true,
            path: '/health',
            initialDelay: 30,
            timeout: 5
        ],
        ingress: [
            enabled: true,
            hostname: 'secureflow.com',
            tls: true
        ],
        security: [
            runAsNonRoot: true,
            readOnlyRootFilesystem: true,
            allowPrivilegeEscalation: false
        ]
    ]
    
    // Merge configurations
    config = defaultConfig + config
    
    stage('🚀 Kubernetes Deployment') {
        steps {
            script {
                echo "🚀 Starting Kubernetes deployment..."
                
                // Create namespace if it doesn't exist
                sh """
                    kubectl create namespace ${config.namespace} --dry-run=client -o yaml | kubectl apply -f -
                """
                
                // Apply security policies
                applySecurityPolicies(config)
                
                // Deploy application
                deployApplication(config)
                
                // Wait for rollout to complete
                sh """
                    kubectl rollout status deployment/secureflow-automaton -n ${config.namespace} --timeout=300s
                """
                
                // Run health checks
                runHealthChecks(config)
                
                echo "✅ Kubernetes deployment completed successfully!"
            }
        }
    }
}

def applySecurityPolicies(config) {
    echo "🔒 Applying security policies..."
    
    // Create NetworkPolicy
    writeFile file: 'k8s-network-policy.yaml', text: """
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: secureflow-network-policy
  namespace: ${config.namespace}
spec:
  podSelector:
    matchLabels:
      app: secureflow-automaton
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
"""
    
    // Create PodSecurityPolicy
    writeFile file: 'k8s-pod-security-policy.yaml', text: """
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: secureflow-psp
  namespace: ${config.namespace}
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
"""
    
    // Apply policies
    sh """
        kubectl apply -f k8s-network-policy.yaml
        kubectl apply -f k8s-pod-security-policy.yaml
    """
}

def deployApplication(config) {
    echo "🚀 Deploying application to Kubernetes..."
    
    // Create deployment manifest
    writeFile file: 'k8s-deployment.yaml', text: """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secureflow-automaton
  namespace: ${config.namespace}
  labels:
    app: secureflow-automaton
    version: ${config.tag}
spec:
  replicas: ${config.replicas}
  selector:
    matchLabels:
      app: secureflow-automaton
  template:
    metadata:
      labels:
        app: secureflow-automaton
        version: ${config.tag}
    spec:
      securityContext:
        runAsNonRoot: ${config.security.runAsNonRoot}
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: secureflow-automaton
        image: ${config.image}:${config.tag}
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: ${config.resources.requests.cpu}
            memory: ${config.resources.requests.memory}
          limits:
            cpu: ${config.resources.limits.cpu}
            memory: ${config.resources.limits.memory}
        securityContext:
          allowPrivilegeEscalation: ${config.security.allowPrivilegeEscalation}
          readOnlyRootFilesystem: ${config.security.readOnlyRootFilesystem}
          runAsNonRoot: ${config.security.runAsNonRoot}
          capabilities:
            drop:
            - ALL
        livenessProbe:
          httpGet:
            path: ${config.healthCheck.path}
            port: 8080
          initialDelaySeconds: ${config.healthCheck.initialDelay}
          timeoutSeconds: ${config.healthCheck.timeout}
        readinessProbe:
          httpGet:
            path: ${config.healthCheck.path}
            port: 8080
          initialDelaySeconds: ${config.healthCheck.initialDelay}
          timeoutSeconds: ${config.healthCheck.timeout}
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8080"
        volumeMounts:
        - name: tmp-volume
          mountPath: /tmp
        - name: var-cache-volume
          mountPath: /var/cache
      volumes:
      - name: tmp-volume
        emptyDir: {}
      - name: var-cache-volume
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: secureflow-automaton-service
  namespace: ${config.namespace}
  labels:
    app: secureflow-automaton
spec:
  selector:
    app: secureflow-automaton
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
"""
    
    // Create ingress if enabled
    if (config.ingress.enabled) {
        writeFile file: 'k8s-ingress.yaml', text: """
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secureflow-automaton-ingress
  namespace: ${config.namespace}
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/secure-backends: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
spec:
  tls:
  - hosts:
    - ${config.ingress.hostname}
    secretName: secureflow-tls
  rules:
  - host: ${config.ingress.hostname}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: secureflow-automaton-service
            port:
              number: 80
"""
    }
    
    // Apply manifests
    sh """
        kubectl apply -f k8s-deployment.yaml
        ${config.ingress.enabled ? 'kubectl apply -f k8s-ingress.yaml' : ''}
    """
}

def runHealthChecks(config) {
    echo "🩺 Running health checks..."
    
    // Wait for pods to be ready
    sh """
        kubectl wait --for=condition=ready pod -l app=secureflow-automaton -n ${config.namespace} --timeout=300s
    """
    
    // Check deployment status
    sh """
        kubectl get deployment secureflow-automaton -n ${config.namespace}
        kubectl get pods -l app=secureflow-automaton -n ${config.namespace}
        kubectl get service secureflow-automaton-service -n ${config.namespace}
    """
    
    // Test service connectivity
    sh """
        kubectl run test-pod --rm -i --restart=Never --image=curlimages/curl -- curl -f http://secureflow-automaton-service.${config.namespace}.svc.cluster.local${config.healthCheck.path}
    """
    
    echo "✅ Health checks completed successfully!"
}
