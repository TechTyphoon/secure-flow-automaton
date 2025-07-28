/**
 * Privileged Access Management (PAM) System
 * Implements just-in-time access, time-limited privileges, and comprehensive auditing
 * Zero Trust approach to privileged operations
 */

export interface PrivilegedRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
  maxDuration: number; // minutes
  allowedTimeWindows: TimeWindow[];
  requiresMfa: boolean;
  approvers: string[]; // user IDs
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  type: 'time' | 'location' | 'device' | 'network';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: any;
}

export interface TimeWindow {
  days: number[]; // 0-6, Sunday-Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timeZone: string;
}

export interface AccessRequest {
  id: string;
  userId: string;
  roleId: string;
  justification: string;
  requestedAt: Date;
  requestedFor: Date;
  duration: number; // minutes
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'revoked';
  approvedBy?: string;
  approvedAt?: Date;
  expiresAt?: Date;
  emergencyAccess: boolean;
  riskAssessment: {
    score: number;
    factors: string[];
    level: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface ActivePrivilegedSession {
  id: string;
  userId: string;
  roleId: string;
  requestId: string;
  startTime: Date;
  expiresAt: Date;
  permissions: Permission[];
  monitoringActive: boolean;
  activities: PrivilegedActivity[];
  warnings: SessionWarning[];
}

export interface PrivilegedActivity {
  timestamp: Date;
  action: string;
  resource: string;
  details: any;
  riskScore: number;
  blocked: boolean;
  reason?: string;
}

export interface SessionWarning {
  timestamp: Date;
  type: 'time_warning' | 'unusual_activity' | 'policy_violation' | 'security_alert';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoAction?: 'log' | 'warn' | 'revoke';
}

export interface PamConfig {
  defaultMaxDuration: number; // minutes
  emergencyAccessDuration: number; // minutes
  approvalTimeout: number; // minutes
  sessionWarningMinutes: number;
  autoRevokeOnSuspiciousActivity: boolean;
  requiredJustificationLength: number;
  breakGlassEnabled: boolean;
  recordAllActivities: boolean;
}

export class PrivilegedAccessManager {
  private config: PamConfig;
  private roles = new Map<string, PrivilegedRole>();
  private requests = new Map<string, AccessRequest>();
  private activeSessions = new Map<string, ActivePrivilegedSession>();
  private activityMonitor: PrivilegedActivityMonitor;
  private approvalEngine: ApprovalEngine;
  private auditLogger: PamAuditLogger;

  constructor(config: PamConfig) {
    this.config = config;
    this.activityMonitor = new PrivilegedActivityMonitor();
    this.approvalEngine = new ApprovalEngine();
    this.auditLogger = new PamAuditLogger();

    this.initializeDefaultRoles();
    this.startSessionMonitoring();
  }

  /**
   * Request privileged access
   */
  async requestPrivilegedAccess(request: {
    userId: string;
    roleId: string;
    justification: string;
    duration?: number;
    requestedFor?: Date;
    emergencyAccess?: boolean;
  }): Promise<AccessRequest> {
    try {
      // Validate request
      await this.validateAccessRequest(request);

      // Get role details
      const role = this.roles.get(request.roleId);
      if (!role) {
        throw new Error('Invalid role ID');
      }

      // Calculate risk assessment
      const riskAssessment = await this.assessRequestRisk(request, role);

      // Create access request
      const accessRequest: AccessRequest = {
        id: this.generateRequestId(),
        userId: request.userId,
        roleId: request.roleId,
        justification: request.justification,
        requestedAt: new Date(),
        requestedFor: request.requestedFor || new Date(),
        duration: request.duration || role.maxDuration || this.config.defaultMaxDuration,
        status: 'pending',
        emergencyAccess: request.emergencyAccess || false,
        riskAssessment,
      };

      // Determine if approval is required
      if (this.requiresApproval(role, accessRequest)) {
        accessRequest.status = 'pending';
        await this.initiateApprovalProcess(accessRequest, role);
      } else {
        // Auto-approve low-risk requests
        accessRequest.status = 'approved';
        accessRequest.approvedAt = new Date();
        accessRequest.expiresAt = new Date(
          Date.now() + accessRequest.duration * 60 * 1000
        );
      }

      this.requests.set(accessRequest.id, accessRequest);

      // Log request
      await this.auditLogger.logAccessRequest(accessRequest, role);

      return accessRequest;
    } catch (error) {
      console.error('Failed to request privileged access:', error);
      throw error;
    }
  }

  /**
   * Approve or deny access request
   */
  async processAccessRequest(
    requestId: string,
    approverId: string,
    decision: 'approved' | 'denied',
    reason?: string
  ): Promise<AccessRequest> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Access request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not pending approval');
    }

    const role = this.roles.get(request.roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Verify approver authorization
    if (!role.approvers.includes(approverId)) {
      throw new Error('User not authorized to approve this request');
    }

    // Update request
    request.status = decision;
    request.approvedBy = approverId;
    request.approvedAt = new Date();

    if (decision === 'approved') {
      request.expiresAt = new Date(
        Date.now() + request.duration * 60 * 1000
      );
    }

    // Log approval decision
    await this.auditLogger.logApprovalDecision(request, approverId, decision, reason);

    return request;
  }

  /**
   * Activate privileged access session
   */
  async activatePrivilegedAccess(requestId: string, userId: string): Promise<ActivePrivilegedSession> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Access request not found');
    }

