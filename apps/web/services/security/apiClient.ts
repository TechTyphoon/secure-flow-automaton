import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { SecurityConfigManager } from './config';

export class SecurityAPIClient {
  private config = SecurityConfigManager.getInstance();
  private cache = new Map<string, { data: unknown; timestamp: number }>();

  async makeSecureRequest<T>(
    url: string,
    options: AxiosRequestConfig,
    service: 'sonarqube' | 'snyk' | 'github',
    cacheKey?: string
  ): Promise<T | null> {
    const serviceConfig = this.config.getServiceConfig(service);
    
    if (!this.config.isServiceEnabled(service)) {
      console.warn(`⚠️ ${service} service not enabled, using fallback data`);
      return null;
    }

    // Check cache first
    if (cacheKey && this.isCacheValid(cacheKey)) {
      console.log(`📦 Using cached data for ${service}:${cacheKey}`);
      return this.cache.get(cacheKey)!.data as T;
    }

    // Retry logic
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 ${service} API call (attempt ${attempt}/${maxRetries}): ${url}`);
        
        const response: AxiosResponse<T> = await axios({
          ...options,
          timeout: (serviceConfig as any).timeout || 30000,
          headers: {
            ...options.headers,
            'User-Agent': 'SecureFlow-Automaton/1.0.0',
          }
        });

        // Cache successful response
        if (cacheKey) {
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }

        console.log(`✅ ${service} API call successful`);
        return response.data;

      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number }; message?: string };
        lastError = axiosError as Error;
        console.warn(`⚠️ ${service} API call failed (attempt ${attempt}/${maxRetries}):`, 
          axiosError.response?.status, axiosError.message);

        // Don't retry on authentication errors
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          console.error(`🚫 ${service} authentication failed. Check API token.`);
          break;
        }

        // Exponential backoff for retries
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`⏱️ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`❌ ${service} API calls exhausted. Latest error:`, lastError?.message);
    return null;
  }

  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const cacheTimeout = 300000; // 5 minutes
    return (Date.now() - cached.timestamp) < cacheTimeout;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Security API cache cleared');
  }

  getCacheStats(): { keys: number; totalSize: number } {
    return {
      keys: this.cache.size,
      totalSize: JSON.stringify(Array.from(this.cache.values())).length
    };
  }
}

// Enhanced Security Service Base Class
export abstract class BaseSecurityService {
  protected apiClient = new SecurityAPIClient();
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected async withFallback<T>(
    apiCall: () => Promise<T | null>,
    fallbackCall: () => T,
    operationName: string
  ): Promise<T> {
    try {
      const result = await apiCall();
      
      if (result !== null) {
        console.log(`✅ ${this.serviceName} ${operationName}: Real data retrieved`);
        return result;
      }
    } catch (error) {
      console.error(`❌ ${this.serviceName} ${operationName} failed:`, error);
    }

    console.log(`🔄 ${this.serviceName} ${operationName}: Using fallback data`);
    return fallbackCall();
  }

  abstract getHealthStatus(): Promise<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastCheck: string;
    message: string;
  }>;
}
