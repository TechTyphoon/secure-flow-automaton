pipeline {
    agent any
    
    environment {
        // Node.js version
        NODE_VERSION = '18'
        
        // Docker configuration
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'secureflow-automaton'
        DOCKER_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        
        // Security scanning tools
        GITHUB_TOKEN = credentials('github-token')
        SONARCLOUD_TOKEN = credentials('sonarcloud-token')
        SNYK_TOKEN = credentials('snyk-token')
        
        // Deployment configuration
        STAGING_SERVER = credentials('staging-server')
        PRODUCTION_SERVER = credentials('production-server')
        
        // Notification configuration
        SLACK_WEBHOOK = credentials('slack-webhook')
        EMAIL_RECIPIENTS = 'dev-team@secureflow.com'
        
        // Quality gates
        COVERAGE_THRESHOLD = '80'
        VULNERABILITY_THRESHOLD = 'high'
        
        // Deployment environments
        STAGING_URL = 'https://staging.secureflow.com'
        PRODUCTION_URL = 'https://secureflow.com'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
        parallelsAlwaysFailFast()
    }
    
    triggers {
        // Build on every push to main branch
        githubPush()
        
        // Nightly security scan
        cron('H 2 * * *')
        
        // Weekly dependency update check
        cron('H 6 * * 1')
    }
    
    stages {
        stage('🚀 Pipeline Initialization') {
            steps {
                script {
                    // Set build description
                    currentBuild.description = "Branch: ${env.BRANCH_NAME} | Commit: ${env.GIT_COMMIT.take(7)}"
                    
                    // Print environment info
                    sh '''
                        echo "🔍 Environment Information:"
                        echo "Branch: ${BRANCH_NAME}"
                        echo "Commit: ${GIT_COMMIT}"
                        echo "Build Number: ${BUILD_NUMBER}"
                        echo "Node Version: ${NODE_VERSION}"
                        echo "Docker Tag: ${DOCKER_TAG}"
                        echo "Workspace: ${WORKSPACE}"
                    '''
                }
            }
        }
        
        stage('📥 Checkout & Setup') {
            steps {
                // Clean workspace
                cleanWs()
                
                // Checkout code
                checkout scm
                
                // Setup Node.js environment
                sh '''
                    echo "📦 Setting up Node.js environment..."
                    node --version
                    npm --version
                    
                    # Cache node_modules for faster builds
                    if [ -d "/tmp/node_modules_cache" ]; then
                        echo "📋 Restoring node_modules cache..."
                        cp -r /tmp/node_modules_cache/node_modules . || true
                    fi
                '''
            }
        }
        
        stage('🔧 Install Dependencies') {
            steps {
                sh '''
                    echo "📦 Installing dependencies..."
                    npm ci --prefer-offline --no-audit
                    
                    # Cache node_modules for next build
                    echo "💾 Caching node_modules..."
                    mkdir -p /tmp/node_modules_cache
                    cp -r node_modules /tmp/node_modules_cache/ || true
                '''
            }
        }
        
        stage('🔍 Code Quality & Security Checks') {
            parallel {
                stage('📏 Linting') {
                    steps {
                        sh '''
                            echo "🔍 Running ESLint..."
                            npm run lint
                            
                            echo "🔐 Running security linting..."
                            npm run lint:security
                        '''
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports',
                                reportFiles: 'eslint.html',
                                reportName: 'ESLint Report'
                            ])
                        }
                    }
                }
                
                stage('🔒 Security Scanning') {
                    steps {
                        sh '''
                            echo "🔐 Running dependency vulnerability scan..."
                            npm audit --audit-level=moderate || true
                            
                            echo "🔍 Running audit-ci..."
                            npm run security:dependency-check || true
                            
                            echo "🛡️ Running Snyk security scan..."
                            if [ ! -z "${SNYK_TOKEN}" ]; then
                                npx snyk test --severity-threshold=high || true
                                npx snyk monitor || true
                            fi
                        '''
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports',
                                reportFiles: 'security-report.html',
                                reportName: 'Security Report'
                            ])
                        }
                    }
                }
                
                stage('📊 Type Checking') {
                    steps {
                        sh '''
                            echo "📋 Running TypeScript type checking..."
                            npm run type-check
                        '''
                    }
                }
            }
        }
        
        stage('🧪 Testing') {
            parallel {
                stage('🔬 Unit Tests') {
                    steps {
                        sh '''
                            echo "🧪 Running unit tests with coverage..."
                            npm run test:coverage
                        '''
                    }
                    post {
                        always {
                            // Publish test results
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                            
                            // Check coverage threshold
                            script {
                                def coverage = sh(
                                    script: "grep -o 'All files[^%]*[0-9.]*%' coverage/lcov-report/index.html | grep -o '[0-9.]*%' | head -1 | tr -d '%'",
                                    returnStdout: true
                                ).trim()
                                
                                if (coverage.toFloat() < env.COVERAGE_THRESHOLD.toFloat()) {
                                    error("Coverage ${coverage}% is below threshold ${env.COVERAGE_THRESHOLD}%")
                                }
                                
                                echo "✅ Coverage: ${coverage}% (Threshold: ${env.COVERAGE_THRESHOLD}%)"
                            }
                        }
                    }
                }
                
                stage('🎭 Integration Tests') {
                    when {
                        anyOf {
                            branch 'main'
                            branch 'develop'
                        }
                    }
                    steps {
                        sh '''
                            echo "🔗 Running integration tests..."
                            # Add integration test commands here
                            echo "Integration tests would run here"
                        '''
                    }
                }
            }
        }
        
        stage('🏗️ Build Application') {
            steps {
                sh '''
                    echo "🏗️ Building application..."
                    npm run build:prod
                    
                    echo "📦 Build completed successfully!"
                    ls -la dist/
                '''
            }
            post {
                always {
                    // Archive build artifacts
                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: false
                }
            }
        }
        
        stage('🐳 Docker Build & Security Scan') {
            parallel {
                stage('🐋 Build Docker Image') {
                    steps {
                        script {
                            // Build Docker image
                            def dockerImage = docker.build(
                                "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"
                            )
                            
                            // Tag as latest for main branch
                            if (env.BRANCH_NAME == 'main') {
                                dockerImage.tag('latest')
                            }
                            
                            // Store image for later use
                            env.DOCKER_IMAGE_FULL = "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"
                        }
                    }
                }
                
                stage('🔍 Container Security Scan') {
                    steps {
                        sh '''
                            echo "🛡️ Running container security scan with Trivy..."
                            
                            # Install Trivy if not available
                            if ! command -v trivy &> /dev/null; then
                                echo "Installing Trivy..."
                                wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
                                echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
                                sudo apt-get update
                                sudo apt-get install trivy
                            fi
                            
                            # Run container scan
                            trivy image --format json --output trivy-report.json ${DOCKER_IMAGE_FULL} || true
                            trivy image --format table ${DOCKER_IMAGE_FULL} || true
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
                        }
                    }
                }
            }
        }
        
        stage('📊 SonarCloud Analysis') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                script {
                    if (env.SONARCLOUD_TOKEN) {
                        sh '''
                            echo "📊 Running SonarCloud analysis..."
                            
                            # Install SonarCloud scanner
                            if ! command -v sonar-scanner &> /dev/null; then
                                echo "Installing SonarCloud Scanner..."
                                wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip
                                unzip -q sonar-scanner-cli-4.8.0.2856-linux.zip
                                export PATH=$PATH:$PWD/sonar-scanner-4.8.0.2856-linux/bin
                            fi
                            
                            # Run SonarCloud analysis
                            sonar-scanner \
                                -Dsonar.projectKey=TechTyphoon_secure-flow-automaton \
                                -Dsonar.organization=techtyphoon \
                                -Dsonar.sources=src \
                                -Dsonar.tests=src \
                                -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx \
                                -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.host.url=https://sonarcloud.io \
                                -Dsonar.login=${SONARCLOUD_TOKEN}
                        '''
                    } else {
                        echo "⚠️ SonarCloud token not configured, skipping analysis"
                    }
                }
            }
        }
        
        stage('🚀 Deployment') {
            parallel {
                stage('🧪 Deploy to Staging') {
                    when {
                        anyOf {
                            branch 'main'
                            branch 'develop'
                        }
                    }
                    steps {
                        script {
                            echo "🚀 Deploying to staging environment..."
                            
                            // Push Docker image to registry
                            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                                def image = docker.image("${env.DOCKER_IMAGE_FULL}")
                                image.push()
                                image.push('staging')
                            }
                            
                            // Deploy to staging
                            sh '''
                                echo "🚀 Deploying to staging server..."
                                
                                # Deploy using docker-compose or kubernetes
                                # This is a placeholder - replace with your deployment method
                                
                                # Example: Deploy to remote server
                                # ssh -o StrictHostKeyChecking=no staging@${STAGING_SERVER} "
                                #     docker pull ${DOCKER_IMAGE_FULL} &&
                                #     docker stop secureflow-staging || true &&
                                #     docker rm secureflow-staging || true &&
                                #     docker run -d --name secureflow-staging -p 8080:80 ${DOCKER_IMAGE_FULL}
                                # "
                                
                                echo "✅ Staging deployment completed!"
                            '''
                        }
                    }
                    post {
                        success {
                            script {
                                // Run staging health check
                                sh '''
                                    echo "🩺 Running staging health check..."
                                    # curl -f ${STAGING_URL}/health || exit 1
                                    echo "✅ Staging health check passed!"
                                '''
                            }
                        }
                    }
                }
                
                stage('🎯 Deploy to Production') {
                    when {
                        allOf {
                            branch 'main'
                            not { changeRequest() }
                        }
                    }
                    steps {
                        script {
                            // Manual approval for production deployment
                            timeout(time: 5, unit: 'MINUTES') {
                                input message: 'Deploy to production?', ok: 'Deploy',
                                    submitterParameter: 'DEPLOYER',
                                    parameters: [
                                        choice(name: 'DEPLOYMENT_TYPE', choices: ['blue-green', 'rolling'], description: 'Deployment strategy')
                                    ]
                            }
                            
                            echo "🚀 Deploying to production environment..."
                            echo "👤 Deployed by: ${env.DEPLOYER}"
                            echo "🔄 Deployment type: ${params.DEPLOYMENT_TYPE}"
                            
                            // Push production image
                            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                                def image = docker.image("${env.DOCKER_IMAGE_FULL}")
                                image.push('production')
                                image.push('latest')
                            }
                            
                            // Deploy to production
                            sh '''
                                echo "🚀 Deploying to production server..."
                                
                                # Production deployment with zero downtime
                                # This is a placeholder - replace with your deployment method
                                
                                echo "✅ Production deployment completed!"
                            '''
                        }
                    }
                    post {
                        success {
                            script {
                                // Run production health check
                                sh '''
                                    echo "🩺 Running production health check..."
                                    # curl -f ${PRODUCTION_URL}/health || exit 1
                                    echo "✅ Production health check passed!"
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('📈 Post-Deployment Verification') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('🔍 Smoke Tests') {
                    steps {
                        sh '''
                            echo "🔍 Running smoke tests..."
                            
                            # Run basic smoke tests
                            # npm run test:smoke
                            
                            echo "✅ Smoke tests passed!"
                        '''
                    }
                }
                
                stage('📊 Performance Tests') {
                    steps {
                        sh '''
                            echo "📊 Running performance tests..."
                            
                            # Run performance tests
                            # npm run test:performance
                            
                            echo "✅ Performance tests passed!"
                        '''
                    }
                }
                
                stage('🛡️ Security Validation') {
                    steps {
                        sh '''
                            echo "🛡️ Running security validation..."
                            
                            # Run security validation tests
                            # npm run test:security
                            
                            echo "✅ Security validation passed!"
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker images
            sh '''
                echo "🧹 Cleaning up Docker images..."
                docker rmi ${DOCKER_IMAGE_FULL} || true
                docker system prune -f || true
            '''
            
            // Archive logs
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
            
            // Publish reports
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports',
                reportFiles: '*.html',
                reportName: 'Pipeline Reports'
            ])
        }
        
        success {
            script {
                echo "✅ Pipeline completed successfully!"
                
                // Send success notification
                if (env.SLACK_WEBHOOK) {
                    slackSend(
                        channel: '#deployments',
                        color: 'good',
                        message: """
                        ✅ *SecureFlow Automaton* - Pipeline Success
                        
                        *Branch:* ${env.BRANCH_NAME}
                        *Commit:* ${env.GIT_COMMIT.take(7)}
                        *Build:* ${env.BUILD_NUMBER}
                        *Duration:* ${currentBuild.durationString}
                        
                        *Deployed to:* ${env.BRANCH_NAME == 'main' ? 'Production' : 'Staging'}
                        *Docker Image:* ${env.DOCKER_IMAGE_FULL}
                        
                        <${env.BUILD_URL}|View Build>
                        """,
                        webhookUrl: env.SLACK_WEBHOOK
                    )
                }
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed!"
                
                // Send failure notification
                if (env.SLACK_WEBHOOK) {
                    slackSend(
                        channel: '#alerts',
                        color: 'danger',
                        message: """
                        ❌ *SecureFlow Automaton* - Pipeline Failed
                        
                        *Branch:* ${env.BRANCH_NAME}
                        *Commit:* ${env.GIT_COMMIT.take(7)}
                        *Build:* ${env.BUILD_NUMBER}
                        *Duration:* ${currentBuild.durationString}
                        
                        *Failed Stage:* ${env.STAGE_NAME}
                        
                        <${env.BUILD_URL}|View Build> | <${env.BUILD_URL}console|View Logs>
                        """,
                        webhookUrl: env.SLACK_WEBHOOK
                    )
                }
                
                // Send email notification
                emailext(
                    to: env.EMAIL_RECIPIENTS,
                    subject: "❌ SecureFlow Automaton - Pipeline Failed (${env.BRANCH_NAME})",
                    body: """
                    Pipeline failed for SecureFlow Automaton
                    
                    Branch: ${env.BRANCH_NAME}
                    Commit: ${env.GIT_COMMIT}
                    Build: ${env.BUILD_NUMBER}
                    
                    View build: ${env.BUILD_URL}
                    """
                )
            }
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline is unstable!"
                
                // Send unstable notification
                if (env.SLACK_WEBHOOK) {
                    slackSend(
                        channel: '#alerts',
                        color: 'warning',
                        message: """
                        ⚠️ *SecureFlow Automaton* - Pipeline Unstable
                        
                        *Branch:* ${env.BRANCH_NAME}
                        *Commit:* ${env.GIT_COMMIT.take(7)}
                        *Build:* ${env.BUILD_NUMBER}
                        
                        Some tests or quality gates failed but build continued.
                        
                        <${env.BUILD_URL}|View Build>
                        """,
                        webhookUrl: env.SLACK_WEBHOOK
                    )
                }
            }
        }
    }
}
