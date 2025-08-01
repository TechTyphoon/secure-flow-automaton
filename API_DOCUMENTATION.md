# 🔌 **SecureFlow Automaton - Complete API Documentation**

## **📋 Table of Contents**

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Security API](#security-api)
4. [Quantum API](#quantum-api)
5. [Monitoring API](#monitoring-api)
6. [User Management API](#user-management-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## **🌐 Overview**

### **Base URL**
```
Production: https://api.secureflow.com
Development: http://localhost:3000
```

### **API Versioning**
All API endpoints are versioned using the URL path:
```
/api/v1/endpoint
```

### **Content Types**
- **Request**: `application/json`
- **Response**: `application/json`

### **Authentication**
All API endpoints require authentication via JWT Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## **🔐 Authentication API**

### **POST /api/v1/auth/login**

Authenticate a user and receive a JWT token.

#### **Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### **Response**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "admin",
    "permissions": ["read", "write", "admin"]
  },
  "expiresIn": 3600
}
```

#### **Error Response**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_001"
}
```

### **POST /api/v1/auth/register**

Register a new user account.

#### **Request**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "developer"
}
```

#### **Response**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "role": "developer"
  }
}
```

### **POST /api/v1/auth/refresh**

Refresh an expired JWT token.

#### **Request**
```http
POST /api/v1/auth/refresh
Authorization: Bearer <expired_token>
```

#### **Response**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### **POST /api/v1/auth/logout**

Logout and invalidate the current token.

#### **Request**
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## **🛡️ Security API**

### **GET /api/v1/security/metrics**

Get comprehensive security metrics.

#### **Request**
```http
GET /api/v1/security/metrics
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "vulnerabilities": {
      "critical": 0,
      "high": 2,
      "medium": 5,
      "low": 12,
      "total": 19
    },
    "compliance": {
      "soc2": 92,
      "gdpr": 88,
      "hipaa": 95,
      "pci": 90
    },
    "trends": {
      "lastWeek": 87,
      "lastMonth": 82,
      "lastQuarter": 78
    },
    "lastUpdated": "2025-08-01T12:00:00Z"
  }
}
```

### **GET /api/v1/security/vulnerabilities**

Get detailed vulnerability information.

#### **Request**
```http
GET /api/v1/security/vulnerabilities?severity=high&status=open
Authorization: Bearer <token>
```

#### **Query Parameters**
- `severity`: `critical`, `high`, `medium`, `low`
- `status`: `open`, `acknowledged`, `resolved`
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

#### **Response**
```json
{
  "success": true,
  "data": {
    "vulnerabilities": [
      {
        "id": "vuln-001",
        "title": "SQL Injection Vulnerability",
        "description": "Potential SQL injection in user input",
        "severity": "high",
        "status": "open",
        "component": "auth-service",
        "lineNumber": 45,
        "cveId": "CVE-2025-1234",
        "createdAt": "2025-08-01T10:00:00Z",
        "remediation": "Use parameterized queries"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### **POST /api/v1/security/scan**

Trigger a security scan.

#### **Request**
```http
POST /api/v1/security/scan
Authorization: Bearer <token>
Content-Type: application/json

{
  "scanType": "comprehensive",
  "targets": ["frontend", "backend", "database"],
  "options": {
    "includeDependencies": true,
    "includeContainers": true,
    "failOnHigh": false
  }
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "scanId": "scan-2025-08-01-001",
    "status": "initiated",
    "estimatedDuration": 300,
    "message": "Security scan initiated successfully"
  }
}
```

### **GET /api/v1/security/scan/{scanId}**

Get scan status and results.

#### **Request**
```http
GET /api/v1/security/scan/scan-2025-08-01-001
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "scanId": "scan-2025-08-01-001",
    "status": "completed",
    "progress": 100,
    "startedAt": "2025-08-01T12:00:00Z",
    "completedAt": "2025-08-01T12:05:00Z",
    "results": {
      "vulnerabilitiesFound": 5,
      "criticalIssues": 0,
      "highIssues": 2,
      "mediumIssues": 3,
      "lowIssues": 0
    }
  }
}
```

---

## **⚡ Quantum API**

### **POST /api/v1/quantum/execute**

Execute a quantum operation.

#### **Request**
```http
POST /api/v1/quantum/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "operation": "quantum_fourier_transform",
  "input": {
    "data": [1, 0, 1, 0, 1, 0, 1, 0],
    "dimension": 8
  },
  "parameters": {
    "dimension": 512,
    "modulus": 8380417,
    "securityLevel": 128
  }
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "result": [0.5, 0, 0.5, 0, 0.5, 0, 0.5, 0],
    "executionTime": 0.001,
    "quantumAdvantage": 45.2,
    "phase": 6,
    "operationId": "quantum-op-2025-08-01-001"
  }
}
```

### **GET /api/v1/quantum/operations**

Get available quantum operations.

#### **Request**
```http
GET /api/v1/quantum/operations
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "operations": [
      {
        "name": "quantum_fourier_transform",
        "description": "Quantum Fourier Transform",
        "phase": 6,
        "complexity": "O(n log n)",
        "parameters": {
          "dimension": "integer",
          "modulus": "integer",
          "securityLevel": "integer"
        }
      },
      {
        "name": "quantum_consciousness",
        "description": "Quantum Consciousness Processing",
        "phase": 7,
        "complexity": "O(2^n)",
        "parameters": {
          "consciousnessLevel": "float",
          "ethicalAI": "boolean",
          "quantumAware": "boolean"
        }
      }
    ]
  }
}
```

### **POST /api/v1/quantum/consciousness**

Execute quantum consciousness operation.

#### **Request**
```http
POST /api/v1/quantum/consciousness
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": {
    "context": "decision_making",
    "data": "complex_decision_data",
    "ethicalConsiderations": true
  },
  "parameters": {
    "consciousnessLevel": 9.64,
    "ethicalAI": true,
    "quantumAware": true
  }
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "decision": "proceed_with_caution",
    "confidence": 0.87,
    "ethicalScore": 0.92,
    "consciousnessLevel": 9.64,
    "reasoning": "Based on quantum consciousness analysis...",
    "executionTime": 0.005,
    "quantumAdvantage": 58.3
  }
}
```

---

## **📊 Monitoring API**

### **GET /api/v1/monitoring/health**

Get system health status.

#### **Request**
```http
GET /api/v1/monitoring/health
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-08-01T12:00:00Z",
    "services": {
      "main-app": {
        "status": "healthy",
        "responseTime": 45,
        "uptime": 86400
      },
      "quantum-edge": {
        "status": "healthy",
        "responseTime": 23,
        "uptime": 86400
      },
      "postgres": {
        "status": "healthy",
        "connections": 15,
        "uptime": 86400
      },
      "redis": {
        "status": "healthy",
        "memory": "256MB",
        "uptime": 86400
      }
    }
  }
}
```

### **GET /api/v1/monitoring/metrics**

Get system performance metrics.

#### **Request**
```http
GET /api/v1/monitoring/metrics?timeRange=1h
Authorization: Bearer <token>
```

#### **Query Parameters**
- `timeRange`: `1h`, `6h`, `24h`, `7d`, `30d`
- `service`: Specific service name
- `metric`: Specific metric type

#### **Response**
```json
{
  "success": true,
  "data": {
    "cpu": {
      "current": 25.5,
      "average": 22.3,
      "peak": 45.2
    },
    "memory": {
      "current": 2048,
      "average": 1987,
      "peak": 2560
    },
    "disk": {
      "current": 45.2,
      "average": 42.1,
      "peak": 67.8
    },
    "network": {
      "incoming": 1024,
      "outgoing": 2048,
      "connections": 150
    },
    "quantum": {
      "operationsPerSecond": 1000,
      "averageResponseTime": 0.001,
      "quantumAdvantage": 45.2
    }
  }
}
```

### **GET /api/v1/monitoring/alerts**

Get system alerts.

#### **Request**
```http
GET /api/v1/monitoring/alerts?severity=high&status=active
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "title": "High CPU Usage",
        "description": "CPU usage exceeded 80%",
        "severity": "high",
        "status": "active",
        "service": "main-app",
        "createdAt": "2025-08-01T11:45:00Z",
        "acknowledgedAt": null,
        "resolvedAt": null
      }
    ],
    "summary": {
      "total": 5,
      "critical": 0,
      "high": 2,
      "medium": 2,
      "low": 1
    }
  }
}
```

---

## **👥 User Management API**

### **GET /api/v1/users**

Get all users (admin only).

#### **Request**
```http
GET /api/v1/users?role=admin&status=active
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@secureflow.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "admin",
        "status": "active",
        "createdAt": "2025-01-01T00:00:00Z",
        "lastLogin": "2025-08-01T11:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### **GET /api/v1/users/{userId}**

