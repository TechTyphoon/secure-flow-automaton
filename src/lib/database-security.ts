/**
 * Enhanced Database Security Layer
 * Implements input validation, sanitization, and security logging
 */

import { supabase } from '@/integrations/supabase/client';
import { SecurityLogger, sanitizeSqlInput } from './security';

/**
 * Database security utilities and helpers
 */
export class DatabaseSecurity {
  private static instance: DatabaseSecurity;
  
  private constructor() {}
  
  public static getInstance(): DatabaseSecurity {
    if (!DatabaseSecurity.instance) {
      DatabaseSecurity.instance = new DatabaseSecurity();
    }
    return DatabaseSecurity.instance;
  }

  /**
   * Validate and sanitize input for database operations
   */
  public validateInput(input: any): any {
    if (typeof input === 'string') {
      return sanitizeSqlInput(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.validateInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.validateColumnName(key)] = this.validateInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Validate column name to prevent SQL injection
   */
  public validateColumnName(column: string): string {
    // Allow only alphanumeric characters and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
      throw new Error(`Invalid column name: ${column}`);
    }
    return column;
  }

  /**
   * Log database operations for security audit
   */
  public logOperation(operation: string, table: string, data?: any): void {
    SecurityLogger.logEvent('database_operation', {
      operation,
      table,
      timestamp: new Date().toISOString(),
      dataKeys: data ? Object.keys(data) : [],
    });
  }

  /**
   * Validate user permissions for database operation
   */
  public async validateUserPermissions(
    operation: string, 
    table: string, 
    userId?: string
  ): Promise<boolean> {
    SecurityLogger.logEvent('permission_check', {
      operation,
      table,
      userId,
      timestamp: new Date().toISOString(),
    });
    
    // Add your permission logic here
    return true;
  }

  /**
   * Add security metadata to insert/update operations
   */
  public addSecurityMetadata(data: Record<string, any>, isUpdate = false): Record<string, any> {
    const timestamp = new Date().toISOString();
    
    if (isUpdate) {
      return {
        ...data,
        updated_at: timestamp,
      };
    }
    
    return {
      ...data,
      created_at: timestamp,
      updated_at: timestamp,
    };
  }

  /**
   * Sanitize filter conditions
   */
  public sanitizeFilters(filters: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(filters)) {
      const sanitizedKey = this.validateColumnName(key);
      sanitized[sanitizedKey] = this.validateInput(value);
    }
    
    return sanitized;
  }
}

/**
 * Secure wrapper functions for common database operations
 */
export const SecureDB = {
  /**
   * Secure select operation with validation
   */
  async select(
    table: 'vulnerabilities' | 'security_scans' | 'pipeline_metrics' | 'pipeline_runs',
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
    } = {}
  ) {
    const db = DatabaseSecurity.getInstance();
    
    try {
      // Log the operation
      db.logOperation('SELECT', table, options.filters);
      
      // Build query
      let query = supabase.from(table);
      
      // Add select fields if specified
      if (options.select) {
        query = query.select(options.select);
      } else {
        query = query.select('*');
      }
      
      // Add filters
      if (options.filters) {
        const sanitizedFilters = db.sanitizeFilters(options.filters);
        for (const [key, value] of Object.entries(sanitizedFilters)) {
          query = query.eq(key, value);
        }
      }
      
      // Add ordering
      if (options.orderBy) {
        const sanitizedColumn = db.validateColumnName(options.orderBy.column);
        query = query.order(sanitizedColumn, { ascending: options.orderBy.ascending ?? true });
      }
      
      // Add limit
      if (options.limit) {
        query = query.limit(Math.min(options.limit, 1000)); // Max 1000 records
      }
      
      return await query;
    } catch (error) {
      SecurityLogger.logEvent('database_error', {
        operation: 'SELECT',
        table,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  /**
   * Secure insert operation with validation
   */
  async insert(
    table: 'vulnerabilities' | 'security_scans' | 'pipeline_metrics' | 'pipeline_runs',
    data: Record<string, any>
  ) {
    const db = DatabaseSecurity.getInstance();
    
    try {
      // Validate and sanitize input
      const sanitizedData = db.validateInput(data);
      const dataWithMetadata = db.addSecurityMetadata(sanitizedData);
      
      // Log the operation
      db.logOperation('INSERT', table, dataWithMetadata);
      
      return await supabase
        .from(table)
        .insert(dataWithMetadata)
        .select()
        .single();
    } catch (error) {
      SecurityLogger.logEvent('database_error', {
        operation: 'INSERT',
        table,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  /**
   * Secure update operation with validation
   */
  async update(
    table: 'vulnerabilities' | 'security_scans' | 'pipeline_metrics' | 'pipeline_runs',
    data: Record<string, any>,
    filters: Record<string, any>
  ) {
    const db = DatabaseSecurity.getInstance();
    
    try {
      // Validate and sanitize input
      const sanitizedData = db.validateInput(data);
      const dataWithMetadata = db.addSecurityMetadata(sanitizedData, true);
      const sanitizedFilters = db.sanitizeFilters(filters);
      
      // Log the operation
      db.logOperation('UPDATE', table, { data: dataWithMetadata, filters: sanitizedFilters });
      
      let query = supabase.from(table).update(dataWithMetadata);
      
      // Apply filters
      for (const [key, value] of Object.entries(sanitizedFilters)) {
        query = query.eq(key, value);
      }
      
      return await query.select();
    } catch (error) {
      SecurityLogger.logEvent('database_error', {
        operation: 'UPDATE',
        table,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  /**
   * Secure delete operation with validation
   */
  async delete(
    table: 'vulnerabilities' | 'security_scans' | 'pipeline_metrics' | 'pipeline_runs',
    filters: Record<string, any>
  ) {
    const db = DatabaseSecurity.getInstance();
    
    try {
      // Prevent accidental deletion of all records
      if (Object.keys(filters).length === 0) {
        throw new Error('Delete operation requires at least one filter');
      }
      
      const sanitizedFilters = db.sanitizeFilters(filters);
      
      // Log the operation
      db.logOperation('DELETE', table, sanitizedFilters);
      
      let query = supabase.from(table).delete();
      
      // Apply filters
      for (const [key, value] of Object.entries(sanitizedFilters)) {
        query = query.eq(key, value);
      }
      
      return await query.select();
    } catch (error) {
      SecurityLogger.logEvent('database_error', {
        operation: 'DELETE',
        table,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
};

/**
 * RLS (Row Level Security) Policy Templates
 * These should be applied in Supabase dashboard or migration scripts
 */
export const RLS_POLICIES = {
  // User-specific data access
  USER_OWNED_DATA: `
    CREATE POLICY "Users can only access their own data" ON {table}
    FOR ALL USING (auth.uid() = user_id);
  `,
  
  // Read-only public data
  PUBLIC_READ: `
    CREATE POLICY "Public read access" ON {table}
    FOR SELECT USING (true);
  `,
  
  // Admin-only access
  ADMIN_ONLY: `
    CREATE POLICY "Admin only access" ON {table}
    FOR ALL USING (
      auth.jwt() ->> 'role' = 'admin' OR
      auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );
  `,
  
  // Time-based access (e.g., only recent data)
  TIME_BASED: `
    CREATE POLICY "Time-based access" ON {table}
    FOR SELECT USING (
      created_at > NOW() - INTERVAL '30 days'
    );
  `,
};

/**
 * Generate RLS policy for a table
 */
export function generateRLSPolicy(table: string, policyType: keyof typeof RLS_POLICIES): string {
  return RLS_POLICIES[policyType].replace(/{table}/g, table);
}

export default DatabaseSecurity;
