/**
 * Network Access Control (NAC) Implementation
 * Implements device authentication, authorization, and compliance validation
 * Provides dynamic network access based on device posture and policy
 */

export interface NetworkDevice {
  id: string;
  macAddress: string;
  ipAddress: string;
  hostname: string;
  deviceType: 'laptop' | 'mobile' | 'server' | 'iot' | 'unknown';
  operatingSystem: string;
  manufacturer: string;
  model: string;
  lastSeen: Date;
  status: 'online' | 'offline' | 'quarantined' | 'blocked';
  user?: {
    id: string;
    name: string;
    department: string;
  };
}

export interface DeviceCompliance {
  deviceId: string;
  isCompliant: boolean;
  score: number;
  checks: {
    antivirus: { status: 'pass' | 'fail' | 'unknown'; version?: string };
    firewall: { status: 'pass' | 'fail' | 'unknown'; enabled: boolean };
    encryption: { status: 'pass' | 'fail' | 'unknown'; type?: string };
    patches: { status: 'pass' | 'fail' | 'unknown'; lastUpdate?: Date };
    certificates: { status: 'pass' | 'fail' | 'unknown'; expiry?: Date };
  };
  violations: string[];
  lastAssessed: Date;
}

export interface NetworkPolicy {
  id: string;
  name: string;
  description: string;
  deviceTypes: string[];
  userGroups: string[];
  networkSegments: string[];
  allowedServices: string[];
  timeRestrictions?: {
    startTime: string;
    endTime: string;
    days: string[];
  };
  complianceRequired: boolean;
  action: 'allow' | 'deny' | 'quarantine' | 'monitor';
  priority: number;
}

export interface NetworkSegment {
  id: string;
  name: string;
  vlanId: number;
  ipRange: string;
  securityLevel: 'public' | 'internal' | 'restricted' | 'critical';
  allowedDeviceTypes: string[];
  policies: string[];
  firewallRules: FirewallRule[];
}

export interface FirewallRule {
  id: string;
  name: string;
  source: string;
  destination: string;
  port: string;
  protocol: 'tcp' | 'udp' | 'icmp' | 'any';
  action: 'allow' | 'deny';
  logging: boolean;
}

export interface AccessRequest {
  id: string;
  deviceId: string;
  userId?: string;
  requestedSegment: string;
  requestedServices: string[];
  timestamp: Date;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  decision?: {
    result: 'allow' | 'deny' | 'quarantine';
    reason: string;
    appliedPolicies: string[];
    grantedAccess: string[];
    restrictions: string[];
  };
}

export class NetworkAccessController {
  private devices: Map<string, NetworkDevice> = new Map();
  private compliance: Map<string, DeviceCompliance> = new Map();
  private policies: Map<string, NetworkPolicy> = new Map();
  private segments: Map<string, NetworkSegment> = new Map();
  private accessRequests: Map<string, AccessRequest> = new Map();

  constructor() {
    this.initializeNACInfrastructure();
  }