Get specific user details.

#### **Request**
```http
GET /api/v1/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@secureflow.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "developer",
    "status": "active",
    "permissions": ["read", "write"],
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLogin": "2025-08-01T11:30:00Z",
    "profile": {
      "avatar": "https://secureflow.com/avatars/user.jpg",
      "timezone": "UTC",
      "language": "en"
    }
  }
}
```

### **PUT /api/v1/users/{userId}**

Update user information.

#### **Request**
```http
PUT /api/v1/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "role": "security-engineer",
  "status": "active"
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@secureflow.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "security-engineer",
    "status": "active",
    "updatedAt": "2025-08-01T12:00:00Z"
  }
}
```

---

## **⚠️ Error Handling**

### **Error Response Format**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2025-08-01T12:00:00Z"
}
```

### **Common Error Codes**

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_001` | Invalid credentials | 401 |
| `AUTH_002` | Token expired | 401 |
| `AUTH_003` | Insufficient permissions | 403 |
| `VALIDATION_001` | Invalid input data | 400 |
| `NOT_FOUND_001` | Resource not found | 404 |
| `RATE_LIMIT_001` | Rate limit exceeded | 429 |
| `SERVER_001` | Internal server error | 500 |

### **Example Error Response**
```json
{
  "success": false,
  "error": "Invalid input data",
  "code": "VALIDATION_001",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "timestamp": "2025-08-01T12:00:00Z"
}
```

