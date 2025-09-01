# API Testing Environment Configuration

## Test Environment Setup

Copy the following configuration to your `.env.test` file for API testing:

```bash
# Application Configuration
NODE_ENV=test
API_PORT=8080
DOCS_PORT=3001
LOG_LEVEL=warn

# Database Configuration (Test Database)
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
DATABASE_POOL_SIZE=5
DATABASE_SSL=false

# Redis Configuration (Test Instance)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=1

# JWT Configuration (Test Keys - NEVER USE IN PRODUCTION)
JWT_SECRET=test-jwt-secret-key-for-api-testing-only-replace-in-production
JWT_EXPIRE_IN=1h
JWT_REFRESH_EXPIRE_IN=7d

# API Security Configuration
ENCRYPTION_KEY=test-encryption-key-32-chars-for-testing
MFA_ENABLED=false
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=1000

# External Services (Mock/Test URLs)
GITHUB_API_URL=https://api.github.com
GITHUB_TOKEN=test-github-token
SONARQUBE_URL=http://localhost:9000
SONARQUBE_TOKEN=test-sonarqube-token
SNYK_TOKEN=test-snyk-token

# Monitoring Configuration
MONITORING_ENABLED=true
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30000

# Test-Specific Configuration
TEST_TIMEOUT=300000
TEST_CONCURRENT_REQUESTS=5
TEST_LOAD_REQUESTS=50
TEST_DURATION=60000

# Email Configuration (Test Mode - No Actual Emails Sent)
EMAIL_ENABLED=false
EMAIL_FROM=test@example.com
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=1025

# Slack/Notification Configuration (Test Mode)
SLACK_WEBHOOK_URL=
SLACK_ENABLED=false

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./test-uploads

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
CORS_CREDENTIALS=true

# Security Headers
SECURITY_HEADERS_ENABLED=true
HSTS_ENABLED=false
CSP_ENABLED=false
```

## Setup Instructions

1. **Create test environment file:**
   ```bash
   cp docs/api/test-env-config.md .env.test
   # Edit .env.test with your actual test values
   ```

2. **Start test services:**
   ```bash
   # Start Redis (if using Docker)
   docker run -d -p 6379:6379 redis:7-alpine

   # Start PostgreSQL (if using Docker)
   docker run -d -p 5432:5432 -e POSTGRES_DB=test_db -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test postgres:15-alpine
   ```

3. **Run API tests:**
   ```bash
   # Load test environment
   export $(cat .env.test | xargs)

   # Run tests
   npm run test:integration
   ```

## Security Notes

⚠️ **IMPORTANT:** The test configuration includes dummy secrets that should NEVER be used in production:

- Change `JWT_SECRET` to a strong, random key
- Update `ENCRYPTION_KEY` to a secure 32-character key
- Replace all test tokens with actual service credentials
- Use proper database credentials for test environment

## CI/CD Environment Variables

For GitHub Actions, set these as repository secrets:

```yaml
# GitHub Secrets Configuration
JWT_SECRET: ${{ secrets.JWT_TEST_SECRET }}
ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_TEST_KEY }}
GITHUB_TOKEN: ${{ secrets.GITHUB_TEST_TOKEN }}
DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
REDIS_URL: ${{ secrets.TEST_REDIS_URL }}
```