  /**
   * Initialize NAC infrastructure with policies and segments
   */
  private initializeNACInfrastructure(): void {
    // Initialize network segments
    const segments: NetworkSegment[] = [
      {
        id: 'seg-guest',
        name: 'Guest Network',
        vlanId: 100,
        ipRange: '192.168.100.0/24',
        securityLevel: 'public',
        allowedDeviceTypes: ['laptop', 'mobile'],
        policies: ['policy-guest-access'],
        firewallRules: [
          {
            id: 'fw-guest-internet',
            name: 'Guest Internet Access',
            source: '192.168.100.0/24',
            destination: 'any',
            port: '80,443',
            protocol: 'tcp',
            action: 'allow',
            logging: true
          }
        ]
      },
      {
        id: 'seg-corporate',
        name: 'Corporate Network',
        vlanId: 200,
        ipRange: '10.0.0.0/16',
        securityLevel: 'internal',
        allowedDeviceTypes: ['laptop', 'mobile', 'server'],
        policies: ['policy-employee-access'],
        firewallRules: [
          {
            id: 'fw-corp-full',
            name: 'Corporate Full Access',
            source: '10.0.0.0/16',
            destination: '10.0.0.0/8',
            port: 'any',
            protocol: 'any',
            action: 'allow',
            logging: false
          }
        ]
      },
      {
        id: 'seg-restricted',
        name: 'Restricted Network',
        vlanId: 300,
        ipRange: '172.16.0.0/24',
        securityLevel: 'restricted',
        allowedDeviceTypes: ['laptop', 'server'],
        policies: ['policy-restricted-access'],
        firewallRules: [
          {
            id: 'fw-restricted-limited',
            name: 'Restricted Limited Access',
            source: '172.16.0.0/24',
            destination: '172.16.0.0/24',
            port: '443,8443',
            protocol: 'tcp',
            action: 'allow',
            logging: true
          }
        ]
      },
      {
        id: 'seg-critical',
        name: 'Critical Infrastructure',
        vlanId: 400,
        ipRange: '172.20.0.0/24',
        securityLevel: 'critical',
        allowedDeviceTypes: ['server'],
        policies: ['policy-critical-access'],
        firewallRules: [
          {
            id: 'fw-critical-deny-all',
            name: 'Critical Default Deny',
            source: 'any',
            destination: '172.20.0.0/24',
            port: 'any',
            protocol: 'any',
            action: 'deny',
            logging: true
          }
        ]
      }
    ];

    segments.forEach(segment => {
      this.segments.set(segment.id, segment);
    });

    // Initialize NAC policies
    const policies: NetworkPolicy[] = [
      {
        id: 'policy-guest-access',
        name: 'Guest Network Access',
        description: 'Internet-only access for guest devices',
        deviceTypes: ['laptop', 'mobile'],
        userGroups: ['guests', 'visitors'],
        networkSegments: ['seg-guest'],
        allowedServices: ['http', 'https', 'dns'],
        complianceRequired: false,
        action: 'allow',
        priority: 100
      },
      {
        id: 'policy-employee-access',
        name: 'Employee Network Access',
        description: 'Full corporate network access for compliant employee devices',
        deviceTypes: ['laptop', 'mobile'],
        userGroups: ['employees', 'contractors'],
        networkSegments: ['seg-corporate'],
        allowedServices: ['http', 'https', 'smtp', 'ldap', 'file-share'],
        timeRestrictions: {
          startTime: '06:00',
          endTime: '22:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        complianceRequired: true,
        action: 'allow',
        priority: 200
      },
      {
        id: 'policy-restricted-access',
        name: 'Restricted Network Access',
        description: 'Limited access to sensitive systems',
        deviceTypes: ['laptop'],
        userGroups: ['privileged-users', 'admins'],
        networkSegments: ['seg-restricted'],
        allowedServices: ['https', 'ssh', 'rdp'],
        timeRestrictions: {
          startTime: '08:00',
          endTime: '18:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        complianceRequired: true,
        action: 'allow',
        priority: 300
      },
      {
        id: 'policy-critical-access',
        name: 'Critical Infrastructure Access',
        description: 'Highly restricted access to critical systems',
        deviceTypes: ['server'],
        userGroups: ['security-admins', 'infrastructure-team'],
        networkSegments: ['seg-critical'],
        allowedServices: ['https', 'ssh'],
        complianceRequired: true,
        action: 'monitor',
        priority: 400
      }
    ];

    policies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });

    this.initializeMockDevices();
  }

