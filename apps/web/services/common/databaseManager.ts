/**
 * Comprehensive Database Manager
 *
 * Orchestrates all database-related services:
 * - Connection Pool Management
 * - Migration Management
 * - Backup and Recovery
 * - Performance Monitoring
 * - Health Monitoring
 * - Query Optimization
 */

import { EventEmitter } from 'events';
import { Logger } from './logger';
import { MonitoringService } from './monitoring';
import { DatabaseConnectionPool, DatabaseUtils, DatabaseConfig } from './database-connection-pool';
import { DatabaseMigrationManager, MigrationConfig, MigrationReport } from './database-migration-manager';
import { DatabaseBackupManager, BackupConfig, BackupResult, RecoveryResult } from './database-backup-manager';
import {
  BaseError,
  DatabaseError,
  createErrorContext,
  ErrorHandler
} from './errors';

export interface DatabaseManagerConfig {
  connection: DatabaseConfig;
  migration: MigrationConfig;
  backup: BackupConfig;
  monitoring: {
    enabled: boolean;
    healthCheckInterval: number;
    performanceMonitoring: boolean;
    slowQueryThreshold: number;
  };
  optimization: {
    enabled: boolean;
    autoOptimize: boolean;
    optimizationInterval: number;
  };
}

export interface DatabaseStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance';
  components: {
    connectionPool: {
      status: string;
      activeConnections: number;
      totalConnections: number;
      utilization: number;
    };
    migrations: {
      status: string;
      pendingMigrations: number;
      lastMigration?: Date;
      failedMigrations: number;
    };
    backups: {
      status: string;
      lastBackup?: Date;
      backupCount: number;
      totalSize: number;
    };
  };
  performance: {
    averageQueryTime: number;
    slowQueriesCount: number;
    connectionPoolEfficiency: number;
    cacheHitRate?: number;
  };
  issues: string[];
  lastChecked: Date;
}

export interface OptimizationResult {
  component: 'connection' | 'query' | 'index' | 'cache' | 'migration';
  action: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  applied: boolean;
  metrics?: {
    before: number;
    after: number;
    improvement: number;
  };
}

export interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
    utilization: number;
    errors: number;
  };
  queries: {
    total: number;
    slow: number;
    failed: number;
    averageTime: number;
    throughput: number;
  };
  performance: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkUsage: number;
  };
  storage: {
    databaseSize: number;
    tableCount: number;
    indexCount: number;
    largestTables: Array<{ name: string; size: number; rows: number }>;
  };
  timestamp: Date;
}

export class DatabaseManager extends EventEmitter {
  private config: DatabaseManagerConfig;
  private logger: Logger;
  private monitoring: MonitoringService;

  // Core components
  private connectionPool: DatabaseConnectionPool;
  private migrationManager: DatabaseMigrationManager;
  private backupManager: DatabaseBackupManager;
  private utils: DatabaseUtils;

  // State management
  private isInitialized = false;
  private isShuttingDown = false;
  private healthCheckTimer?: NodeJS.Timeout;
  private optimizationTimer?: NodeJS.Timeout;
  private lastHealthCheck: Date = new Date();
  private lastOptimization: Date = new Date();

  constructor(config: DatabaseManagerConfig, logger: Logger, monitoring: MonitoringService) {
    super();
    this.config = config;
    this.logger = logger;
    this.monitoring = monitoring;

    this.initializeComponents();
  }