---

## **🚦 Rate Limiting**

### **Rate Limits**
- **Authentication endpoints**: 5 requests per minute
- **Security API**: 100 requests per minute
- **Quantum API**: 50 requests per minute
- **Monitoring API**: 200 requests per minute
- **User Management API**: 30 requests per minute

### **Rate Limit Headers**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1627833600
```

### **Rate Limit Exceeded Response**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_001",
  "retryAfter": 60
}
```

---

## **📚 SDK Examples**

### **JavaScript/TypeScript**
```javascript
import { SecureFlowAPI } from '@secureflow/api';

const api = new SecureFlowAPI({
  baseURL: 'https://api.secureflow.com',
  token: 'your_jwt_token'
});

// Get security metrics
const metrics = await api.security.getMetrics();

// Execute quantum operation
const result = await api.quantum.execute({
  operation: 'quantum_fourier_transform',
  input: { data: [1, 0, 1, 0] },
  parameters: { dimension: 512 }
});

// Get system health
const health = await api.monitoring.getHealth();
```

### **Python**
```python
from secureflow_api import SecureFlowAPI

api = SecureFlowAPI(
    base_url='https://api.secureflow.com',
    token='your_jwt_token'
)

# Get security metrics
metrics = api.security.get_metrics()

# Execute quantum operation
result = api.quantum.execute(
    operation='quantum_fourier_transform',
    input={'data': [1, 0, 1, 0]},
    parameters={'dimension': 512}
)

# Get system health
health = api.monitoring.get_health()
```

### **cURL Examples**
```bash
# Get security metrics
curl -X GET "https://api.secureflow.com/api/v1/security/metrics" \
  -H "Authorization: Bearer your_jwt_token"

# Execute quantum operation
curl -X POST "https://api.secureflow.com/api/v1/quantum/execute" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "quantum_fourier_transform",
    "input": {"data": [1, 0, 1, 0]},
    "parameters": {"dimension": 512}
  }'

# Get system health
curl -X GET "https://api.secureflow.com/api/v1/monitoring/health" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## **🔗 WebSocket API**

### **Real-time Updates**

Connect to WebSocket endpoint for real-time updates:

```javascript
const ws = new WebSocket('wss://api.secureflow.com/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'security_alert':
      console.log('Security alert:', data.payload);
      break;
    case 'quantum_operation_complete':
      console.log('Quantum operation complete:', data.payload);
      break;
    case 'system_health_update':
      console.log('System health update:', data.payload);
      break;
  }
};
```

### **WebSocket Events**

| Event | Description | Payload |
|-------|-------------|---------|
| `security_alert` | New security alert | Alert details |
| `quantum_operation_complete` | Quantum operation finished | Operation results |
| `system_health_update` | System health change | Health metrics |
| `user_activity` | User activity update | Activity details |

---

## **🎯 Conclusion**

The SecureFlow Automaton API provides comprehensive access to all platform features including security monitoring, quantum computing operations, and system management. All endpoints are RESTful, well-documented, and include proper error handling and rate limiting.

### **Key Features**
- **RESTful Design**: Consistent API patterns
- **JWT Authentication**: Secure token-based auth
- **Comprehensive Error Handling**: Detailed error responses
- **Rate Limiting**: API protection and fair usage
- **Real-time Updates**: WebSocket support
- **SDK Support**: Multiple language SDKs

### **Getting Started**
1. **Authenticate**: Use `/api/v1/auth/login` to get a token
2. **Explore APIs**: Start with security and monitoring endpoints
3. **Integrate**: Use the provided SDKs for easy integration
4. **Monitor**: Use WebSocket for real-time updates

**For additional support, contact our API team at api-support@secureflow.com** 🚀

---

*Last updated: August 1, 2025*  
*API Version: v1*  
*Status: Production-Ready* 