  /**
   * Initialize mock devices for demonstration
   */
  private initializeMockDevices(): void {
    const devices: NetworkDevice[] = [
      {
        id: 'dev-001',
        macAddress: '00:1B:44:11:3A:B7',
        ipAddress: '10.0.1.15',
        hostname: 'john-laptop',
        deviceType: 'laptop',
        operatingSystem: 'Windows 11',
        manufacturer: 'Dell',
        model: 'Latitude 7420',
        lastSeen: new Date(),
        status: 'online',
        user: {
          id: 'user-john',
          name: 'John Smith',
          department: 'Engineering'
        }
      },
      {
        id: 'dev-002',
        macAddress: '00:1B:44:11:3A:C8',
        ipAddress: '10.0.1.23',
        hostname: 'sarah-mobile',
        deviceType: 'mobile',
        operatingSystem: 'iOS 17.1',
        manufacturer: 'Apple',
        model: 'iPhone 15 Pro',
        lastSeen: new Date(),
        status: 'online',
        user: {
          id: 'user-sarah',
          name: 'Sarah Johnson',
          department: 'Marketing'
        }
      },
      {
        id: 'dev-003',
        macAddress: '00:1B:44:11:3A:D9',
        ipAddress: '172.16.0.5',
        hostname: 'admin-workstation',
        deviceType: 'laptop',
        operatingSystem: 'Ubuntu 22.04',
        manufacturer: 'Lenovo',
        model: 'ThinkPad X1 Carbon',
        lastSeen: new Date(),
        status: 'online',
        user: {
          id: 'user-admin',
          name: 'Admin User',
          department: 'IT Security'
        }
      }
    ];

    devices.forEach(device => {
      this.devices.set(device.id, device);
      
      // Generate compliance data
      const compliance: DeviceCompliance = {
        deviceId: device.id,
        isCompliant: Math.random() > 0.2,
        score: Math.floor(Math.random() * 30) + 70,
        checks: {
          antivirus: { status: 'pass', version: 'v2024.7.1' },
          firewall: { status: 'pass', enabled: true },
          encryption: { status: 'pass', type: 'AES-256' },
          patches: { status: Math.random() > 0.3 ? 'pass' : 'fail', lastUpdate: new Date() },
          certificates: { status: 'pass', expiry: new Date('2025-12-31') }
        },
        violations: [],
        lastAssessed: new Date()
      };

      this.compliance.set(device.id, compliance);
    });
  }

  /**
   * Process device access request
   */
  async processAccessRequest(deviceId: string, userId: string, requestedSegment: string, requestedServices: string[]): Promise<AccessRequest> {
    const requestId = `req-${Date.now()}`;
    
    const request: AccessRequest = {
      id: requestId,
      deviceId,
      userId,
      requestedSegment,
      requestedServices,
      timestamp: new Date(),
      status: 'pending'
    };

    // Evaluate access request
    const decision = await this.evaluateAccessRequest(request);
    request.decision = decision;
    request.status = decision.result === 'deny' ? 'denied' : 'approved';

    this.accessRequests.set(requestId, request);
    return request;
  }

  /**
   * Evaluate access request against policies and compliance
   */
  private async evaluateAccessRequest(request: AccessRequest): Promise<AccessRequest['decision']> {
    const device = this.devices.get(request.deviceId);
    const compliance = this.compliance.get(request.deviceId);
    const segment = this.segments.get(request.requestedSegment);

    if (!device || !segment) {
      return {
        result: 'deny',
        reason: 'Device or segment not found',
        appliedPolicies: [],
        grantedAccess: [],
        restrictions: []
      };
    }

    // Find applicable policies
    const applicablePolicies = Array.from(this.policies.values())
      .filter(policy => 
        policy.networkSegments.includes(request.requestedSegment) &&
        policy.deviceTypes.includes(device.deviceType)
      )
      .sort((a, b) => b.priority - a.priority);

    if (applicablePolicies.length === 0) {
      return {
        result: 'deny',
        reason: 'No applicable policies found',
        appliedPolicies: [],
        grantedAccess: [],
        restrictions: []
      };
    }

    const policy = applicablePolicies[0];

    // Check compliance if required
    if (policy.complianceRequired && (!compliance || !compliance.isCompliant)) {
      return {
        result: 'quarantine',
        reason: 'Device not compliant with security requirements',
        appliedPolicies: [policy.id],
        grantedAccess: [],
        restrictions: ['Limited network access until compliance is achieved']
      };
    }

    // Check time restrictions
    if (policy.timeRestrictions) {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.toTimeString().slice(0, 5);
      
      if (!policy.timeRestrictions.days.includes(currentDay) ||
          currentTime < policy.timeRestrictions.startTime ||
          currentTime > policy.timeRestrictions.endTime) {
        return {
          result: 'deny',
          reason: 'Access requested outside allowed time window',
          appliedPolicies: [policy.id],
          grantedAccess: [],
          restrictions: [`Access allowed only during ${policy.timeRestrictions.startTime}-${policy.timeRestrictions.endTime}`]
        };
      }
    }

    // Determine granted access
    const grantedAccess = request.requestedServices.filter(service => 
      policy.allowedServices.includes(service)
    );

    const restrictions = request.requestedServices
      .filter(service => !policy.allowedServices.includes(service))
      .map(service => `Access to ${service} not permitted`);

    return {
      result: policy.action === 'deny' ? 'deny' : 'allow',
      reason: policy.action === 'deny' ? 'Policy denies access' : 'Policy allows access',
      appliedPolicies: [policy.id],
      grantedAccess,
      restrictions
    };
  }

