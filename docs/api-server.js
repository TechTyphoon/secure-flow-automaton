/**
 * Interactive API Documentation Server
 * Serves Swagger UI for Secure Flow Automaton API documentation
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DOCS_PORT || 3001;

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Secure Flow Automaton API',
    version: '4.1.0',
    description: `
# Secure Flow Automaton API Documentation

Enterprise-grade DevSecOps pipeline automation platform with comprehensive security integration.

## 🚀 Quick Start

1. **Authentication**: Use the authentication endpoints to obtain a JWT token
2. **API Access**: Include the token in Authorization header: \`Bearer <token>\`
3. **Explore**: Use the interactive documentation below to test endpoints

## 🔐 Authentication

This API uses JWT (JSON Web Token) authentication. Obtain a token from \`/auth/login\` and include it in requests:

\`\`\`bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
\`\`\`

## 📊 Key Features

- **Zero-Trust Identity Management** - Continuous authentication and authorization
- **AI-Powered Security Analysis** - Cognitive security assistant
- **Real-time Monitoring** - Live security event monitoring
- **Performance Optimization** - Automated system optimization
- **Comprehensive Logging** - Structured audit trails

## 🧪 Testing

Use the "Try it out" buttons below to test API endpoints directly from this documentation.

## 📞 Support

- **Version**: 4.1.0
- **API Version**: v1
- **Contact**: techtyphoon.html@gmail.com
    `,
    contact: {
      name: 'TechTyphoon',
      email: 'techtyphoon.html@gmail.com',
      url: 'https://github.com/TechTyphoon/secure-flow-automaton'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://api.secureflow.com/v1',
      description: 'Production server'
    },
    {
      url: 'http://localhost:8080/api/v1',
      description: 'Development server'
    },
    {
      url: 'https://staging.secureflow.com/v1',
      description: 'Staging server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service authentication'
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    path.join(__dirname, '../openapi.yaml'),
    path.join(__dirname, 'api/**/*.js'),
    path.join(__dirname, 'api/**/*.ts'),
    path.join(__dirname, '../../apps/web/**/*.ts'),
    path.join(__dirname, '../../apps/web/**/*.js')
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Custom CSS for better styling
const customCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info .title { color: #2563eb }
  .swagger-ui .opblock-summary-method { font-weight: bold }
  .swagger-ui .opblock.opblock-post { border-left-color: #10b981 }
  .swagger-ui .opblock.opblock-get { border-left-color: #3b82f6 }
  .swagger-ui .opblock.opblock-put { border-left-color: #f59e0b }
  .swagger-ui .opblock.opblock-delete { border-left-color: #ef4444 }
  .swagger-ui .opblock.opblock-patch { border-left-color: #8b5cf6 }
`;

// Swagger UI options
const swaggerOptions = {
  customCss,
  customSiteTitle: 'Secure Flow Automaton API',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Add any custom request interceptors here
      console.log('API Request:', req.url);
      return req;
    },
    responseInterceptor: (res) => {
      // Add any custom response interceptors here
      console.log('API Response:', res.status);
      return res;
    }
  }
};

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerOptions));

// Serve the OpenAPI specification as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve the OpenAPI specification as YAML
app.get('/api-docs.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  // In a real implementation, you'd convert the JSON spec to YAML
  // For now, we'll serve a placeholder
  res.send('# OpenAPI YAML specification would be served here');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'API Documentation Server',
    version: '4.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      swaggerUI: '/api-docs',
      openAPIJson: '/api-docs.json',
      openAPIYaml: '/api-docs.yaml'
    }
  });
});

// Root endpoint with useful links
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Secure Flow Automaton API Documentation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          color: #2563eb;
          margin-bottom: 30px;
        }
        .links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .link-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-decoration: none;
          color: #374151;
          transition: box-shadow 0.2s;
        }
        .link-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .link-card h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
        }
        .status {
          display: inline-block;
          padding: 4px 8px;
          background: #dcfce7;
          color: #166534;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔒 Secure Flow Automaton</h1>
        <p>Enterprise-grade DevSecOps API Documentation</p>
        <span class="status">Version 4.1.0</span>
      </div>

      <div class="links">
        <a href="/api-docs" class="link-card">
          <h3>📖 Interactive API Documentation</h3>
          <p>Complete Swagger UI documentation with "Try it out" functionality</p>
        </a>

        <a href="/api-docs.json" class="link-card">
          <h3>📋 OpenAPI JSON Specification</h3>
          <p>Machine-readable API specification for code generation</p>
        </a>

        <a href="/health" class="link-card">
          <h3>❤️ Health Check</h3>
          <p>Check the status of the documentation server</p>
        </a>

        <a href="https://github.com/TechTyphoon/secure-flow-automaton" class="link-card" target="_blank">
          <h3>🐙 GitHub Repository</h3>
          <p>View source code and contribute to the project</p>
        </a>
      </div>

      <div style="text-align: center; margin-top: 40px; color: #6b7280;">
        <p>🚀 Ready for production deployment with comprehensive security automation</p>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Documentation server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Documentation server encountered an error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Secure Flow Automaton API Documentation Server`);
  console.log(`📖 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📋 OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
  console.log(`🏠 Home Page: http://localhost:${PORT}/`);
  console.log(`\n📚 Ready to explore the API documentation!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API Documentation Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down API Documentation Server...');
  process.exit(0);
});

export default app;