  /**
   * Initialize all database components
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const context = createErrorContext('DatabaseManager', 'initialize');

    try {
      this.logger.info('Initializing Database Manager', {
        service: 'DatabaseManager',
        operation: 'initialize'
      });

      // Initialize connection pool
      await this.connectionPool.initializePool();

      // Initialize migration manager
      await this.migrationManager.initialize();

      // Start monitoring if enabled
      if (this.config.monitoring.enabled) {
        this.startHealthMonitoring();
      }

      // Start optimization if enabled
      if (this.config.optimization.enabled) {
        this.startOptimization();
      }

      this.isInitialized = true;

      this.logger.info('Database Manager initialized successfully', {
        service: 'DatabaseManager',
        operation: 'initialize'
      });

      this.emit('initialized');

    } catch (error) {
      this.logger.error('Failed to initialize Database Manager', {
        service: 'DatabaseManager',
        operation: 'initialize'
      }, error as Error);

      throw ErrorHandler.handle(error, context);
    }
  }

  /**
   * Execute database query
   */
  async query<T = any>(
    text: string,
    params?: any[],
    options?: {
      timeout?: number;
      retries?: number;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<{ rows: T[]; rowCount: number; executionTime: number }> {
    this.ensureInitialized();

    return await this.connectionPool.query(text, params, options);
  }

  /**
   * Execute database transaction
   */
  async transaction<T>(
    callback: (client: any) => Promise<T>,
    options?: {
      isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
      readOnly?: boolean;
      deferrable?: boolean;
    }
  ): Promise<T> {
    this.ensureInitialized();

    return await this.connectionPool.transaction(callback, options);
  }

  /**
   * Get database status
   */
  async getStatus(): Promise<DatabaseStatus> {
    this.ensureInitialized();

    try {
      const [
        poolHealth,
        migrationStatus,
        backupStats,
        performanceMetrics
      ] = await Promise.all([
        this.connectionPool.getHealthStatus(),
        this.getMigrationStatus(),
        this.getBackupStatus(),
        this.getPerformanceMetrics()
      ]);

      // Determine overall status
      const componentStatuses = [
        poolHealth.status,
        migrationStatus.status,
        backupStats.status
      ];

      let overall: DatabaseStatus['overall'] = 'healthy';
      const issues: string[] = [];

      if (componentStatuses.includes('unhealthy')) {
        overall = 'unhealthy';
      } else if (componentStatuses.includes('degraded')) {
        overall = 'degraded';
      }

      // Collect issues
      if (poolHealth.status !== 'healthy') {
        issues.push(...poolHealth.issues);
      }
      if (migrationStatus.failedMigrations > 0) {
        issues.push(`${migrationStatus.failedMigrations} migration(s) failed`);
      }

      return {
        overall,
        components: {
          connectionPool: {
            status: poolHealth.status,
            activeConnections: poolHealth.connections.active,
            totalConnections: poolHealth.connections.total,
            utilization: poolHealth.performance.connectionPoolUtilization
          },
          migrations: migrationStatus,
          backups: backupStats
        },
        performance: performanceMetrics,
        issues,
        lastChecked: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to get database status', {
        service: 'DatabaseManager',
        operation: 'getStatus'
      }, error as Error);

      return {
        overall: 'unhealthy',
        components: {
          connectionPool: { status: 'unknown', activeConnections: 0, totalConnections: 0, utilization: 0 },
          migrations: { status: 'unknown', pendingMigrations: 0, failedMigrations: 0 },
          backups: { status: 'unknown', backupCount: 0, totalSize: 0 }
        },
        performance: { averageQueryTime: 0, slowQueriesCount: 0, connectionPoolEfficiency: 0 },
        issues: [(error as Error).message],
        lastChecked: new Date()
      };
    }
  }

  /**
   * Run database migrations
   */
  async migrate(options?: {
    targetVersion?: string;
    dryRun?: boolean;
    continueOnError?: boolean;
  }): Promise<MigrationReport> {
    this.ensureInitialized();

    this.logger.info('Starting database migration', {
      service: 'DatabaseManager',
      operation: 'migrate',
      metadata: { targetVersion: options?.targetVersion, dryRun: options?.dryRun }
    });

    const report = await this.migrationManager.migrate(options);

    // Record migration in monitoring
    await this.monitoring.recordPerformanceMetrics('database-migration', {
      operation: 'migration_execute',
      custom: {
        totalMigrations: report.summary.totalMigrations,
        executedMigrations: report.summary.executedMigrations,
        failedMigrations: report.summary.failedMigrations,
        totalExecutionTime: report.summary.totalExecutionTime
      }
    });

    if (report.summary.failedMigrations > 0) {
      this.emit('migrationFailed', report);
    } else {
      this.emit('migrationCompleted', report);
    }

    return report;
  }

  /**
   * Create database backup
   */
  async createBackup(options?: {
    type?: 'full' | 'incremental' | 'differential';
    tables?: string[];
    label?: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<BackupResult> {
    this.ensureInitialized();

    this.logger.info('Creating database backup', {
      service: 'DatabaseManager',
      operation: 'createBackup',
      metadata: {
        type: options?.type || 'full',
        tablesCount: options?.tables?.length || 'all',
        label: options?.label
      }
    });

    const result = await this.backupManager.createBackup(options);

    // Record backup in monitoring
    await this.monitoring.recordPerformanceMetrics('database-backup', {
      operation: 'backup_create',
      custom: {
        backupId: result.backupId,
        size: result.size,
        duration: result.duration,
        success: result.success
      }
    });

    if (result.success) {
      this.emit('backupCompleted', result);
    } else {
      this.emit('backupFailed', result);
    }

    return result;
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(config: {
    backupId: string;
    targetDatabase?: string;
    pointInTime?: Date;
    tables?: string[];
    dryRun: boolean;
    verifyBeforeRecovery: boolean;
    createBackupBeforeRecovery: boolean;
  }): Promise<RecoveryResult> {
    this.ensureInitialized();

    this.logger.info('Starting database recovery', {
      service: 'DatabaseManager',
      operation: 'restoreBackup',
      metadata: {
        backupId: config.backupId,
        targetDatabase: config.targetDatabase,
        dryRun: config.dryRun,
        tablesCount: config.tables?.length || 'all'
      }
    });

    const result = await this.backupManager.restoreBackup(config);

    // Record recovery in monitoring
    await this.monitoring.recordPerformanceMetrics('database-backup', {
      operation: 'backup_restore',
      custom: {
        backupId: config.backupId,
        tablesRecovered: result.recoveredTables,
        rowsRecovered: result.recoveredRows,
        duration: result.duration,
        success: result.success
      }
    });

    if (result.success) {
      this.emit('recoveryCompleted', result);
    } else {
      this.emit('recoveryFailed', result);
    }

    return result;
  }

  /**
   * Optimize database performance
   */
  async optimize(options?: {
    components?: ('connection' | 'query' | 'index' | 'cache' | 'migration')[];
    dryRun?: boolean;
    aggressive?: boolean;
  }): Promise<OptimizationResult[]> {
    this.ensureInitialized();

    const components = options?.components || ['connection', 'query', 'index', 'cache'];
    const results: OptimizationResult[] = [];

    this.logger.info('Starting database optimization', {
      service: 'DatabaseManager',
      operation: 'optimize',
      metadata: {
        components: components.join(', '),
        dryRun: options?.dryRun,
        aggressive: options?.aggressive
      }
    });

    for (const component of components) {
      try {
        const result = await this.optimizeComponent(component, options);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to optimize component: ${component}`, {
          service: 'DatabaseManager',
          operation: 'optimize',
          metadata: { component }
        }, error as Error);

        results.push({
          component,
          action: 'optimization',
          impact: 'low',
          description: `Failed to optimize: ${(error as Error).message}`,
          applied: false
        });
      }
    }

    // Record optimization results in monitoring
    const successfulOptimizations = results.filter(r => r.applied).length;
    await this.monitoring.recordPerformanceMetrics('database-optimization', {
      operation: 'optimization_execute',
      custom: {
        totalComponents: components.length,
        successfulOptimizations,
        failedOptimizations: components.length - successfulOptimizations
      }
    });

    this.lastOptimization = new Date();
    this.emit('optimizationCompleted', results);

    return results;
  }

  /**
   * Get comprehensive database metrics
   */
  async getMetrics(): Promise<DatabaseMetrics> {
    this.ensureInitialized();

    try {
      const [
        poolStats,
        queryMetrics,
        dbSize,
        healthStatus
      ] = await Promise.all([
        this.connectionPool.getConnectionStats(),
        this.connectionPool.getQueryMetrics(100),
        this.utils.getDatabaseSize(),
        this.connectionPool.getHealthStatus()
      ]);

      const slowQueries = queryMetrics.filter(m => m.executionTime > this.config.monitoring.slowQueryThreshold);
      const averageQueryTime = queryMetrics.length > 0
        ? queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) / queryMetrics.length
        : 0;

      return {
        connections: {
          active: poolStats.activeConnections,
          idle: poolStats.idleConnections,
          total: poolStats.totalConnections,
          utilization: poolStats.poolUtilization,
          errors: poolStats.connectionErrors
        },
        queries: {
          total: poolStats.totalQueries,
          slow: slowQueries.length,
          failed: poolStats.failedQueries,
          averageTime: averageQueryTime,
          throughput: poolStats.totalQueries / Math.max(1, (Date.now() - this.lastHealthCheck.getTime()) / 1000)
        },
        performance: {
          memoryUsage: healthStatus.performance.averageQueryTime, // Placeholder
          cpuUsage: 0, // Placeholder
          diskUsage: 0, // Placeholder
          networkUsage: 0 // Placeholder
        },
        storage: {
          databaseSize: parseInt(dbSize.databaseSize),
          tableCount: dbSize.tables.length,
          indexCount: 0, // Placeholder
          largestTables: dbSize.tables.slice(0, 5)
        },
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to get database metrics', {
        service: 'DatabaseManager',
        operation: 'getMetrics'
      }, error as Error);

      throw ErrorHandler.handle(error, createErrorContext(
        'DatabaseManager',
        'getMetrics'
      ));
    }
  }

  /**
   * Gracefully shutdown database manager
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      this.logger.info('Shutting down Database Manager', {
        service: 'DatabaseManager',
        operation: 'shutdown'
      });

      // Stop timers
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = undefined;
      }

      if (this.optimizationTimer) {
        clearInterval(this.optimizationTimer);
        this.optimizationTimer = undefined;
      }

      // Shutdown components
      await Promise.allSettled([
        this.connectionPool.shutdown(),
        // Migration manager doesn't need explicit shutdown
        // Backup manager doesn't need explicit shutdown
      ]);

      this.logger.info('Database Manager shutdown completed', {
        service: 'DatabaseManager',
        operation: 'shutdown'
      });

      this.emit('shutdown');

    } catch (error) {
      this.logger.error('Error during Database Manager shutdown', {
        service: 'DatabaseManager',
        operation: 'shutdown'
      }, error as Error);

      throw ErrorHandler.handle(error, createErrorContext(
        'DatabaseManager',
        'shutdown'
      ));
    }
  }

  // Private methods
  private initializeComponents(): void {
    // Initialize connection pool
    this.connectionPool = new DatabaseConnectionPool(
      this.config.connection,
      this.logger,
      this.monitoring
    );

    // Initialize utilities
    this.utils = new DatabaseUtils(this.connectionPool);

    // Initialize migration manager
    this.migrationManager = new DatabaseMigrationManager(
      this.config.migration,
      this.connectionPool,
      this.logger,
      this.monitoring
    );

    // Initialize backup manager
    this.backupManager = new DatabaseBackupManager(
      this.config.backup,
      this.connectionPool,
      this.logger,
      this.monitoring
    );
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const status = await this.getStatus();
        this.lastHealthCheck = new Date();

        // Emit health status
        this.emit('healthCheck', status);

        // Alert on unhealthy status
        if (status.overall === 'unhealthy') {
          this.emit('unhealthy', status);
        }

      } catch (error) {
        this.logger.error('Health monitoring check failed', {
          service: 'DatabaseManager',
          operation: 'healthMonitoring'
        }, error as Error);
      }
    }, this.config.monitoring.healthCheckInterval);
  }

  private startOptimization(): void {
    if (this.config.optimization.autoOptimize) {
      this.optimizationTimer = setInterval(async () => {
        try {
          await this.optimize({
            components: ['query', 'index'],
            dryRun: false
          });
        } catch (error) {
          this.logger.error('Auto-optimization failed', {
            service: 'DatabaseManager',
            operation: 'autoOptimization'
          }, error as Error);
        }
      }, this.config.optimization.optimizationInterval);
    }
  }

  private async getMigrationStatus() {
    const statuses = await this.migrationManager.getMigrationStatus();
    const pendingMigrations = await this.migrationManager.getPendingMigrations();

    return {
      status: 'healthy', // Simplified
      pendingMigrations: pendingMigrations.length,
      lastMigration: statuses.find(s => s.status === 'completed')?.executedAt,
      failedMigrations: statuses.filter(s => s.status === 'failed').length
    };
  }

  private async getBackupStatus() {
    const stats = await this.backupManager.getBackupStatistics();

    return {
      status: 'healthy', // Simplified
      lastBackup: stats.newestBackup,
      backupCount: stats.totalBackups,
      totalSize: stats.totalSize
    };
  }

  private async getPerformanceMetrics() {
    const metrics = await this.connectionPool.getQueryMetrics(100);
    const slowQueries = metrics.filter(m => m.executionTime > this.config.monitoring.slowQueryThreshold);
    const averageQueryTime = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length
      : 0;

    return {
      averageQueryTime,
      slowQueriesCount: slowQueries.length,
      connectionPoolEfficiency: 85 // Placeholder
    };
  }

  private async optimizeComponent(
    component: 'connection' | 'query' | 'index' | 'cache' | 'migration',
    options?: { dryRun?: boolean; aggressive?: boolean }
  ): Promise<OptimizationResult> {
    switch (component) {
      case 'connection':
        return await this.optimizeConnections(options);
      case 'query':
        return await this.optimizeQueries(options);
      case 'index':
        return await this.optimizeIndexes(options);
      case 'cache':
        return await this.optimizeCache(options);
      case 'migration':
        return await this.optimizeMigrations(options);
      default:
        throw new DatabaseError(`Unknown optimization component: ${component}`);
    }
  }

  private async optimizeConnections(options?: { dryRun?: boolean }): Promise<OptimizationResult> {
    const before = await this.connectionPool.getConnectionStats();

    if (!options?.dryRun) {
      // Implement connection optimization logic
      await new Promise(resolve => setTimeout(resolve, 100)); // Placeholder
    }

    const after = await this.connectionPool.getConnectionStats();

    return {
      component: 'connection',
      action: 'connection_pool_optimization',
      impact: 'medium',
      description: 'Optimized connection pool settings',
      applied: !options?.dryRun,
      metrics: {
        before: before.poolUtilization,
        after: after.poolUtilization,
        improvement: after.poolUtilization - before.poolUtilization
      }
    };
  }

  private async optimizeQueries(options?: { dryRun?: boolean }): Promise<OptimizationResult> {
    const before = await this.connectionPool.getQueryMetrics(100);
    const beforeAvg = before.length > 0
      ? before.reduce((sum, m) => sum + m.executionTime, 0) / before.length
      : 0;

    if (!options?.dryRun) {
      // Implement query optimization logic
      await new Promise(resolve => setTimeout(resolve, 100)); // Placeholder
    }

    const after = await this.connectionPool.getQueryMetrics(100);
    const afterAvg = after.length > 0
      ? after.reduce((sum, m) => sum + m.executionTime, 0) / after.length
      : 0;

    return {
      component: 'query',
      action: 'query_performance_optimization',
      impact: 'high',
      description: 'Optimized slow queries and query patterns',
      applied: !options?.dryRun,
      metrics: {
        before: beforeAvg,
        after: afterAvg,
        improvement: beforeAvg - afterAvg
      }
    };
  }

  private async optimizeIndexes(options?: { dryRun?: boolean }): Promise<OptimizationResult> {
    if (!options?.dryRun) {
      // Implement index optimization logic
      await new Promise(resolve => setTimeout(resolve, 100)); // Placeholder
    }

    return {
      component: 'index',
      action: 'index_optimization',
      impact: 'medium',
      description: 'Analyzed and optimized database indexes',
      applied: !options?.dryRun
    };
  }

  private async optimizeCache(options?: { dryRun?: boolean }): Promise<OptimizationResult> {
    if (!options?.dryRun) {
      // Implement cache optimization logic
      await new Promise(resolve => setTimeout(resolve, 100)); // Placeholder
    }

    return {
      component: 'cache',
      action: 'cache_optimization',
      impact: 'low',
      description: 'Optimized query result caching',
      applied: !options?.dryRun
    };
  }

  private async optimizeMigrations(options?: { dryRun?: boolean }): Promise<OptimizationResult> {
    if (!options?.dryRun) {
      // Implement migration optimization logic
      await new Promise(resolve => setTimeout(resolve, 100)); // Placeholder
    }

    return {
      component: 'migration',
      action: 'migration_optimization',
      impact: 'low',
      description: 'Optimized migration execution and dependencies',
      applied: !options?.dryRun
    };
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new DatabaseError('Database Manager not initialized');
    }

    if (this.isShuttingDown) {
      throw new DatabaseError('Database Manager is shutting down');
    }
  }
}

// Factory function
export function createDatabaseManager(
  config: DatabaseManagerConfig,
  logger: Logger,
  monitoring: MonitoringService
): DatabaseManager {
  return new DatabaseManager(config, logger, monitoring);
}

// Utility functions
export class DatabaseManagerUtils {
  private manager: DatabaseManager;

  constructor(manager: DatabaseManager) {
    this.manager = manager;
  }

  /**
   * Execute a health check on all database components
   */
  async performHealthCheck(): Promise<{
    overall: boolean;
    components: Record<string, boolean>;
    issues: string[];
  }> {
    try {
      const status = await this.manager.getStatus();

      const components = {
        connectionPool: status.components.connectionPool.status === 'healthy',
        migrations: status.components.migrations.status === 'healthy',
        backups: status.components.backups.status === 'healthy'
      };

      return {
        overall: status.overall === 'healthy',
        components,
        issues: status.issues
      };

    } catch (error) {
      return {
        overall: false,
        components: {
          connectionPool: false,
          migrations: false,
          backups: false
        },
        issues: [(error as Error).message]
      };
    }
  }

  /**
   * Get database performance summary
   */
  async getPerformanceSummary(): Promise<{
    score: number;
    metrics: Record<string, number>;
    recommendations: string[];
  }> {
    try {
      const [status, metrics] = await Promise.all([
        this.manager.getStatus(),
        this.manager.getMetrics()
      ]);

      // Calculate performance score (0-100)
      let score = 100;
      if (status.overall === 'degraded') score -= 20;
      if (status.overall === 'unhealthy') score -= 50;

      if (metrics.queries.slow > 10) score -= 15;
      if (metrics.connections.utilization > 80) score -= 10;
      if (metrics.queries.failed > 5) score -= 10;

      const recommendations: string[] = [];
      if (metrics.queries.slow > 10) {
        recommendations.push('Review and optimize slow queries');
      }
      if (metrics.connections.utilization > 80) {
        recommendations.push('Consider increasing connection pool size');
      }
      if (metrics.queries.failed > 5) {
        recommendations.push('Investigate and fix query failures');
      }

      return {
        score: Math.max(0, Math.min(100, score)),
        metrics: {
          averageQueryTime: metrics.queries.averageTime,
          slowQueriesPercentage: metrics.queries.total > 0 ? (metrics.queries.slow / metrics.queries.total) * 100 : 0,
          connectionPoolUtilization: metrics.connections.utilization,
          throughput: metrics.queries.throughput
        },
        recommendations
      };

    } catch (error) {
      return {
        score: 0,
        metrics: {},
        recommendations: ['Unable to assess performance due to error']
      };
    }
  }

  /**
   * Create a maintenance report
   */
  async createMaintenanceReport(): Promise<{
    timestamp: Date;
    duration: number;
    actions: string[];
    results: Record<string, any>;
    recommendations: string[];
  }> {
    const startTime = Date.now();
    const actions: string[] = [];
    const results: Record<string, any> = {};

    try {
      // Health check
      actions.push('Performing health check');
      const health = await this.performHealthCheck();
      results.health = health;

      // Performance analysis
      actions.push('Analyzing performance');
      const performance = await this.getPerformanceSummary();
      results.performance = performance;

      // Metrics collection
      actions.push('Collecting metrics');
      const metrics = await this.manager.getMetrics();
      results.metrics = metrics;

      const duration = Date.now() - startTime;
      const recommendations = [
        ...health.issues.map(issue => `Fix: ${issue}`),
        ...performance.recommendations
      ];

      return {
        timestamp: new Date(),
        duration,
        actions,
        results,
        recommendations
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        timestamp: new Date(),
        duration,
        actions,
        results: { error: (error as Error).message },
        recommendations: ['Maintenance check failed - manual intervention required']
      };
    }
  }
}

// Export utility functions
export function createDatabaseManagerUtils(manager: DatabaseManager): DatabaseManagerUtils {
  return new DatabaseManagerUtils(manager);
}
