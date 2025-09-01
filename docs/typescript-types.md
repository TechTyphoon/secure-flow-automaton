# TypeScript Types Documentation

## Overview

This document provides comprehensive documentation of all TypeScript types, interfaces, and enums used throughout the Secure Flow Automaton platform. All types are organized by category and include detailed descriptions, usage examples, and relationships.

## Table of Contents

- [Core Types](#core-types)
- [Security Types](#security-types)
- [Identity Types](#identity-types)
- [Monitoring Types](#monitoring-types)
- [Performance Types](#performance-types)
- [Configuration Types](#configuration-types)
- [Error Types](#error-types)
- [Utility Types](#utility-types)

## Core Types

### BaseEntity

Base interface for all entities with common properties.

```typescript
interface BaseEntity {
  id: string;              // Unique identifier
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last update timestamp
  version: number;         // Entity version for optimistic locking
  metadata?: Record<string, any>; // Additional metadata
}
```

### Timestamp

Represents a timestamp with timezone information.

```typescript
interface Timestamp {
  unix: number;            // Unix timestamp in milliseconds
  iso: string;             // ISO 8601 formatted string
  timezone: string;        // Timezone identifier (e.g., 'UTC', 'America/New_York')
  locale?: string;         // Locale for formatting
}
```

### PaginationOptions

Options for paginated queries.

```typescript
interface PaginationOptions {
  page: number;            // Page number (1-based)
  limit: number;           // Items per page
  sortBy?: string;         // Sort field
  sortOrder?: 'asc' | 'desc'; // Sort direction
  cursor?: string;         // Cursor for cursor-based pagination
}
```

### PaginatedResponse

Standard response format for paginated results.

```typescript
interface PaginatedResponse<T> {
  data: T[];               // Array of result items
  pagination: {
    page: number;          // Current page number
    limit: number;         // Items per page
    total: number;         // Total number of items
    totalPages: number;    // Total number of pages
    hasNext: boolean;      // Whether there are more pages
    hasPrev: boolean;      // Whether there are previous pages
    nextCursor?: string;   // Cursor for next page
    prevCursor?: string;   // Cursor for previous page
  };
  metadata?: {
    queryTime: number;     // Query execution time in milliseconds
    cacheHit: boolean;     // Whether result came from cache
    source: string;        // Data source (e.g., 'database', 'cache', 'api')
  };
}
```

### QueryFilters

Generic query filter interface.

```typescript
interface QueryFilters {
  [key: string]: any;      // Dynamic filter properties
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  tags?: string[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  search?: string;         // Full-text search query
}
```

## Security Types

### SecurityQuery

Represents a security analysis query.

```typescript
interface SecurityQuery {
  text: string;                    // Natural language query text
  type: SecurityQueryType;         // Query classification
  parameters?: Record<string, any>; // Additional parameters
  filters?: SecurityFilters;       // Security-specific filters
  timeRange?: TimeRange;           // Analysis time range
  priority?: QueryPriority;        // Query processing priority
  context?: SecurityContext;       // Security context information
}
```

### SecurityData

Comprehensive security analysis result.

```typescript
interface SecurityData {
  queryId: string;                       // Unique query identifier
  timestamp: Date;                       // Response timestamp
  sessionId: string;                     // Associated session identifier
  userId: string;                        // User who initiated the query

  // Analysis Results
  anomalies: SecurityAnomaly[];          // Detected anomalies
  threats: SecurityThreat[];             // Identified threats
  recommendations: SecurityRecommendation[]; // Action recommendations
  statistics: SecurityStatistics;        // Analysis statistics
  visualizations: VisualizationData;     // Data visualizations

  // Processing Metadata
  processingTime: number;               // Processing duration (ms)
  confidence: number;                   // Analysis confidence (0-1)
  modelVersion: string;                 // AI model version used
  dataSources: string[];                // Data sources consulted

  // Quality Metrics
  falsePositiveRate?: number;           // Estimated false positive rate
  coverage: number;                     // Analysis coverage percentage
  completeness: number;                 // Result completeness score
}
```

### SecurityAnomaly

Represents a detected security anomaly.

```typescript
interface SecurityAnomaly {
  id: string;                    // Unique anomaly identifier
  type: AnomalyType;            // Type of anomaly
  severity: SecuritySeverity;   // Severity level
  description: string;          // Human-readable description
  confidence: number;           // Detection confidence (0-1)

  timestamp: Date;              // Detection timestamp
  location?: string;            // Location/context of anomaly
  source: string;               // Detection source (e.g., 'log_analysis', 'behavioral')

  // Technical Details
  indicators: SecurityIndicator[]; // Technical indicators
  impact: ImpactAssessment;     // Impact assessment
  risk: RiskAssessment;         // Risk assessment

  // Mitigation
  mitigation?: MitigationAction[]; // Recommended mitigation actions
  automated: boolean;           // Whether mitigation can be automated

  // Evidence
  evidence: Evidence[];         // Supporting evidence
  correlationId?: string;       // Correlation with other events
}
```

### SecurityThreat

Represents an identified security threat.

```typescript
interface SecurityThreat {
  id: string;                    // Unique threat identifier
  type: ThreatType;             // Type of threat
  severity: SecuritySeverity;   // Severity level
  status: ThreatStatus;         // Current threat status
  description: string;          // Threat description

  // Threat Intelligence
  indicators: ThreatIndicator[]; // Threat indicators
  tactics: string[];            // MITRE ATT&CK tactics
  techniques: string[];         // MITRE ATT&CK techniques
  campaign?: string;            // Associated campaign
  actor?: string;               // Threat actor name

  // Impact Assessment
  affectedAssets: string[];     // Affected assets/systems
  potentialImpact: ImpactLevel; // Potential impact level
  likelihood: number;           // Likelihood score (0-1)

  // Timeline
  timeline: ThreatTimeline[];   // Threat timeline events
  firstSeen: Date;              // First detection timestamp
  lastSeen: Date;               // Last detection timestamp

  // Response
  mitigation: ThreatMitigation; // Mitigation information
  containment: ContainmentAction[]; // Containment actions
  eradication: EradicationAction[]; // Eradication actions

  // Intelligence
  intelligence: ThreatIntelligence; // Threat intelligence data
  references: string[];          // External references
}
```

### SecurityContext

Security context information for operations.

```typescript
interface SecurityContext {
  userId: string;               // User identifier
  sessionId: string;            // Session identifier
  roles: string[];              // User roles
  permissions: string[];        // User permissions
  clearance: SecurityClearance; // Security clearance level
  department: string;           // User's department
  location: GeoLocation;        // User's geographic location
  device: DeviceInfo;           // Device information
  network: NetworkInfo;         // Network information
  riskProfile: RiskProfile;     // User's risk profile
}
```

## Identity Types

### AuthenticationCredentials

User authentication credentials.

```typescript
interface AuthenticationCredentials {
  email: string;                    // User email address
  password: string;                 // User password
  mfaCode?: string;                 // Multi-factor authentication code
  deviceFingerprint?: string;       // Device fingerprint hash
  ipAddress: string;                // Client IP address
  userAgent: string;               // Browser/client user agent
  location?: GeoLocation;          // Geographic location
  timezone?: string;               // Client timezone
  biometricData?: BiometricData;   // Biometric authentication data
}
```

### AuthenticationResult

Result of authentication attempt.

```typescript
interface AuthenticationResult {
  success: boolean;                 // Authentication success status
  userId?: string;                  // User identifier (if successful)
  sessionId?: string;               // Session identifier (if successful)
  token?: string;                   // Authentication token (if successful)
  tokenExpiresAt?: Date;           // Token expiration time
  refreshToken?: string;           // Refresh token (if successful)

  failureReason?: AuthFailureReason; // Failure reason (if unsuccessful)
  failureCode?: string;            // Specific failure code

  riskAssessment?: RiskAssessment; // Risk assessment result
  requiresMFA?: boolean;           // MFA required flag
  requiresDeviceVerification?: boolean; // Device verification required
  requiresLocationVerification?: boolean; // Location verification required

  nextStep?: AuthStep;            // Next authentication step
  stepData?: Record<string, any>; // Data for next step

  metadata?: {
    attemptCount: number;          // Login attempt count
    lockoutUntil?: Date;           // Account lockout expiration
    lastLogin?: Date;              // User's last successful login
    suspiciousActivity: boolean;   // Suspicious activity detected
  };
}
```

### ContinuousAuthResult

Result of continuous authentication check.

```typescript
interface ContinuousAuthResult {
  valid: boolean;                   // Session validity status
  sessionId: string;               // Session identifier
  userId: string;                  // Associated user identifier
  timestamp: Date;                 // Check timestamp

  riskLevel: RiskLevel;            // Current risk level
  riskScore: number;               // Risk score (0-100)
  lastActivity: Date;              // Last activity timestamp
  nextCheckTime: Date;             // Next continuous auth check time

  failureReason?: ContinuousAuthFailure; // Failure reason (if invalid)
  violations?: PolicyViolation[];  // Policy violations detected

  actions?: ContinuousAuthAction[]; // Required actions
  actionDeadline?: Date;           // Deadline for completing actions

  metadata?: {
    checkDuration: number;         // Check execution time (ms)
    factors: string[];             // Authentication factors used
    confidence: number;            // Validation confidence (0-1)
  };
}
```

### UserRegistration

User account registration data.

```typescript
interface UserRegistration {
  email: string;                   // User email address
  password?: string;               // Initial password (optional)
  firstName: string;               // User's first name
  lastName: string;               // User's last name
  displayName?: string;            // Display name
  avatar?: string;                 // Avatar/profile image URL

  // Organizational
  department?: string;             // User's department
  role?: string;                   // User's role
  managerId?: string;              // Manager's user ID
  costCenter?: string;             // Cost center

  // Security
  requireMFA: boolean;             // MFA requirement flag
  securityQuestions?: SecurityQuestion[]; // Security questions
  recoveryEmail?: string;          // Recovery email address
  recoveryPhone?: string;          // Recovery phone number

  // Account Settings
  preferences: UserPreferences;    // User preferences
  notifications: NotificationSettings; // Notification settings
  timezone: string;                // User's timezone
  language: string;                // Preferred language

  // Compliance
  termsAccepted: boolean;          // Terms of service acceptance
  privacyPolicyAccepted: boolean;  // Privacy policy acceptance
  dataProcessingConsent: boolean;  // Data processing consent

  // Metadata
  source?: string;                 // Registration source
  campaign?: string;               // Marketing campaign
  referralCode?: string;           // Referral code
  metadata?: Record<string, any>;  // Additional metadata
}
```

### SessionInfo

Information about an active user session.

```typescript
interface SessionInfo {
  id: string;                      // Session identifier
  userId: string;                  // Associated user identifier
  createdAt: Date;                 // Session creation time
  lastActivity: Date;              // Last activity timestamp
  expiresAt: Date;                // Session expiration time
  maxAge: number;                  // Maximum session age (ms)

  // Client Information
  ipAddress: string;               // Client IP address
  userAgent: string;               // Client user agent
  deviceInfo?: DeviceInfo;         // Device information
  location?: GeoLocation;          // Geographic location
  timezone: string;                // Client timezone

  // Authentication
  authMethod: AuthMethod;          // Authentication method used
  mfaVerified: boolean;            // MFA verification status
  deviceVerified: boolean;         // Device verification status

  // Security
  riskLevel: RiskLevel;            // Session risk level
  riskScore: number;               // Risk score (0-100)
  suspiciousActivity: boolean;     // Suspicious activity detected
  violations: PolicyViolation[];   // Policy violations

  // Status
  status: SessionStatus;           // Session status
  terminationReason?: string;      // Reason for termination (if terminated)

  // Metadata
  metadata?: Record<string, any>;  // Additional session data
  tags: string[];                  // Session tags
}
```

## Monitoring Types

### HealthStatus

Service health status information.

```typescript
interface HealthStatus {
  service: string;              // Service identifier
  status: HealthState;          // Current health state
  timestamp: Date;              // Last check timestamp
  responseTime: number;         // Response time in milliseconds
  uptime: number;               // Service uptime in milliseconds
  version?: string;             // Service version
  build?: string;               // Build information

  // Dependencies
  dependencies?: DependencyHealth[]; // Dependent services health

  // Performance Metrics
  metrics: ServiceMetrics;      // Current service metrics

  // Issues
  issues: HealthIssue[];        // Current issues or warnings
  lastCheck: Date;              // Last health check time
  nextCheck?: Date;             // Next scheduled check

  // Configuration
  config?: HealthConfig;        // Health check configuration
}
```

### ServiceMetrics

Detailed service performance metrics.

```typescript
interface ServiceMetrics {
  // Request Metrics
  requestsTotal: number;         // Total requests processed
  requestsPerSecond: number;     // Current requests per second
  requestsPerMinute: number;     // Requests per minute (last minute)
  requestsPerHour: number;       // Requests per hour (last hour)

  // Response Metrics
  averageResponseTime: number;   // Average response time (ms)
  medianResponseTime: number;    // Median response time (ms)
  p95ResponseTime: number;       // 95th percentile response time (ms)
  p99ResponseTime: number;       // 99th percentile response time (ms)

  // Error Metrics
  errorRate: number;             // Error rate percentage
  errorCount: number;            // Total errors
  errorsPerSecond: number;       // Errors per second
  lastError?: Date;              // Last error timestamp

  // Resource Metrics
  memoryUsage: number;           // Memory usage percentage
  cpuUsage: number;              // CPU usage percentage
  diskUsage?: number;            // Disk usage percentage
  networkUsage?: number;         // Network usage (bytes/s)

  // Connection Metrics
  activeConnections: number;     // Active connections
  totalConnections: number;      // Total connections
  connectionPoolSize?: number;   // Connection pool size
  connectionPoolUsage?: number;  // Connection pool usage percentage

  // Queue Metrics
  queueDepth: number;            // Current queue depth
  queueCapacity?: number;        // Queue capacity
  averageQueueTime?: number;     // Average time in queue (ms)

  // Custom Metrics
  custom?: Record<string, number>; // Service-specific metrics
}
```

### Alert

Alert information and configuration.

```typescript
interface Alert {
  id: string;                   // Unique alert identifier
  title: string;                // Alert title
  description: string;          // Alert description
  summary?: string;             // Alert summary
  severity: AlertSeverity;      // Alert severity

  // Alert Status
  status: AlertStatus;          // Alert status
  acknowledgedAt?: Date;        // Acknowledgment time
  resolvedAt?: Date;            // Resolution time
  acknowledgedBy?: string;      // User who acknowledged
  resolvedBy?: string;          // User who resolved

  // Alert Source
  source: string;               // Alert source
  service: string;              // Affected service
  component?: string;           // Affected component

  // Alert Condition
  condition: string;            // Alert condition expression
  threshold: number;            // Threshold value
  currentValue: number;         // Current value
  operator: AlertOperator;      // Comparison operator

  // Alert Metadata
  timestamp: Date;              // Alert creation time
  tags: string[];               // Alert tags
  labels?: Record<string, string>; // Alert labels

  // Alert Actions
  actions?: AlertAction[];      // Automated actions
  notifications?: Notification[]; // Notification configuration

  // Alert Context
  context?: Record<string, any>; // Additional context
  metadata?: Record<string, any>; // Additional metadata

  // Escalation
  escalation?: EscalationConfig; // Escalation configuration
  escalationLevel?: number;     // Current escalation level
}
```

### SecurityEvent

Security event information.

```typescript
interface SecurityEvent {
  id: string;                   // Unique event identifier
  type: SecurityEventType;      // Event type
  severity: SecuritySeverity;   // Event severity
  category: SecurityCategory;   // Event category
  description: string;          // Event description

  // Event Source
  source: string;               // Event source service
  component?: string;           // Event source component
  location?: string;            // Event location/context

  // User Context
  userId?: string;              // Associated user ID
  sessionId?: string;           // Associated session ID
  username?: string;            // Username
  email?: string;               // User email

  // Client Context
  ipAddress?: string;           // Client IP address
  userAgent?: string;           // Client user agent
  deviceId?: string;            // Device identifier
  location?: GeoLocation;       // Geographic location

  // Event Data
  timestamp: Date;              // Event timestamp
  metadata?: Record<string, any>; // Event-specific data
  context?: Record<string, any>; // Additional context

  // Event Classification
  confidence?: number;          // Event confidence score (0-1)
  falsePositive?: boolean;      // False positive flag
  correlationId?: string;       // Correlation identifier
  relatedEvents?: string[];     // Related event IDs

  // Response
  response?: SecurityResponse;  // Automated response
  manualAction?: boolean;       // Manual action required
  escalated?: boolean;          // Escalated to security team

  // Audit
  auditTrail?: AuditEntry[];    // Audit trail entries
  compliance?: ComplianceInfo;  // Compliance information
}
```

## Performance Types

### PerformanceProfile

Performance profiling result.

```typescript
interface PerformanceProfile {
  id: string;                      // Unique profile identifier
  name: string;                    // Profile name
  service: string;                 // Service being profiled
  operation?: string;              // Operation being profiled

  startTime: Date;                 // Profiling start time
  endTime?: Date;                  // Profiling end time
  duration?: number;               // Total duration (ms)

  // Memory Metrics
  memoryUsage: {
    initial: number;               // Initial memory usage (bytes)
    peak: number;                  // Peak memory usage (bytes)
    final: number;                 // Final memory usage (bytes)
    growth: number;                // Memory growth (bytes)
    growthRate: number;            // Memory growth rate (bytes/ms)
  };

  // CPU Metrics
  cpuUsage: {
    average: number;               // Average CPU usage (%)
    peak: number;                  // Peak CPU usage (%)
    samples: number[];             // CPU usage samples
    totalTime: number;             // Total CPU time (ms)
  };

  // Operation Metrics
  operations: OperationProfile[];  // Individual operation profiles

  // Bottleneck Analysis
  bottlenecks: BottleneckAnalysis[]; // Identified bottlenecks
  recommendations: string[];       // Performance recommendations

  // Profiling Metadata
  sampleRate?: number;             // Sampling rate
  environment: string;             // Profiling environment
  tags: string[];                  // Profile tags
}
```

### OperationProfile

Profile of individual operation performance.

```typescript
interface OperationProfile {
  name: string;                    // Operation name
  type: OperationType;             // Operation type
  startTime: Date;                 // Operation start time
  endTime: Date;                   // Operation end time
  duration: number;                // Operation duration (ms)

  // Resource Usage
  memoryDelta: number;             // Memory usage change (bytes)
  cpuTime: number;                 // CPU time used (ms)
  ioOperations?: number;           // I/O operations performed

  // Performance Stats
  callCount: number;               // Number of calls
  averageTime: number;             // Average execution time (ms)
  slowestCall: number;             // Slowest call time (ms)
  fastestCall: number;             // Fastest call time (ms)
  percentile95: number;            // 95th percentile (ms)
  percentile99: number;            // 99th percentile (ms)

  // Call Distribution
  callTimes: number[];             // Individual call times
  callDistribution: {
    fast: number;                  // Fast calls (< 100ms)
    normal: number;                // Normal calls (100ms - 1s)
    slow: number;                  // Slow calls (1s - 10s)
    verySlow: number;              // Very slow calls (> 10s)
  };

  // Dependencies
  dependencies?: string[];         // Dependent operations
  blocking?: boolean;              // Whether operation is blocking

  // Errors
  errorCount: number;              // Number of errors
  errorRate: number;               // Error rate (%)
  lastError?: Date;                // Last error timestamp
}
```

### BenchmarkResult

Performance benchmark result.

```typescript
interface BenchmarkResult {
  name: string;                    // Benchmark name
  category: string;                // Benchmark category
  description?: string;            // Benchmark description

  // Performance Results
  baseline?: number;               // Baseline performance value
  current: number;                 // Current performance value
  improvement: number;             // Improvement percentage
  target?: number;                 // Target performance value

  // Statistical Data
  mean: number;                    // Mean execution time
  median: number;                  // Median execution time
  standardDeviation: number;       // Standard deviation
  min: number;                     // Minimum execution time
  max: number;                     // Maximum execution time

  // Benchmark Metadata
  iterations: number;              // Number of iterations
  warmupIterations?: number;       // Warmup iterations
  executionTime: number;           // Total execution time (ms)
  throughput?: number;             // Operations per second

  // Quality Assessment
  status: BenchmarkStatus;         // Benchmark status
  reliability: number;             // Benchmark reliability (0-1)
  consistency: number;             // Result consistency (0-1)

  // Analysis
  outliers: number[];              // Outlier values
  distribution: {
    p50: number;                   // 50th percentile
    p95: number;                   // 95th percentile
    p99: number;                   // 99th percentile
  };

  // Recommendations
  recommendations?: string[];      // Performance recommendations
}
```

### MemoryAnalysis

Memory usage analysis result.

```typescript
interface MemoryAnalysis {
  // Overall Memory Stats
  totalAllocated: number;          // Total allocated memory (bytes)
  totalUsed: number;               // Total used memory (bytes)
  totalAvailable: number;          // Total available memory (bytes)
  usagePercentage: number;         // Memory usage percentage

  // Heap Memory
  heapUsage: number;               // Heap memory usage (bytes)
  heapTotal: number;               // Total heap size (bytes)
  heapLimit: number;               // Heap size limit (bytes)
  externalMemory: number;          // External memory usage (bytes)

  // Process Memory
  rss: number;                     // Resident set size (bytes)
  vsz?: number;                    // Virtual memory size (bytes)

  // Memory Segments
  segments: MemorySegment[];       // Memory segment breakdown

  // Leak Detection
  leaks: MemoryLeak[];             // Detected memory leaks
  potentialLeaks: MemoryLeak[];    // Potential memory leaks
  leakGrowthRate: number;          // Memory leak growth rate

  // Garbage Collection
  garbageCollection: GCStats;      // Garbage collection statistics

  // Fragmentation
  fragmentation: number;           // Memory fragmentation percentage
  largestFreeBlock?: number;       // Largest free memory block

  // Recommendations
  recommendations: string[];       // Memory optimization recommendations
}
```

## Configuration Types

### SecurityConfig

Security service configuration.

```typescript
interface SecurityConfig {
  // Analysis settings
  riskThreshold: number;           // Risk detection threshold (0-1)
  confidenceThreshold: number;     // Minimum confidence for results (0-1)
  maxProcessingTime: number;      // Maximum processing time (ms)

  // NLP settings
  enableAdvancedNLP: boolean;      // Enable advanced NLP features
  languageModels: string[];        // Supported language models
  customDictionaries: string[];    // Custom domain dictionaries

  // Caching settings
  cacheEnabled: boolean;           // Enable result caching
  cacheTTL: number;               // Cache time-to-live (ms)
  maxCacheSize: number;           // Maximum cache size (MB)

  // Monitoring settings
  enablePerformanceMonitoring: boolean;
  monitoringInterval: number;     // Monitoring interval (ms)
  alertThresholds: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}
```

### IdentityProviderConfig

Identity provider configuration.

```typescript
interface IdentityProviderConfig {
  // Authentication settings
  sessionTimeout: number;          // Session timeout in milliseconds
  tokenExpiration: number;         // Token expiration in milliseconds
  refreshTokenExpiration: number;  // Refresh token expiration
  maxFailedAttempts: number;       // Maximum failed login attempts
  lockoutDuration: number;         // Account lockout duration

  // Risk assessment
  riskThreshold: number;           // Risk threshold (0-100)
  continuousAuthInterval: number;  // Continuous auth check interval
  highRiskActions: RiskAction[];   // Actions for high-risk scenarios

  // MFA settings
  mfaRequired: boolean;            // MFA requirement flag
  mfaMethods: MFAMethod[];         // Supported MFA methods
  mfaGracePeriod: number;          // MFA setup grace period

  // Security policies
  passwordPolicy: PasswordPolicy;  // Password requirements
  devicePolicy: DevicePolicy;      // Device management policy
  locationPolicy: LocationPolicy;  // Location-based policies

  // Monitoring
  auditEnabled: boolean;           // Security audit logging
  monitoringEnabled: boolean;      // Performance monitoring
  alertThresholds: AlertThresholds; // Alert configuration
}
```

### MonitoringConfig

Monitoring service configuration.

```typescript
interface MonitoringConfig {
  // Health check settings
  healthCheckInterval: number;    // Health check interval (ms)
  healthCheckTimeout: number;     // Health check timeout (ms)
  failureThreshold: number;       // Failure threshold for unhealthy status
  successThreshold: number;       // Success threshold for healthy status

  // Alert settings
  alertRetentionPeriod: number;   // Alert retention period (ms)
  alertEscalationEnabled: boolean; // Enable alert escalation
  alertEscalationLevels: EscalationLevel[]; // Escalation levels

  // Performance settings
  performanceRetentionPeriod: number; // Performance data retention (ms)
  performanceSamplingRate: number; // Performance sampling rate
  performanceAggregationInterval: number; // Data aggregation interval (ms)

  // Security settings
  securityEventRetentionPeriod: number; // Security event retention (ms)
  securityAlertThreshold: number; // Security alert threshold
  sensitiveDataMasking: boolean; // Mask sensitive data in logs

  // Notification settings
  notificationChannels: NotificationChannel[]; // Enabled notification channels
  notificationRetryAttempts: number; // Notification retry attempts
  notificationTimeout: number; // Notification timeout (ms)

  // Dashboard settings
  dashboardRefreshInterval: number; // Dashboard refresh interval (ms)
  dashboardDataRetention: number; // Dashboard data retention (ms)
  dashboardRealTimeEnabled: boolean; // Enable real-time updates
}
```

## Error Types

### BaseError

Base error class for all application errors.

```typescript
interface BaseError extends Error {
  readonly code: string;           // Error code
  readonly severity: ErrorSeverity; // Error severity
  readonly category: ErrorCategory; // Error category
  readonly context: ErrorContext;  // Error context
  readonly timestamp: Date;        // Error timestamp
  readonly isRecoverable: boolean; // Whether error is recoverable
  readonly recoveryStrategy?: RecoveryStrategy; // Recovery strategy
  readonly cause?: Error;          // Root cause error
  readonly correlationId?: string; // Correlation identifier
  readonly metadata?: Record<string, any>; // Additional metadata
}
```

### Specialized Errors

```typescript
// Authentication Errors
interface AuthenticationError extends BaseError {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly failureReason: AuthFailureReason;
  readonly attemptCount?: number;
}

// Authorization Errors
interface AuthorizationError extends BaseError {
  readonly userId: string;
  readonly resource: string;
  readonly action: string;
  readonly requiredPermissions: string[];
  readonly userPermissions: string[];
}

// Validation Errors
interface ValidationError extends BaseError {
  readonly field: string;
  readonly value: any;
  readonly rule: string;
  readonly expectedType?: string;
  readonly constraints?: Record<string, any>;
}

// Security Errors
interface SecurityError extends BaseError {
  readonly threatLevel: SecuritySeverity;
  readonly indicators: SecurityIndicator[];
  readonly mitigation?: MitigationAction[];
}

// Performance Errors
interface PerformanceError extends BaseError {
  readonly metric: string;
  readonly threshold: number;
  readonly currentValue: number;
  readonly impact: string;
}

// Optimization Errors
interface OptimizationError extends BaseError {
  readonly strategyId: string;
  readonly service: string;
  readonly failureReason: string;
  readonly recommendations?: string[];
}
```

## Utility Types

### TimeRange

Time range specification.

```typescript
interface TimeRange {
  start: Date;                    // Start timestamp
  end: Date;                      // End timestamp
  timezone?: string;              // Timezone for interpretation
  format?: string;                // Date format string
}
```

### GeoLocation

Geographic location information.

```typescript
interface GeoLocation {
  latitude: number;               // Latitude (-90 to 90)
  longitude: number;              // Longitude (-180 to 180)
  accuracy?: number;              // Location accuracy in meters
  altitude?: number;              // Altitude in meters
  heading?: number;               // Heading in degrees (0-360)
  speed?: number;                 // Speed in m/s

  // Address Information
  country?: string;               // Country name
  countryCode?: string;           // ISO country code
  region?: string;                // Region/state
  city?: string;                  // City name
  postalCode?: string;            // Postal code
  address?: string;               // Full address

  // Metadata
  source: LocationSource;         // Location source
  timestamp: Date;                // Location timestamp
  confidence?: number;            // Location confidence (0-1)
}
```

### DeviceInfo

Device identification information.

```typescript
interface DeviceInfo {
  id: string;                     // Unique device identifier
  type: DeviceType;               // Device type
  platform: PlatformType;         // Platform/OS
  browser?: BrowserInfo;          // Browser information
  screen: ScreenInfo;             // Screen information
  hardware: HardwareInfo;         // Hardware information

  // Security
  fingerprint: string;            // Device fingerprint
  trusted: boolean;               // Trusted device flag
  lastVerified?: Date;            // Last verification timestamp

  // Network
  ipAddress: string;              // Current IP address
  macAddress?: string;            // MAC address
  networkInterfaces: NetworkInterface[]; // Network interfaces

  // Metadata
  firstSeen: Date;                // First seen timestamp
  lastSeen: Date;                 // Last seen timestamp
  userAgent: string;              // User agent string
}
```

### NetworkInfo

Network connection information.

```typescript
interface NetworkInfo {
  type: NetworkType;              // Network type
  speed: NetworkSpeed;            // Connection speed
  latency: number;                // Network latency (ms)
  jitter?: number;                // Network jitter (ms)

  // Connection Details
  ipAddress: string;              // Public IP address
  isp?: string;                   // Internet service provider
  asn?: string;                   // Autonomous system number
  country?: string;               // Country code

  // Security
  vpn: boolean;                   // VPN usage detected
  proxy: boolean;                 // Proxy usage detected
  tor: boolean;                   // Tor usage detected

  // Quality Metrics
  packetLoss?: number;            // Packet loss percentage
  bandwidth?: {
    download: number;             // Download bandwidth (Mbps)
    upload: number;              // Upload bandwidth (Mbps)
  };

  // Metadata
  timestamp: Date;                // Measurement timestamp
  location?: GeoLocation;         // Geographic location
}
```

### AuditEntry

Audit log entry.

```typescript
interface AuditEntry {
  id: string;                     // Unique audit entry identifier
  timestamp: Date;                // Entry timestamp
  action: AuditAction;            // Action performed
  actor: AuditActor;              // Action performer
  resource: AuditResource;        // Affected resource
  context: AuditContext;          // Action context

  // Change Tracking
  before?: Record<string, any>;   // State before action
  after?: Record<string, any>;    // State after action
  changes?: AuditChange[];        // Specific changes made

  // Security Context
  ipAddress: string;              // Actor IP address
  userAgent: string;              // Actor user agent
  sessionId?: string;             // Actor session ID
  location?: GeoLocation;         // Actor location

  // Compliance
  compliance?: ComplianceInfo;    // Compliance information
  retention?: number;             // Retention period (days)
  classification: DataClassification; // Data classification

  // Metadata
  correlationId?: string;         // Correlation identifier
  tags: string[];                 // Audit entry tags
  metadata?: Record<string, any>; // Additional metadata
}
```

## Enums and Constants

### Security Enums

```typescript
enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum ThreatType {
  MALWARE = 'malware',
  PHISHING = 'phishing',
  BRUTE_FORCE = 'brute_force',
  INSIDER_THREAT = 'insider_threat',
  DATA_EXFILTRATION = 'data_exfiltration',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DENIAL_OF_SERVICE = 'denial_of_service'
}

enum AnomalyType {
  BEHAVIORAL = 'behavioral',
  TRAFFIC = 'traffic',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  SYSTEM_RESOURCE = 'system_resource'
}
```

### Status Enums

```typescript
enum HealthState {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
  MAINTENANCE = 'maintenance'
}

enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed'
}
```

### Authentication Enums

```typescript
enum AuthMethod {
  PASSWORD = 'password',
  MFA = 'mfa',
  BIOMETRIC = 'biometric',
  CERTIFICATE = 'certificate',
  SSO = 'sso',
  SOCIAL = 'social'
}

enum MFAMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  HARDWARE = 'hardware',
  PUSH = 'push'
}

enum SessionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended'
}
```

### Performance Enums

```typescript
enum BenchmarkStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor',
  CRITICAL = 'critical'
}

enum OperationType {
  DATABASE = 'database',
  NETWORK = 'network',
  COMPUTATION = 'computation',
  IO = 'io',
  EXTERNAL_API = 'external_api',
  CACHE = 'cache'
}
```

This comprehensive TypeScript types documentation provides detailed specifications for all interfaces, enums, and type definitions used throughout the Secure Flow Automaton platform. Each type includes:

- Detailed property descriptions
- Usage context and relationships
- Optional vs required properties
- Type constraints and validations
- Example usage patterns
- Integration points with other types

The types are organized by functional area (Security, Identity, Monitoring, Performance, etc.) to facilitate easy navigation and understanding of the system's data structures.