    if (request.status !== 'approved') {
      throw new Error('Access request not approved');
    }

    if (request.userId !== userId) {
      throw new Error('User not authorized for this request');
    }

    if (request.expiresAt && request.expiresAt < new Date()) {
      throw new Error('Access request has expired');
    }

    const role = this.roles.get(request.roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Create privileged session
    const session: ActivePrivilegedSession = {
      id: this.generateSessionId(),
      userId: request.userId,
      roleId: request.roleId,
      requestId: request.id,
      startTime: new Date(),
      expiresAt: request.expiresAt!,
      permissions: role.permissions,
      monitoringActive: true,
      activities: [],
      warnings: [],
    };

    this.activeSessions.set(session.id, session);

    // Start activity monitoring
    await this.activityMonitor.startMonitoring(session);

    // Log session activation
    await this.auditLogger.logSessionActivation(session, request, role);

    return session;
  }

  /**
   * Check if user has permission for action
   */
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: any
  ): Promise<{
    allowed: boolean;
    sessionId?: string;
    reason?: string;
    requiresAdditionalAuth?: boolean;
  }> {
    // Find active privileged sessions for user
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => 
        session.userId === userId && 
        session.expiresAt > new Date() &&
        session.monitoringActive
      );

    for (const session of userSessions) {
      const permission = this.findMatchingPermission(session.permissions, resource, action);
      if (permission) {
        // Check conditions
        const conditionsMatch = await this.evaluateConditions(
          permission.conditions || [],
          context
        );

        if (conditionsMatch) {
          // Log permission check
          await this.auditLogger.logPermissionCheck(session, resource, action, true);

          return {
            allowed: true,
            sessionId: session.id,
          };
        }
      }
    }

    // No matching permission found
    await this.auditLogger.logPermissionCheck(null, resource, action, false);

    return {
      allowed: false,
      reason: 'Insufficient privileges',
    };
  }

  /**
   * Record privileged activity
   */
  async recordActivity(
    sessionId: string,
    activity: {
      action: string;
      resource: string;
      details: any;
    }
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }

    // Assess activity risk
    const riskScore = await this.activityMonitor.assessActivityRisk(activity, session);

    const privilegedActivity: PrivilegedActivity = {
      timestamp: new Date(),
      action: activity.action,
      resource: activity.resource,
      details: activity.details,
      riskScore,
      blocked: false,
    };

    // Check if activity should be blocked
    if (riskScore > 80) {
      privilegedActivity.blocked = true;
      privilegedActivity.reason = 'High risk activity detected';
      
      // Add warning
      const warning: SessionWarning = {
        timestamp: new Date(),
        type: 'security_alert',
        message: 'High-risk activity detected and blocked',
        severity: 'critical',
        autoAction: 'revoke',
      };
      
      session.warnings.push(warning);

      if (this.config.autoRevokeOnSuspiciousActivity) {
        await this.revokePrivilegedAccess(sessionId, 'Suspicious activity detected');
      }
    }

    session.activities.push(privilegedActivity);

    // Log activity
    await this.auditLogger.logPrivilegedActivity(session, privilegedActivity);
  }

  /**
   * Revoke privileged access
   */
  async revokePrivilegedAccess(sessionId: string, reason: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }

    session.monitoringActive = false;
    session.expiresAt = new Date(); // Immediate expiration

    // Stop monitoring
    await this.activityMonitor.stopMonitoring(session);

    // Log revocation
    await this.auditLogger.logSessionRevocation(session, reason);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
  }

  /**
   * Get user's active privileged sessions
   */
  getActivePrivilegedSessions(userId: string): ActivePrivilegedSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => 
        session.userId === userId && 
        session.expiresAt > new Date() &&
        session.monitoringActive
      );
  }

  /**
   * Emergency/break-glass access
   */
  async requestEmergencyAccess(request: {
    userId: string;
    justification: string;
    incident?: string;
  }): Promise<AccessRequest> {
    if (!this.config.breakGlassEnabled) {
      throw new Error('Emergency access is disabled');
    }

    const emergencyRole = this.roles.get('emergency_admin');
    if (!emergencyRole) {
      throw new Error('Emergency role not configured');
    }

    const accessRequest: AccessRequest = {
      id: this.generateRequestId(),
      userId: request.userId,
      roleId: 'emergency_admin',
      justification: `EMERGENCY: ${request.justification}`,
      requestedAt: new Date(),
      requestedFor: new Date(),
      duration: this.config.emergencyAccessDuration,
      status: 'approved', // Auto-approved
      emergencyAccess: true,
      approvedAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.emergencyAccessDuration * 60 * 1000),
      riskAssessment: {
        score: 90, // High risk for emergency access
        factors: ['emergency_access', 'bypass_approval'],
        level: 'critical',
      },
    };

    this.requests.set(accessRequest.id, accessRequest);

    // Log emergency access
    await this.auditLogger.logEmergencyAccess(accessRequest, request.incident);

    return accessRequest;
  }

  /**
   * Private methods
   */
  private async validateAccessRequest(request: any): Promise<void> {
    if (!request.justification || request.justification.length < this.config.requiredJustificationLength) {
      throw new Error('Insufficient justification provided');
    }

    if (request.duration && request.duration > this.config.defaultMaxDuration) {
      throw new Error('Requested duration exceeds maximum allowed');
    }

    // Additional validations...
  }

  private async assessRequestRisk(request: any, role: PrivilegedRole): Promise<any> {
    const factors: string[] = [];
    let score = role.riskLevel === 'critical' ? 60 : 
                role.riskLevel === 'high' ? 40 : 
                role.riskLevel === 'medium' ? 20 : 10;

    if (request.emergencyAccess) {
      factors.push('emergency_access');
      score += 30;
    }

    if (request.duration > this.config.defaultMaxDuration) {
      factors.push('extended_duration');
      score += 20;
    }

    const level = score >= 70 ? 'critical' : 
                  score >= 50 ? 'high' : 
                  score >= 30 ? 'medium' : 'low';

    return { score, factors, level };
  }

  private requiresApproval(role: PrivilegedRole, request: AccessRequest): boolean {
    return role.requiresApproval || 
           request.emergencyAccess || 
           request.riskAssessment.level === 'high' || 
           request.riskAssessment.level === 'critical';
  }

  private async initiateApprovalProcess(request: AccessRequest, role: PrivilegedRole): Promise<void> {
    await this.approvalEngine.initiateApproval(request, role);
  }

  private findMatchingPermission(permissions: Permission[], resource: string, action: string): Permission | null {
    for (const permission of permissions) {
      if (this.resourceMatches(permission.resource, resource) &&
          permission.actions.includes(action)) {
        return permission;
      }
    }
    return null;
  }

  private resourceMatches(pattern: string, resource: string): boolean {
    // Simple wildcard matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(resource);
  }

  private async evaluateConditions(conditions: PermissionCondition[], context: any): Promise<boolean> {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(condition: PermissionCondition, context: any): boolean {
    const contextValue = context[condition.type];
    
    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'not_equals':
        return contextValue !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      default:
        return false;
    }
  }

  private initializeDefaultRoles(): void {
    // Admin role
    this.roles.set('admin', {
      id: 'admin',
      name: 'System Administrator',
      description: 'Full system administration privileges',
      permissions: [
        { resource: '*', actions: ['*'] }
      ],
      riskLevel: 'critical',
      requiresApproval: true,
      maxDuration: 240, // 4 hours
      allowedTimeWindows: [
        {
          days: [1, 2, 3, 4, 5], // Weekdays
          startTime: '09:00',
          endTime: '17:00',
          timeZone: 'UTC',
        }
      ],
      requiresMfa: true,
      approvers: ['security_admin', 'ciso'],
    });

    // Security admin role
    this.roles.set('security_admin', {
      id: 'security_admin',
      name: 'Security Administrator',
      description: 'Security configuration and monitoring privileges',
      permissions: [
        { resource: 'security/*', actions: ['read', 'write'] },
        { resource: 'audit/*', actions: ['read'] },
      ],
      riskLevel: 'high',
      requiresApproval: true,
      maxDuration: 180, // 3 hours
      allowedTimeWindows: [
        {
          days: [0, 1, 2, 3, 4, 5, 6], // All days
          startTime: '00:00',
          endTime: '23:59',
          timeZone: 'UTC',
        }
      ],
      requiresMfa: true,
      approvers: ['ciso'],
    });

    // Emergency admin role
    this.roles.set('emergency_admin', {
      id: 'emergency_admin',
      name: 'Emergency Administrator',
      description: 'Emergency break-glass access',
      permissions: [
        { resource: '*', actions: ['*'] }
      ],
      riskLevel: 'critical',
      requiresApproval: false, // Auto-approved for emergencies
      maxDuration: 60, // 1 hour
      allowedTimeWindows: [
        {
          days: [0, 1, 2, 3, 4, 5, 6], // All days
          startTime: '00:00',
          endTime: '23:59',
          timeZone: 'UTC',
        }
      ],
      requiresMfa: true,
      approvers: [],
    });
  }

  private startSessionMonitoring(): void {
    setInterval(() => {
      this.monitorActiveSessions();
    }, 60 * 1000); // Every minute
  }

  private async monitorActiveSessions(): Promise<void> {
    const now = new Date();

    for (const session of this.activeSessions.values()) {
      // Check for expiration
      if (session.expiresAt <= now) {
        await this.revokePrivilegedAccess(session.id, 'Session expired');
        continue;
      }

      // Check for time warnings
      const timeRemaining = session.expiresAt.getTime() - now.getTime();
      const warningTime = this.config.sessionWarningMinutes * 60 * 1000;

      if (timeRemaining <= warningTime && timeRemaining > 0) {
        const existingWarning = session.warnings.find(w => w.type === 'time_warning');
        if (!existingWarning) {
          const warning: SessionWarning = {
            timestamp: now,
            type: 'time_warning',
            message: `Session expires in ${Math.ceil(timeRemaining / 60000)} minutes`,
            severity: 'medium',
            autoAction: 'warn',
          };
          session.warnings.push(warning);
        }
      }
    }
  }

  private generateRequestId(): string {
    return 'req_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private generateSessionId(): string {
    return 'psess_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

/**
 * Privileged Activity Monitor
 */
class PrivilegedActivityMonitor {
  async startMonitoring(session: ActivePrivilegedSession): Promise<void> {
    console.log(`Started monitoring privileged session: ${session.id}`);
  }

  async stopMonitoring(session: ActivePrivilegedSession): Promise<void> {
    console.log(`Stopped monitoring privileged session: ${session.id}`);
  }

  async assessActivityRisk(activity: any, session: ActivePrivilegedSession): Promise<number> {
    let risk = 0;

    // High-risk actions
    const highRiskActions = ['delete', 'modify_security', 'escalate_privileges', 'export_data'];
    if (highRiskActions.some(action => activity.action.includes(action))) {
      risk += 60;
    }

    // Unusual time
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      risk += 20;
    }

    // Rapid successive actions
    const recentActivities = session.activities.filter(
      a => Date.now() - a.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    if (recentActivities.length > 10) {
      risk += 30;
    }

    return Math.min(100, risk);
  }
}

/**
 * Approval Engine
 */
class ApprovalEngine {
  async initiateApproval(request: AccessRequest, role: PrivilegedRole): Promise<void> {
    // Send approval notifications
    console.log(`Approval required for privileged access request: ${request.id}`);
    // In production, send notifications to approvers
  }
}

/**
 * PAM Audit Logger
 */
class PamAuditLogger {
  async logAccessRequest(request: AccessRequest, role: PrivilegedRole): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'privileged_access_requested',
      requestId: request.id,
      userId: request.userId,
      roleId: request.roleId,
      roleName: role.name,
      justification: request.justification,
      duration: request.duration,
      emergencyAccess: request.emergencyAccess,
      riskAssessment: request.riskAssessment,
    };

    console.log('PAM Audit:', logEntry);
  }

  async logApprovalDecision(request: AccessRequest, approverId: string, decision: string, reason?: string): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'privileged_access_decision',
      requestId: request.id,
      userId: request.userId,
      approverId,
      decision,
      reason,
    };

    console.log('PAM Audit:', logEntry);
  }

  async logSessionActivation(session: ActivePrivilegedSession, request: AccessRequest, role: PrivilegedRole): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'privileged_session_activated',
      sessionId: session.id,
      requestId: request.id,
      userId: session.userId,
      roleId: session.roleId,
      roleName: role.name,
      expiresAt: session.expiresAt.toISOString(),
    };

    console.log('PAM Audit:', logEntry);
  }

  async logPermissionCheck(session: ActivePrivilegedSession | null, resource: string, action: string, allowed: boolean): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'permission_check',
      sessionId: session?.id,
      userId: session?.userId,
      resource,
      action,
      allowed,
    };

    console.log('PAM Audit:', logEntry);
  }

  async logPrivilegedActivity(session: ActivePrivilegedSession, activity: PrivilegedActivity): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'privileged_activity',
      sessionId: session.id,
      userId: session.userId,
      activity: {
        action: activity.action,
        resource: activity.resource,
        riskScore: activity.riskScore,
        blocked: activity.blocked,
        reason: activity.reason,
      },
    };

    console.log('PAM Audit:', logEntry);
  }

  async logSessionRevocation(session: ActivePrivilegedSession, reason: string): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'privileged_session_revoked',
      sessionId: session.id,
      userId: session.userId,
      reason,
      activitiesCount: session.activities.length,
      warningsCount: session.warnings.length,
    };

    console.log('PAM Audit:', logEntry);
  }

  async logEmergencyAccess(request: AccessRequest, incident?: string): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'emergency_access_granted',
      requestId: request.id,
      userId: request.userId,
      justification: request.justification,
      incident,
      duration: request.duration,
    };

    console.log('PAM Audit:', logEntry);
  }
}

export default PrivilegedAccessManager;
