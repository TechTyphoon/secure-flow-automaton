# Secure Flow Automaton API Documentation

## 📖 Overview

This directory contains comprehensive API documentation for the Secure Flow Automaton platform, including:

- **Interactive API Documentation** - Swagger UI for exploring and testing APIs
- **OpenAPI Specification** - Machine-readable API definitions
- **Client SDKs** - Generated client libraries for multiple programming languages
- **API Testing** - Automated API testing and validation tools

## 🚀 Quick Start

### 1. Start the Documentation Server

```bash
# Start the interactive API documentation server
npm run docs:serve

# Server will be available at:
# - http://localhost:3001/ (Home page)
# - http://localhost:3001/api-docs (Swagger UI)
# - http://localhost:3001/api-docs.json (OpenAPI JSON)
```

### 2. Explore the API

1. **Open Swagger UI**: Navigate to `http://localhost:3001/api-docs`
2. **Authenticate**: Use the authentication endpoints to get a JWT token
3. **Test Endpoints**: Use "Try it out" buttons to test API calls
4. **View Responses**: See real API responses and error handling

### 3. Generate Client SDKs

```bash
# Generate TypeScript SDK
npm run sdk:generate

# Generate Python SDK
npm run sdk:python

# Generate Java SDK
npm run sdk:java

# Generate C# SDK
npm run sdk:csharp
```

## 📋 API Documentation Structure

```
docs/api/
├── README.md                 # This file
├── openapi.yaml             # OpenAPI 3.0.3 specification
├── api-server.js           # Interactive documentation server
├── tests/                   # API testing files
│   ├── postman/           # Postman collections
│   ├── newman/            # Newman test runners
│   └── integration/       # Integration test suites
└── examples/               # API usage examples
    ├── javascript/        # JavaScript examples
    ├── python/           # Python examples
    ├── curl/             # cURL command examples
    └── postman/          # Postman collection examples
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication with a zero-trust model:

### Getting Started

1. **Login** to obtain a JWT token:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"secure-password"}'
   ```

2. **Use the token** in subsequent requests:
   ```bash
   curl -X GET http://localhost:8080/api/v1/health \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Authentication Flow

1. **Initial Login**: `/auth/login` or `/auth/login/mfa`
2. **Token Refresh**: `/auth/refresh` (before token expires)
3. **Continuous Auth**: Automatic validation every 30 seconds
4. **Logout**: `/auth/logout` to invalidate session

## 🎯 Key API Endpoints

### Core Services

| Service | Base Path | Description |
|---------|-----------|-------------|
| **Security Assistant** | `/security/assistant` | AI-powered security analysis |
| **Authentication** | `/auth` | User authentication & sessions |
| **Health Monitoring** | `/health` | System health & service status |
| **Performance** | `/performance` | System performance monitoring |
| **Identity** | `/identity` | User & identity management |
| **Security Events** | `/security` | Security monitoring & alerts |
| **Configuration** | `/config` | Service configuration |
| **Audit Logs** | `/logs` | Audit trails & security logs |

### Example API Calls

#### Health Check
```bash
curl -X GET http://localhost:8080/api/v1/health
```

#### Security Analysis
```bash
curl -X POST http://localhost:8080/api/v1/security/assistant/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Show me recent security incidents",
    "type": "analysis"
  }'
```

#### Performance Report
```bash
curl -X GET "http://localhost:8080/api/v1/performance/report?timeRange=24h" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🧪 API Testing

### Automated Testing

```bash
# Validate OpenAPI specification
npm run docs:validate

# Build API documentation bundle
npm run docs:build

# Run API integration tests
npm run test:integration
```

### Manual Testing with Postman

1. **Import the collection** from `docs/api/examples/postman/`
2. **Set up environment variables**:
   - `base_url`: `http://localhost:8080/api/v1`
   - `jwt_token`: Your authentication token
3. **Run test suites** in Postman Runner

### Testing with Newman

```bash
# Install Newman globally
npm install -g newman

# Run Postman collection tests
newman run docs/api/tests/postman/SecureFlow-API.postman_collection.json \
  --environment docs/api/tests/postman/SecureFlow-Staging.postman_environment.json
```

## 📦 Client SDKs

Generated client libraries for seamless API integration:

### TypeScript SDK
```bash
npm install @secureflow-automaton/api-client

import { SecurityAssistantApi, Configuration } from '@secureflow-automaton/api-client';

const config = new Configuration({
  basePath: 'http://localhost:8080/api/v1',
  accessToken: 'your-jwt-token'
});

const api = new SecurityAssistantApi(config);
```

### Python SDK
```bash
pip install secureflow_automaton_api

from secureflow_automaton_api import ApiClient, Configuration
from secureflow_automaton_api.api import SecurityAssistantApi

config = Configuration(
    host="http://localhost:8080/api/v1",
    access_token="your-jwt-token"
)

api = SecurityAssistantApi(ApiClient(config))
```

### Java SDK
```xml
<dependency>
  <groupId>com.secureflow</groupId>
  <artifactId>automaton-api</artifactId>
  <version>4.1.0</version>
</dependency>
```

```java
import com.secureflow.automaton.api.ApiClient;
import com.secureflow.automaton.api.api.SecurityAssistantApi;

ApiClient apiClient = new ApiClient();
apiClient.setBasePath("http://localhost:8080/api/v1");
apiClient.setAccessToken("your-jwt-token");

SecurityAssistantApi api = new SecurityAssistantApi(apiClient);
```

## 🔧 Development Workflow

### Adding New Endpoints

1. **Update OpenAPI spec** in `openapi.yaml`
2. **Validate the spec**: `npm run docs:validate`
3. **Regenerate documentation**: `npm run docs:serve`
4. **Update client SDKs**: `npm run sdk:generate`
5. **Add integration tests** in `docs/api/tests/`

### Code Generation

```bash
# Generate all SDKs
npm run sdk:generate && npm run sdk:python && npm run sdk:java && npm run sdk:csharp

# Validate all specifications
npm run docs:validate
```

## 📊 API Metrics & Monitoring

### Response Times
- **Health endpoints**: <50ms
- **Authentication**: <100ms
- **Security analysis**: <200ms
- **Performance reports**: <500ms

### Rate Limits
- **Authenticated requests**: 1000/hour
- **Health checks**: 100/minute
- **Security analysis**: 50/minute

### Monitoring
- **Real-time metrics** at `/health`
- **Performance reports** at `/performance/report`
- **Security events** at `/security/events`

## 🛠️ Troubleshooting

### Common Issues

#### Authentication Errors
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid credentials",
    "recovery": {
      "type": "retry",
      "message": "Please check your username and password"
    }
  }
}
```

#### Network Timeouts
- **Check server status**: `curl http://localhost:8080/health`
- **Verify network connectivity**
- **Check firewall settings**

#### API Validation Errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

## 📞 Support & Resources

### Documentation Links
- **OpenAPI Spec**: `openapi.yaml`
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Postman Collection**: `docs/api/examples/postman/`

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **API Documentation**: Always up-to-date interactive docs
- **SDK Examples**: Code samples for all supported languages

### Version Information
- **API Version**: v1
- **Specification**: OpenAPI 3.0.3
- **Last Updated**: December 2024

---

## 🚀 Next Steps

1. **Start the documentation server**: `npm run docs:serve`
2. **Explore the interactive API docs**
3. **Generate client SDKs** for your preferred language
4. **Set up automated API testing**
5. **Integrate APIs into your applications**

Happy coding! 🎉
