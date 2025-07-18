# 🚀 Deployment Guide - SecureFlow Automaton

This guide provides comprehensive instructions for deploying SecureFlow Automaton in various environments.

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for containerized deployment)
- Git
- A Supabase project (for backend services)
- GitHub repository (for CI/CD integration)

## 🔧 Environment Configuration

### 1. Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# GitHub Integration
VITE_GITHUB_TOKEN=your-github-personal-access-token
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=your-repository-name

# Application Settings
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### 2. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Set up authentication** with email/password
3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```
4. **Configure Row Level Security (RLS)** policies
5. **Set up API keys** in your environment variables

### 3. GitHub Integration

1. **Create a Personal Access Token** with appropriate scopes:
   - `repo` - Full control of private repositories
   - `workflow` - Update GitHub Action workflows
   - `read:org` - Read organization membership

2. **Add the token** to your environment variables as `VITE_GITHUB_TOKEN`

## 🏗️ Deployment Options

### Option 1: Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8080
```

### Option 2: Docker Deployment

#### Development Environment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

#### Production Environment

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.prod.yml up -d --build
```

### Option 3: Static Site Deployment

#### Build for Production

```bash
# Build the application
npm run build

# The dist/ folder contains the built application
```

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Deploy to GitHub Pages

```bash
# Build the application
npm run build

# Deploy to GitHub Pages using gh-pages
npx gh-pages -d dist
```

### Option 4: Cloud Platform Deployment

#### AWS Deployment

1. **Create an S3 bucket** for static hosting
2. **Configure CloudFront** for CDN
3. **Set up Route 53** for custom domain
4. **Deploy using AWS CLI**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

#### Azure Deployment

1. **Create an Azure Static Web App**
2. **Configure GitHub Actions** for deployment
3. **Deploy using Azure CLI**:
   ```bash
   az staticwebapp create --name secureflow-automaton --resource-group your-resource-group --source https://github.com/your-username/secure-flow-automaton --branch main --location "East US 2"
   ```

#### Google Cloud Deployment

1. **Create a Google Cloud Storage bucket**
2. **Configure Cloud CDN**
3. **Deploy using gcloud CLI**:
   ```bash
   gsutil -m cp -r dist/* gs://your-bucket-name
   ```

## 🔒 Security Configuration

### 1. HTTPS Configuration

Ensure HTTPS is enabled in production:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Security Headers

Add security headers to your reverse proxy or hosting platform:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-project.supabase.co https://api.github.com;" always;
```

### 3. Environment Security

- **Never commit** `.env.local` or any files containing secrets
- **Use environment variables** for all sensitive configuration
- **Rotate API keys** regularly
- **Enable monitoring** for security events

## 📊 Monitoring and Logging

### 1. Application Monitoring

Configure monitoring for your deployed application:

```env
# Add to .env.local
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
```

### 2. Health Checks

Set up health check endpoints:

```bash
# Check application health
curl -f http://localhost:8080/health || exit 1
```

### 3. Log Configuration

Configure structured logging:

```javascript
// In your deployment configuration
const logger = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'simple'
};
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GITHUB_TOKEN: ${{ secrets.VITE_GITHUB_TOKEN }}
          VITE_GITHUB_OWNER: ${{ secrets.VITE_GITHUB_OWNER }}
          VITE_GITHUB_REPO: ${{ secrets.VITE_GITHUB_REPO }}
      
      - name: Deploy to production
        uses: your-deployment-action@v1
        with:
          build-dir: dist
```

### Jenkins Pipeline

Create a `Jenkinsfile` for Jenkins deployment:

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DEPLOY_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
                sh 'npm run lint'
                sh 'npm run type-check'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level high'
                sh 'npm run security:scan'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Deploy to your chosen platform
                    sh 'npm run deploy'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

## 🧪 Testing Deployment

### 1. Smoke Tests

After deployment, run smoke tests:

```bash
# Test basic functionality
curl -f https://your-domain.com/health
curl -f https://your-domain.com/api/status

# Test authentication
curl -X POST https://your-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

### 2. Load Testing

Use tools like Artillery or k6 for load testing:

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### 3. Security Testing

Run security scans on deployed application:

```bash
# OWASP ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-domain.com
```

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations run
- [ ] Security headers configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline tested
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Documentation updated

## 🔧 Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version and dependencies
2. **Environment variables**: Ensure all required variables are set
3. **Database connection**: Verify Supabase configuration
4. **GitHub API**: Check token permissions and rate limits
5. **CORS issues**: Configure proper CORS settings

### Debug Commands

```bash
# Check application logs
docker logs container-name

# Test database connection
npm run db:test

# Verify environment variables
npm run env:check

# Run health checks
npm run health:check
```

## 📞 Support

For deployment support:

- **GitHub Issues**: [Create an issue](https://github.com/TechTyphoon/secure-flow-automaton/issues)
- **Email**: deployment@techtyphoon.dev
- **Documentation**: [Wiki](https://github.com/TechTyphoon/secure-flow-automaton/wiki)

---

**Happy Deploying! 🚀**