  /**
   * Perform device compliance assessment
   */
  async assessDeviceCompliance(deviceId: string): Promise<DeviceCompliance> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    // Simulate compliance assessment
    const compliance: DeviceCompliance = {
      deviceId,
      isCompliant: true,
      score: 85,
      checks: {
        antivirus: { status: 'pass', version: 'v2024.7.1' },
        firewall: { status: 'pass', enabled: true },
        encryption: { status: 'pass', type: 'AES-256' },
        patches: { status: 'pass', lastUpdate: new Date() },
        certificates: { status: 'pass', expiry: new Date('2025-12-31') }
      },
      violations: [],
      lastAssessed: new Date()
    };

    // Randomly simulate some compliance issues
    if (Math.random() < 0.3) {
      compliance.isCompliant = false;
      compliance.score = 65;
      compliance.checks.patches.status = 'fail';
      compliance.violations.push('Operating system patches are outdated');
    }

    if (Math.random() < 0.2) {
      compliance.checks.antivirus.status = 'fail';
      compliance.violations.push('Antivirus definitions are outdated');
      compliance.isCompliant = false;
      compliance.score -= 15;
    }

    this.compliance.set(deviceId, compliance);
    return compliance;
  }

  /**
   * Quarantine device
   */
  async quarantineDevice(deviceId: string, reason: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = 'quarantined';
      device.ipAddress = '192.168.99.' + Math.floor(Math.random() * 254 + 1); // Move to quarantine VLAN
    }
  }

  /**
   * Release device from quarantine
   */
  async releaseFromQuarantine(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    const compliance = this.compliance.get(deviceId);
    
    if (device && compliance && compliance.isCompliant) {
      device.status = 'online';
      // Reassign to appropriate network segment
    }
  }

  /**
   * Get network access statistics
   */
  getAccessStatistics(): {
    totalDevices: number;
    onlineDevices: number;
    compliantDevices: number;
    quarantinedDevices: number;
    blockedDevices: number;
    accessRequests: {
      total: number;
      approved: number;
      denied: number;
      pending: number;
    };
  } {
    const devices = Array.from(this.devices.values());
    const compliance = Array.from(this.compliance.values());
    const requests = Array.from(this.accessRequests.values());

    return {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length,
      compliantDevices: compliance.filter(c => c.isCompliant).length,
      quarantinedDevices: devices.filter(d => d.status === 'quarantined').length,
      blockedDevices: devices.filter(d => d.status === 'blocked').length,
      accessRequests: {
        total: requests.length,
        approved: requests.filter(r => r.status === 'approved').length,
        denied: requests.filter(r => r.status === 'denied').length,
        pending: requests.filter(r => r.status === 'pending').length
      }
    };
  }

  /**
   * Get all registered devices
   */
  getDevices(): NetworkDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device compliance status
   */
  getDeviceCompliance(deviceId: string): DeviceCompliance | undefined {
    return this.compliance.get(deviceId);
  }

  /**
   * Get network segments
   */
  getNetworkSegments(): NetworkSegment[] {
    return Array.from(this.segments.values());
  }

  /**
   * Get NAC policies
   */
  getPolicies(): NetworkPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get recent access requests
   */
  getAccessRequests(): AccessRequest[] {
    return Array.from(this.accessRequests.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
}

export default NetworkAccessController;
