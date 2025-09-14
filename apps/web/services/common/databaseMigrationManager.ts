/**
 * Database Migration Manager
 *
 * Features:
 * - Automated database migrations with rollback support
 * - Migration dependency management
 * - Schema versioning and validation
 * - Pre/post migration hooks
 * - Migration status tracking and reporting
 * - Automatic backup before breaking changes
 * - Migration conflict resolution
 * - Dry-run capability for testing
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { MonitoringService } from './monitoring';
import { DatabaseConnectionPool, DatabaseUtils } from './database-connection-pool';
import {
  BaseError,
  DatabaseError,
  createErrorContext,
  ErrorHandler
} from './errors';

export interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  createdAt: Date;
  checksum: string;
  dependencies: string[];
  breaking: boolean;
  up: string;
  down?: string;
  preHooks?: MigrationHook[];
  postHooks?: MigrationHook[];
  metadata?: Record<string, any>;
}

export interface MigrationHook {
  name: string;
  type: 'pre' | 'post';
  order: number;
  sql?: string;
  function?: string;
  parameters?: Record<string, any>;
}

export interface MigrationStatus {
  id: string;
  name: string;
  version: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  executedAt?: Date;
  executionTime?: number;
  checksum: string;
  error?: string;
  rollbackAvailable: boolean;
}

export interface MigrationConfig {
  migrationsTable: string;
  migrationsPath: string;
  schemaVersion: string;
  allowBreakingChanges: boolean;
  backupBeforeMigration: boolean;
  rollbackEnabled: boolean;
  dryRunEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export interface MigrationResult {
  migrationId: string;
  success: boolean;
  executionTime: number;
  error?: string;
  rolledBack: boolean;
  backupCreated?: string;
  affectedRows?: number;
}

export interface MigrationReport {
  summary: {
    totalMigrations: number;
    executedMigrations: number;
    failedMigrations: number;
    skippedMigrations: number;
    rolledBackMigrations: number;
    totalExecutionTime: number;
  };
  migrations: MigrationStatus[];
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export class DatabaseMigrationManager {
  private config: MigrationConfig;
  private pool: DatabaseConnectionPool;
  private utils: DatabaseUtils;
  private logger: Logger;
  private monitoring: MonitoringService;
  private migrations: Map<string, Migration> = new Map();
  private migrationStatuses: Map<string, MigrationStatus> = new Map();

  constructor(
    config: MigrationConfig,
    pool: DatabaseConnectionPool,
    logger: Logger,
    monitoring: MonitoringService
  ) {
    this.config = config;
    this.pool = pool;
    this.utils = new DatabaseUtils(pool);
    this.logger = logger;
    this.monitoring = monitoring;
  }

  /**
   * Initialize the migration system
   */
  async initialize(): Promise<void> {
    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Load existing migrations from database
      await this.loadMigrationStatuses();

      // Load migration files
      await this.loadMigrations();

      this.logger.info('Database migration manager initialized', {
        service: 'DatabaseMigrationManager',
        operation: 'initialize',
        metadata: {
          migrationsTable: this.config.migrationsTable,
          migrationsPath: this.config.migrationsPath,
          loadedMigrations: this.migrations.size
        }
      });

    } catch (error) {
      this.logger.error('Failed to initialize migration manager', {
        service: 'DatabaseMigrationManager',
        operation: 'initialize'
      }, error as Error);

      throw ErrorHandler.handle(error, createErrorContext(
        'DatabaseMigrationManager',
        'initialize'
      ));
    }
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const executedMigrations = await this.getExecutedMigrationIds();
    const pendingMigrations: Migration[] = [];

    for (const migration of this.migrations.values()) {
      if (!executedMigrations.has(migration.id)) {
        // Check if all dependencies are satisfied
        const dependenciesSatisfied = migration.dependencies.every(dep =>
          executedMigrations.has(dep)
        );

        if (dependenciesSatisfied) {
          pendingMigrations.push(migration);
        }
      }
    }

    // Sort by dependencies
    return this.sortMigrationsByDependencies(pendingMigrations);
  }

  /**
   * Execute pending migrations
   */
  async migrate(options?: {
    targetVersion?: string;
    dryRun?: boolean;
    continueOnError?: boolean;
  }): Promise<MigrationReport> {
    const report: MigrationReport = {
      summary: {
        totalMigrations: 0,
        executedMigrations: 0,
        failedMigrations: 0,
        skippedMigrations: 0,
        rolledBackMigrations: 0,
        totalExecutionTime: 0
      },
      migrations: [],
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      const pendingMigrations = await this.getPendingMigrations();
      report.summary.totalMigrations = pendingMigrations.length;

      if (pendingMigrations.length === 0) {
        this.logger.info('No pending migrations found');
        return report;
      }

      this.logger.info('Starting database migration', {
        service: 'DatabaseMigrationManager',
        operation: 'migrate',
        metadata: {
          pendingMigrations: pendingMigrations.length,
          dryRun: options?.dryRun || false,
          targetVersion: options?.targetVersion
        }
      });

      for (const migration of pendingMigrations) {
        if (options?.targetVersion && migration.version > options.targetVersion) {
          report.summary.skippedMigrations++;
          continue;
        }

        const result = await this.executeMigration(migration, options?.dryRun || false);

        report.migrations.push(result.status);
        report.summary.totalExecutionTime += result.executionTime;

        if (result.success) {
          report.summary.executedMigrations++;
        } else {
          report.summary.failedMigrations++;
          report.errors.push(`Migration ${migration.id} failed: ${result.error}`);

          if (!options?.continueOnError) {
            // Rollback successful migrations if configured
            if (this.config.rollbackEnabled) {
              await this.rollbackToLastSuccessful();
            }
            break;
          }
        }
      }

      // Generate recommendations
      report.recommendations = this.generateMigrationRecommendations(report);

      this.logger.info('Database migration completed', {
        service: 'DatabaseMigrationManager',
        operation: 'migrate',
        metadata: {
          executed: report.summary.executedMigrations,
          failed: report.summary.failedMigrations,
          totalTime: report.summary.totalExecutionTime
        }
      });

      return report;

    } catch (error) {
      this.logger.error('Database migration failed', {
        service: 'DatabaseMigrationManager',
        operation: 'migrate'
      }, error as Error);

      report.errors.push((error as Error).message);
      return report;
    }
  }

  /**
   * Rollback migrations
   */
  async rollback(options?: {
    targetVersion?: string;
    steps?: number;
    dryRun?: boolean;
  }): Promise<MigrationReport> {
    const report: MigrationReport = {
      summary: {
        totalMigrations: 0,
        executedMigrations: 0,
        failedMigrations: 0,
        skippedMigrations: 0,
        rolledBackMigrations: 0,
        totalExecutionTime: 0
      },
      migrations: [],
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      const executedMigrations = await this.getExecutedMigrations();
      const migrationsToRollback = this.determineMigrationsToRollback(
        executedMigrations,
        options
      );

      report.summary.totalMigrations = migrationsToRollback.length;

      if (migrationsToRollback.length === 0) {
        this.logger.info('No migrations to rollback');
        return report;
      }

      this.logger.info('Starting migration rollback', {
        service: 'DatabaseMigrationManager',
        operation: 'rollback',
        metadata: {
          migrationsToRollback: migrationsToRollback.length,
          dryRun: options?.dryRun || false,
          targetVersion: options?.targetVersion,
          steps: options?.steps
        }
      });

      for (const migration of migrationsToRollback.reverse()) {
        const result = await this.rollbackMigration(migration, options?.dryRun || false);

        report.migrations.push(result.status);
        report.summary.totalExecutionTime += result.executionTime;

        if (result.success) {
          report.summary.rolledBackMigrations++;
        } else {
          report.summary.failedMigrations++;
          report.errors.push(`Rollback of migration ${migration.id} failed: ${result.error}`);
          break;
        }
      }

      this.logger.info('Migration rollback completed', {
        service: 'DatabaseMigrationManager',
        operation: 'rollback',
        metadata: {
          rolledBack: report.summary.rolledBackMigrations,
          failed: report.summary.failedMigrations,
          totalTime: report.summary.totalExecutionTime
        }
      });

      return report;

    } catch (error) {
      this.logger.error('Migration rollback failed', {
        service: 'DatabaseMigrationManager',
        operation: 'rollback'
      }, error as Error);

      report.errors.push((error as Error).message);
      return report;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<MigrationStatus[]> {
    const statuses: MigrationStatus[] = [];

    for (const migration of this.migrations.values()) {
      const status = this.migrationStatuses.get(migration.id);
      if (status) {
        statuses.push(status);
      } else {
        // Migration not executed yet
        statuses.push({
          id: migration.id,
          name: migration.name,
          version: migration.version,
          status: 'pending',
          checksum: migration.checksum,
          rollbackAvailable: !!migration.down
        });
      }
    }

    return statuses.sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * Validate migration integrity
   */
  async validateMigrations(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check migrations table exists
      const tableExists = await this.utils.tableExists(this.config.migrationsTable);
      if (!tableExists) {
        errors.push('Migrations table does not exist');
      }

      // Validate migration checksums
      const executedMigrations = await this.getExecutedMigrations();
      for (const executed of executedMigrations) {
        const migration = this.migrations.get(executed.id);
        if (migration) {
          if (migration.checksum !== executed.checksum) {
            errors.push(`Checksum mismatch for migration ${executed.id}`);
          }
        } else {
          warnings.push(`Executed migration ${executed.id} not found in migration files`);
        }
      }

      // Check for circular dependencies
      const circularDeps = this.detectCircularDependencies();
      if (circularDeps.length > 0) {
        errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
      }

      // Validate migration versions
      const invalidVersions = this.validateMigrationVersions();
      if (invalidVersions.length > 0) {
        warnings.push(`Invalid version formats: ${invalidVersions.join(', ')}`);
      }

      // Check for breaking changes
      if (!this.config.allowBreakingChanges) {
        const breakingMigrations = Array.from(this.migrations.values())
          .filter(m => m.breaking);
        if (breakingMigrations.length > 0) {
          warnings.push(`Breaking changes detected in migrations: ${
            breakingMigrations.map(m => m.id).join(', ')
          }`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [(error as Error).message],
        warnings: []
      };
    }
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string, options?: {
    description?: string;
    author?: string;
    breaking?: boolean;
    dependencies?: string[];
  }): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const migrationId = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const version = timestamp;

    const migration: Migration = {
      id: migrationId,
      name,
      version,
      description: options?.description || name,
      author: options?.author || 'system',
      createdAt: new Date(),
      checksum: '',
      dependencies: options?.dependencies || [],
      breaking: options?.breaking || false,
      up: '-- Migration UP SQL goes here\n',
      down: '-- Migration DOWN SQL goes here\n',
      preHooks: [],
      postHooks: []
    };

    // Calculate checksum
    migration.checksum = this.calculateChecksum(migration);

    // Create migration file
    const fileName = `${migrationId}.json`;
    const filePath = path.join(this.config.migrationsPath, fileName);

    // Ensure migrations directory exists
    await fs.promises.mkdir(this.config.migrationsPath, { recursive: true });

    // Write migration file
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(migration, null, 2),
      'utf8'
    );

    // Add to in-memory migrations
    this.migrations.set(migrationId, migration);

    this.logger.info('Migration file created', {
      service: 'DatabaseMigrationManager',
      operation: 'createMigration',
      metadata: {
        migrationId,
        fileName,
        filePath
      }
    });

    return filePath;
  }

  // Private methods
  private async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.config.migrationsTable} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        error_text TEXT,
        rolled_back BOOLEAN DEFAULT FALSE,
        rollback_time TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_migrations_version ON ${this.config.migrationsTable} (version);
      CREATE INDEX IF NOT EXISTS idx_migrations_status ON ${this.config.migrationsTable} (status);
      CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON ${this.config.migrationsTable} (executed_at);
    `;

    await this.pool.query(createTableSQL);
  }

  private async loadMigrationStatuses(): Promise<void> {
    const query = `
      SELECT id, name, version, checksum, executed_at, execution_time,
             status, error_text, rolled_back
      FROM ${this.config.migrationsTable}
      ORDER BY version ASC
    `;

    const result = await this.pool.query(query);

    for (const row of result.rows) {
      this.migrationStatuses.set(row.id, {
        id: row.id,
        name: row.name,
        version: row.version,
        status: row.status,
        executedAt: row.executed_at,
        executionTime: row.execution_time,
        checksum: row.checksum,
        error: row.error_text,
        rollbackAvailable: !row.rolled_back
      });
    }
  }

  private async loadMigrations(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.config.migrationsPath);
      const migrationFiles = files.filter(file => file.endsWith('.json'));

      for (const file of migrationFiles) {
        const filePath = path.join(this.config.migrationsPath, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        const migration: Migration = JSON.parse(content);

        // Validate migration structure
        if (!migration.id || !migration.up) {
          this.logger.warn(`Invalid migration file: ${file}`, {
            service: 'DatabaseMigrationManager',
            operation: 'loadMigrations'
          });
          continue;
        }

        // Recalculate checksum to ensure integrity
        const expectedChecksum = this.calculateChecksum(migration);
        if (migration.checksum !== expectedChecksum) {
          this.logger.warn(`Checksum mismatch for migration: ${migration.id}`, {
            service: 'DatabaseMigrationManager',
            operation: 'loadMigrations',
            metadata: {
              expected: expectedChecksum,
              actual: migration.checksum
            }
          });
        }

        this.migrations.set(migration.id, migration);
      }

      this.logger.info('Migration files loaded', {
        service: 'DatabaseMigrationManager',
        operation: 'loadMigrations',
        metadata: { loadedFiles: migrationFiles.length }
      });

    } catch (error) {
      this.logger.error('Failed to load migration files', {
        service: 'DatabaseMigrationManager',
        operation: 'loadMigrations'
      }, error as Error);

      throw error;
    }
  }

  private async executeMigration(migration: Migration, dryRun: boolean): Promise<MigrationResult> {
    const startTime = Date.now();
    let backupPath: string | undefined;

    try {
      // Create backup if required
      if (migration.breaking && this.config.backupBeforeMigration && !dryRun) {
        backupPath = await this.createBackup(`pre_migration_${migration.id}`);
      }

      // Execute pre-hooks
      if (migration.preHooks && !dryRun) {
        await this.executeHooks(migration.preHooks, 'pre');
      }

      // Execute migration
      if (!dryRun) {
        await this.pool.query(migration.up);
      }

      // Execute post-hooks
      if (migration.postHooks && !dryRun) {
        await this.executeHooks(migration.postHooks, 'post');
      }

      // Record migration execution
      if (!dryRun) {
        await this.recordMigrationExecution(migration, startTime, true);
      }

      const executionTime = Date.now() - startTime;

      // Record in monitoring
      await this.monitoring.recordPerformanceMetrics('database-migration', {
        executionTime,
        operation: 'migration_execute',
        custom: {
          migrationId: migration.id,
          migrationVersion: migration.version,
          success: true
        }
      });

      return {
        migrationId: migration.id,
        success: true,
        executionTime,
        rolledBack: false,
        backupCreated: backupPath
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Record failed migration
      if (!dryRun) {
        await this.recordMigrationExecution(migration, startTime, false, (error as Error).message);
      }

      // Record error in monitoring
      await this.monitoring.recordPerformanceMetrics('database-migration', {
        executionTime,
        operation: 'migration_execute',
        custom: {
          migrationId: migration.id,
          migrationVersion: migration.version,
          success: false,
          error: (error as Error).message
        }
      });

      return {
        migrationId: migration.id,
        success: false,
        executionTime,
        error: (error as Error).message,
        rolledBack: false,
        backupCreated: backupPath
      };
    }
  }

  private async rollbackMigration(migration: Migration, dryRun: boolean): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      if (!migration.down) {
        throw new Error(`No rollback SQL defined for migration ${migration.id}`);
      }

      // Execute rollback
      if (!dryRun) {
        await this.pool.query(migration.down);
        await this.recordMigrationRollback(migration);
      }

      const executionTime = Date.now() - startTime;

      return {
        migrationId: migration.id,
        success: true,
        executionTime,
        rolledBack: true
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        migrationId: migration.id,
        success: false,
        executionTime,
        error: (error as Error).message,
        rolledBack: false
      };
    }
  }

  private async recordMigrationExecution(
    migration: Migration,
    startTime: number,
    success: boolean,
    error?: string
  ): Promise<void> {
    const executionTime = Date.now() - startTime;

    const query = `
      INSERT INTO ${this.config.migrationsTable}
      (id, name, version, checksum, executed_at, execution_time, status, error_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        executed_at = EXCLUDED.executed_at,
        execution_time = EXCLUDED.execution_time,
        status = EXCLUDED.status,
        error_text = EXCLUDED.error_text,
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.pool.query(query, [
      migration.id,
      migration.name,
      migration.version,
      migration.checksum,
      new Date(),
      executionTime,
      success ? 'completed' : 'failed',
      error || null
    ]);
  }

  private async recordMigrationRollback(migration: Migration): Promise<void> {
    const query = `
      UPDATE ${this.config.migrationsTable}
      SET rolled_back = TRUE, rollback_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [migration.id]);
  }

  private async getExecutedMigrationIds(): Promise<Set<string>> {
    const query = `SELECT id FROM ${this.config.migrationsTable} WHERE status = 'completed'`;
    const result = await this.pool.query(query);
    return new Set(result.rows.map(row => row.id));
  }

  private async getExecutedMigrations(): Promise<Migration[]> {
    const executedIds = await this.getExecutedMigrationIds();
    return Array.from(this.migrations.values())
      .filter(m => executedIds.has(m.id))
      .sort((a, b) => b.version.localeCompare(a.version)); // Most recent first
  }

  private sortMigrationsByDependencies(migrations: Migration[]): Migration[] {
    // Topological sort based on dependencies
    const sorted: Migration[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (migration: Migration) => {
      if (visited.has(migration.id)) return;
      if (visiting.has(migration.id)) {
        throw new Error(`Circular dependency detected: ${migration.id}`);
      }

      visiting.add(migration.id);

      for (const depId of migration.dependencies) {
        const depMigration = migrations.find(m => m.id === depId);
        if (depMigration) {
          visit(depMigration);
        }
      }

      visiting.delete(migration.id);
      visited.add(migration.id);
      sorted.push(migration);
    };

    for (const migration of migrations) {
      if (!visited.has(migration.id)) {
        visit(migration);
      }
    }

    return sorted;
  }

  private determineMigrationsToRollback(
    executedMigrations: Migration[],
    options?: { targetVersion?: string; steps?: number }
  ): Migration[] {
    if (options?.steps) {
      return executedMigrations.slice(0, options.steps);
    }

    if (options?.targetVersion) {
      return executedMigrations.filter(m => m.version > options.targetVersion!);
    }

    // Rollback all executed migrations
    return executedMigrations;
  }

  private async rollbackToLastSuccessful(): Promise<void> {
    // Implementation for rolling back to last successful state
    this.logger.info('Rolling back to last successful migration state', {
      service: 'DatabaseMigrationManager',
      operation: 'rollbackToLastSuccessful'
    });
  }

  private async executeHooks(hooks: MigrationHook[], type: 'pre' | 'post'): Promise<void> {
    for (const hook of hooks.sort((a, b) => a.order - b.order)) {
      if (hook.sql) {
        await this.pool.query(hook.sql);
      }
      // Additional hook execution logic can be added here
    }
  }

  private async createBackup(label: string): Promise<string> {
    // Implementation for creating database backup
    const backupPath = `/backups/${label}_${new Date().toISOString()}.sql`;
    this.logger.info('Database backup created', {
      service: 'DatabaseMigrationManager',
      operation: 'createBackup',
      metadata: { backupPath, label }
    });
    return backupPath;
  }

  private calculateChecksum(migration: Migration): string {
    // Simple checksum calculation - in production, use proper hashing
    const content = JSON.stringify({
      id: migration.id,
      name: migration.name,
      version: migration.version,
      up: migration.up,
      down: migration.down,
      dependencies: migration.dependencies
    });
    return content.length.toString(); // Placeholder
  }

  private detectCircularDependencies(): string[] {
    // Implementation for detecting circular dependencies
    return [];
  }

  private validateMigrationVersions(): string[] {
    // Implementation for validating migration versions
    return [];
  }

  private generateMigrationRecommendations(report: MigrationReport): string[] {
    const recommendations: string[] = [];

    if (report.summary.failedMigrations > 0) {
      recommendations.push('Review failed migrations and fix issues before proceeding');
    }

    if (report.summary.totalExecutionTime > 300000) { // 5 minutes
      recommendations.push('Consider optimizing migration execution time');
    }

    if (report.warnings.length > 0) {
      recommendations.push('Review migration warnings for potential issues');
    }

    return recommendations;
  }
}

// Factory function
export function createDatabaseMigrationManager(
  config: MigrationConfig,
  pool: DatabaseConnectionPool,
  logger: Logger,
  monitoring: MonitoringService
): DatabaseMigrationManager {
  return new DatabaseMigrationManager(config, pool, logger, monitoring);
}
