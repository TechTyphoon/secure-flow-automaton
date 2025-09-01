/**
 * Secure Flow Automaton JavaScript API Client Example
 * Demonstrates how to interact with the Secure Flow Automaton API
 */

class SecureFlowClient {
  constructor(baseURL = 'http://localhost:8080/api/v1') {
    this.baseURL = baseURL;
    this.token = null;
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Make authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Authenticate user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} mfaCode - MFA code (optional)
   * @returns {Promise<Object>} Authentication result
   */
  async login(email, password, mfaCode = null) {
    const payload = {
      email,
      password,
      deviceId: this.generateDeviceId(),
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    };

    if (mfaCode) {
      payload.mfaCode = mfaCode;
    }

    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (result.success && result.token) {
      this.setToken(result.token);
      console.log('✅ Authentication successful');
    }

    return result;
  }

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken(refreshToken) {
    const result = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });

    if (result.success && result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    const result = await this.request('/auth/logout', {
      method: 'POST'
    });

    if (result.success) {
      this.token = null;
      console.log('✅ Logout successful');
    }

    return result;
  }

  /**
   * Query security assistant
   * @param {string} query - Security query
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Security analysis result
   */
  async querySecurityAssistant(query, options = {}) {
    const payload = {
      text: query,
      type: options.type || 'analysis',
      parameters: options.parameters || {},
      filters: options.filters || {}
    };

    return await this.request('/security/assistant/query', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get system health status
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    return await this.request('/health');
  }

  /**
   * Get performance report
   * @param {string} timeRange - Time range (1h, 24h, 7d, 30d)
   * @returns {Promise<Object>} Performance report
   */
  async getPerformanceReport(timeRange = '24h') {
    return await this.request(`/performance/report?timeRange=${timeRange}`);
  }

  /**
   * Get security events
   * @param {Object} filters - Event filters
   * @returns {Promise<Object>} Security events
   */
  async getSecurityEvents(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/security/events?${queryString}` : '/security/events';

    return await this.request(endpoint);
  }

  /**
   * Run performance benchmark
   * @param {string} name - Benchmark name
   * @param {string} operation - Operation to benchmark
   * @param {number} iterations - Number of iterations
   * @returns {Promise<Object>} Benchmark result
   */
  async runBenchmark(name, operation, iterations = 100) {
    const payload = {
      name,
      operation,
      iterations,
      baseline: 100
    };

    return await this.request('/performance/benchmark', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Generate a simple device ID
   * @returns {string} Device ID
   */
  generateDeviceId() {
    return 'device-' + Math.random().toString(36).substr(2, 9);
  }
}

// Example usage
async function exampleUsage() {
  const client = new SecureFlowClient();

  try {
    // 1. Login
    console.log('🔐 Logging in...');
    const loginResult = await client.login('analyst@company.com', 'secure-password');
    console.log('Login result:', loginResult);

    // 2. Query security assistant
    console.log('🤖 Querying security assistant...');
    const securityQuery = await client.querySecurityAssistant(
      'Show me recent security incidents in production',
      {
        type: 'analysis',
        parameters: {
          timeRange: '24h',
          severity: 'high'
        }
      }
    );
    console.log('Security analysis:', securityQuery);

    // 3. Check system health
    console.log('❤️ Checking system health...');
    const health = await client.getHealthStatus();
    console.log('System health:', health);

    // 4. Get performance report
    console.log('📊 Getting performance report...');
    const performance = await client.getPerformanceReport('24h');
    console.log('Performance report:', performance);

    // 5. Get security events
    console.log('🔍 Getting security events...');
    const events = await client.getSecurityEvents({
      severity: 'high',
      limit: 10
    });
    console.log('Security events:', events);

    // 6. Run performance benchmark
    console.log('⚡ Running performance benchmark...');
    const benchmark = await client.runBenchmark(
      'Database Query Test',
      'SELECT * FROM users LIMIT 100',
      50
    );
    console.log('Benchmark result:', benchmark);

    // 7. Logout
    console.log('👋 Logging out...');
    await client.logout();

  } catch (error) {
    console.error('❌ Example failed:', error.message);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecureFlowClient;
}

// Auto-run example if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - make functions available globally
  window.SecureFlowClient = SecureFlowClient;
  window.exampleUsage = exampleUsage;

  console.log('🚀 Secure Flow Automaton JavaScript Client loaded!');
  console.log('💡 Try running: exampleUsage() in the console');
} else if (typeof require !== 'undefined' && require.main === module) {
  // Node.js environment - run example
  exampleUsage().catch(console.error);
}
