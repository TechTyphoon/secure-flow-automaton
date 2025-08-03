/**
 * Device Identity & Registration Service
 * Implements comprehensive device identity management with Zero Trust principles
 * Provides device enrollment, authentication, and lifecycle management
 */

export interface DeviceIdentity {
  deviceId: string;
  enrollmentId: string;
  deviceName: string;
  deviceType: 'laptop' | 'desktop' | 'mobile' | 'tablet' | 'server' | 'iot' | 'virtual';
  platform: {
    os: string;
    version: string;
    architecture: string;
    manufacturer: string;
    model: string;
  };
  hardware: {
    processorId: string;
    memorySize: number;
    diskSize: number;
    macAddresses: string[];
    serialNumbers: string[];
    tpmPresent: boolean;
    secureBootEnabled: boolean;
  };
  ownership: 'corporate' | 'personal' | 'contractor' | 'guest';
  enrollmentDate: Date;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'suspended' | 'retired' | 'lost' | 'compromised';
  trustLevel: 'unknown' | 'low' | 'medium' | 'high' | 'critical';
  certificates: DeviceCertificate[];
  metadata: {
    location?: string;
    department?: string;
    assignedUser?: string;
    assetTag?: string;
    purchaseDate?: Date;
    warrantyExpiry?: Date;
  };
}

export interface DeviceCertificate {
  id: string;
  type: 'device_identity' | 'user_auth' | 'vpn_access' | 'wifi_auth' | 'code_signing';
  subject: string;
  issuer: string;
  serialNumber: string;
  thumbprint: string;
  validFrom: Date;
  validTo: Date;
  keyUsage: string[];
  status: 'valid' | 'expired' | 'revoked' | 'suspended';
  autoRenewal: boolean;
}

export interface DeviceEnrollmentRequest {
  deviceInfo: {
    hostname: string;
    os: string;
    version: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    macAddress: string;
  };
  userInfo: {
    userId: string;
    email: string;
    department: string;
  };
  enrollmentMethod: 'manual' | 'bulk' | 'autopilot' | 'self_service';
  requestedAccess: string[];
  justification?: string;
}

export interface DeviceEnrollmentResponse {
  success: boolean;
  deviceId?: string;
  enrollmentId?: string;
  certificates?: DeviceCertificate[];
  policies?: string[];
  nextSteps?: string[];
  errors?: string[];
  estimatedApprovalTime?: number;
}

export interface DeviceAuthentication {
  deviceId: string;
  method: 'certificate' | 'tpm' | 'hardware_token' | 'biometric' | 'multi_factor';
  credentials: {
    certificate?: string;
    tpmAttestation?: string;
    biometricHash?: string;
    tokenSerial?: string;
  };
  challenge?: string;
  timestamp: Date;
  ipAddress: string;
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: [number, number];
  };
}

export interface DeviceAuthenticationResult {
  success: boolean;
  deviceId: string;
  trustScore: number;
  authenticationMethods: string[];
  riskFactors: string[];
  sessionToken?: string;
  sessionExpiry?: Date;
  requiredActions?: string[];
  restrictions?: string[];
}

export interface DeviceLifecycleEvent {
  id: string;
  deviceId: string;
  eventType: 'enrollment' | 'activation' | 'deactivation' | 'suspension' | 'retirement' | 'loss_reported' | 'recovery';
  timestamp: Date;
  initiatedBy: string;
  reason: string;
  details: {
    previousStatus?: string;
    newStatus: string;
    automaticAction?: boolean;
    approvalRequired?: boolean;
    approver?: string;
  };
  impact: {
    accessRevoked: string[];
    certificatesRevoked: string[];
    dataWipeRequired: boolean;
    notificationsSent: string[];
  };
}

export class DeviceIdentityService {
  private devices: Map<string, DeviceIdentity> = new Map();
  private enrollmentRequests: Map<string, DeviceEnrollmentRequest> = new Map();
  private lifecycleEvents: Map<string, DeviceLifecycleEvent> = new Map();
  private authenticationSessions: Map<string, DeviceAuthenticationResult> = new Map();
  private certificateAuthority: CertificateAuthority;
  private complianceEngine: ComplianceEngine;

  constructor() {
    this.certificateAuthority = new CertificateAuthority();
    this.complianceEngine = new ComplianceEngine();
    this.initializeDeviceIdentityService();
  }

  /**
   * Initialize device identity service with sample data
   */
  private initializeDeviceIdentityService(): void {
    // Initialize with sample devices for demonstration
    this.initializeSampleDevices();
    this.initializeSampleEvents();
  }

  private initializeSampleDevices(): void {
    const sampleDevices: DeviceIdentity[] = [
      {
        deviceId: 'dev-001',
        enrollmentId: 'enroll-001',
        deviceName: 'CEO-Laptop-001',
        deviceType: 'laptop',
        platform: {
          os: 'Windows',
          version: '11.0.22621',
          architecture: 'x64',
          manufacturer: 'Dell',
          model: 'Latitude 5520'
        },
        hardware: {
          processorId: 'BFEBFBFF000906EA',
          memorySize: 16384,
          diskSize: 512000,
          macAddresses: ['00:1B:44:11:3A:B7'],
          serialNumbers: ['DL123456789'],
          tpmPresent: true,
          secureBootEnabled: true
        },
        ownership: 'corporate',
        enrollmentDate: new Date('2024-01-15'),
        lastSeen: new Date(),
        status: 'active',
        trustLevel: 'high',
        certificates: [
          {
            id: 'cert-001',
            type: 'device_identity',
            subject: 'CN=CEO-Laptop-001,O=Company,C=US',
            issuer: 'CN=Company-CA,O=Company,C=US',
            serialNumber: '1234567890ABCDEF',
            thumbprint: 'A1B2C3D4E5F6789012345678901234567890ABCD',
            validFrom: new Date('2024-01-15'),
            validTo: new Date('2025-01-15'),
            keyUsage: ['digitalSignature', 'keyEncipherment'],
            status: 'valid',
            autoRenewal: true
          }
        ],
        metadata: {
          location: 'Headquarters',
          department: 'Executive',
          assignedUser: 'ceo@company.com',
          assetTag: 'LAP-001',
          purchaseDate: new Date('2023-06-15'),
          warrantyExpiry: new Date('2026-06-15')
        }
      },
      {
        deviceId: 'dev-002',
        enrollmentId: 'enroll-002',
        deviceName: 'IT-Desktop-001',
        deviceType: 'desktop',
        platform: {
          os: 'Windows',
          version: '10.0.19045',
          architecture: 'x64',
          manufacturer: 'HP',
          model: 'EliteDesk 800 G5'
        },
        hardware: {
          processorId: 'BFEBFBFF000906EA',
          memorySize: 32768,
          diskSize: 1000000,
          macAddresses: ['00:1B:44:11:3A:B8'],
          serialNumbers: ['HP987654321'],
          tpmPresent: true,
          secureBootEnabled: true
        },
        ownership: 'corporate',
        enrollmentDate: new Date('2024-02-01'),
        lastSeen: new Date(),
        status: 'active',
        trustLevel: 'high',
        certificates: [
          {
            id: 'cert-002',
            type: 'device_identity',
            subject: 'CN=IT-Desktop-001,O=Company,C=US',
            issuer: 'CN=Company-CA,O=Company,C=US',
            serialNumber: 'FEDCBA0987654321',
            thumbprint: 'FEDCBA0987654321ABCDEF1234567890ABCDEF12',
            validFrom: new Date('2024-02-01'),
            validTo: new Date('2025-02-01'),
            keyUsage: ['digitalSignature', 'keyEncipherment'],
            status: 'valid',
            autoRenewal: true
          }
        ],
        metadata: {
          location: 'IT Department',
          department: 'Information Technology',
          assignedUser: 'admin@company.com',
          assetTag: 'DESK-001',
          purchaseDate: new Date('2023-08-01'),
          warrantyExpiry: new Date('2026-08-01')
        }
      }
    ];

    sampleDevices.forEach(device => {
      this.devices.set(device.deviceId, device);
    });
  }

  /**
   * Initialize sample lifecycle events
   */
  private initializeSampleEvents(): void {
    const sampleEvents: DeviceLifecycleEvent[] = [
      {
        id: 'event-001',
        deviceId: 'dev-001',
        eventType: 'enrollment',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        initiatedBy: 'system',
        reason: 'Initial device enrollment',
        details: {
          previousStatus: 'unknown',
          newStatus: 'active',
          automaticAction: true,
          approvalRequired: false
        },
        impact: {
          accessRevoked: [],
          certificatesRevoked: [],
          dataWipeRequired: false,
          notificationsSent: ['ceo@company.com']
        }
      }
    ];

    sampleEvents.forEach(event => {
      this.lifecycleEvents.set(event.id, event);
    });
  }

  /**
   * Enroll a new device
   */
  async enrollDevice(request: DeviceEnrollmentRequest): Promise<DeviceEnrollmentResponse> {
    try {
      // Validate request
      const validationResult = this.validateEnrollmentRequest(request);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors
        };
      }

      // Check if device already exists
      const existingDevice = Array.from(this.devices.values()).find(
        device => device.hardware.serialNumbers.includes(request.deviceInfo.serialNumber)
      );

      if (existingDevice) {
        return {
          success: false,
          errors: ['Device with this serial number is already enrolled']
        };
      }

      // Generate device ID and enrollment ID
      const deviceId = `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const enrollmentId = `enroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create device identity
      const device: DeviceIdentity = {
        deviceId,
        enrollmentId,
        deviceName: request.deviceInfo.hostname,
        deviceType: this.detectDeviceType(request.deviceInfo),
        platform: {
          os: request.deviceInfo.os,
          version: request.deviceInfo.version,
          architecture: 'x64', // Default, could be detected
          manufacturer: request.deviceInfo.manufacturer,
          model: request.deviceInfo.model
        },
        hardware: {
          processorId: this.generateSerialNumber(),
          memorySize: 8192, // Default, could be detected
          diskSize: 256000, // Default, could be detected
          macAddresses: [request.deviceInfo.macAddress],
          serialNumbers: [request.deviceInfo.serialNumber],
          tpmPresent: true, // Assume TPM is present for corporate devices
          secureBootEnabled: true // Assume Secure Boot is enabled
        },
        ownership: 'corporate',
        enrollmentDate: new Date(),
        lastSeen: new Date(),
        status: 'active',
        trustLevel: 'medium', // Will be updated based on compliance checks
        certificates: [],
        metadata: {
          location: 'Unknown',
          department: request.userInfo.department,
          assignedUser: request.userInfo.email,
          assetTag: `DEV-${deviceId.split('-')[1]}`
        }
      };

      // Generate device certificate
      const certificate = await this.certificateAuthority.generateDeviceCertificate(device);
      device.certificates.push(certificate);

      // Run compliance check
      const complianceResult = await this.complianceEngine.checkDeviceCompliance(device);
      device.trustLevel = complianceResult.trustLevel;

      // Store device
      this.devices.set(deviceId, device);

      // Create enrollment event
      const enrollmentEvent: DeviceLifecycleEvent = {
        id: `event-${Date.now()}`,
        deviceId,
        eventType: 'enrollment',
        timestamp: new Date(),
        initiatedBy: request.userInfo.email,
        reason: 'Device enrollment request',
        details: {
          previousStatus: 'unknown',
          newStatus: 'active',
          automaticAction: true,
          approvalRequired: false
        },
        impact: {
          accessRevoked: [],
          certificatesRevoked: [],
          dataWipeRequired: false,
          notificationsSent: [request.userInfo.email]
        }
      };

      this.lifecycleEvents.set(enrollmentEvent.id, enrollmentEvent);

      return {
        success: true,
        deviceId,
        enrollmentId,
        certificates: [certificate],
        policies: ['corporate-device-policy', 'security-compliance-policy'],
        nextSteps: [
          'Install required security software',
          'Configure device policies',
          'Complete security training'
        ],
        estimatedApprovalTime: 0 // Immediate approval for corporate devices
      };

    } catch (error) {
      console.error('Device enrollment failed:', error);
      return {
        success: false,
        errors: ['Device enrollment failed due to system error']
      };
    }
  }

  /**
   * Authenticate device
   */
  async authenticateDevice(auth: DeviceAuthentication): Promise<DeviceAuthenticationResult> {
    try {
      const device = this.devices.get(auth.deviceId);
      if (!device) {
        return {
          success: false,
          deviceId: auth.deviceId,
          trustScore: 0,
          authenticationMethods: [],
          riskFactors: ['Device not found in registry'],
          requiredActions: ['Enroll device first']
        };
      }

      // Validate certificate if provided
      if (auth.credentials.certificate) {
        const isValidCertificate = this.validateCertificate(device, auth.credentials.certificate);
        if (!isValidCertificate) {
          return {
            success: false,
            deviceId: auth.deviceId,
            trustScore: 0,
            authenticationMethods: [],
            riskFactors: ['Invalid device certificate'],
            requiredActions: ['Renew device certificate']
          };
        }
      }

      // Check device status
      if (device.status !== 'active') {
        return {
          success: false,
          deviceId: auth.deviceId,
          trustScore: 0,
          authenticationMethods: [],
          riskFactors: [`Device status: ${device.status}`],
          requiredActions: ['Contact IT support']
        };
      }

      // Check location trust
      const isLocationTrusted = this.isLocationTrusted(auth.location);
      const locationRisk = isLocationTrusted ? 0 : 0.3;

      // Calculate trust score
      let trustScore = 0.8; // Base trust score
      
      // Add trust for valid certificate
      if (auth.credentials.certificate) {
        trustScore += 0.1;
      }

      // Add trust for TPM attestation
      if (auth.credentials.tpmAttestation) {
        trustScore += 0.05;
      }

      // Subtract risk for untrusted location
      trustScore -= locationRisk;

      // Subtract risk for old last seen
      const hoursSinceLastSeen = (Date.now() - device.lastSeen.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSeen > 24) {
        trustScore -= 0.1;
      }

      // Ensure trust score is between 0 and 1
      trustScore = Math.max(0, Math.min(1, trustScore));

      // Update last seen
      device.lastSeen = new Date();

      const authenticationMethods = [];
      if (auth.credentials.certificate) authenticationMethods.push('certificate');
      if (auth.credentials.tpmAttestation) authenticationMethods.push('tpm');
      if (auth.credentials.biometricHash) authenticationMethods.push('biometric');
      if (auth.credentials.tokenSerial) authenticationMethods.push('hardware_token');

      const riskFactors = [];
      if (!isLocationTrusted) riskFactors.push('Untrusted location');
      if (hoursSinceLastSeen > 24) riskFactors.push('Device not seen recently');
      if (device.trustLevel === 'low') riskFactors.push('Low trust level device');

      const sessionToken = trustScore > 0.6 ? this.generateSessionToken(auth.deviceId) : undefined;
      const sessionExpiry = sessionToken ? new Date(Date.now() + 8 * 60 * 60 * 1000) : undefined; // 8 hours

      const result: DeviceAuthenticationResult = {
        success: trustScore > 0.5,
        deviceId: auth.deviceId,
        trustScore,
        authenticationMethods,
        riskFactors,
        sessionToken,
        sessionExpiry,
        requiredActions: riskFactors.length > 0 ? ['Contact security team'] : [],
        restrictions: trustScore < 0.7 ? ['Limited access', 'Enhanced monitoring'] : []
      };

      // Store authentication session
      this.authenticationSessions.set(`${auth.deviceId}_${Date.now()}`, result);

      return result;

    } catch (error) {
      console.error('Device authentication failed:', error);
      return {
        success: false,
        deviceId: auth.deviceId,
        trustScore: 0,
        authenticationMethods: [],
        riskFactors: ['Authentication system error'],
        requiredActions: ['Contact IT support']
      };
    }
  }

  /**
   * Update device status
   */
  async updateDeviceStatus(
    deviceId: string, 
    newStatus: DeviceIdentity['status'], 
    reason: string, 
    initiatedBy: string
  ): Promise<DeviceLifecycleEvent> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    const previousStatus = device.status;
    device.status = newStatus;

    // Determine lifecycle event type
    let eventType: DeviceLifecycleEvent['eventType'];
    switch (newStatus) {
      case 'active': eventType = 'activation'; break;
      case 'inactive': eventType = 'deactivation'; break;
      case 'suspended': eventType = 'suspension'; break;
      case 'retired': eventType = 'retirement'; break;
      case 'lost': eventType = 'loss_reported'; break;
      default: eventType = 'deactivation';
    }

    // Create lifecycle event
    const lifecycleEvent: DeviceLifecycleEvent = {
      id: `event-${Date.now()}`,
      deviceId,
      eventType,
      timestamp: new Date(),
      initiatedBy,
      reason,
      details: {
        previousStatus,
        newStatus,
        automaticAction: false,
        approvalRequired: ['retired', 'lost'].includes(newStatus)
      },
      impact: {
        accessRevoked: newStatus !== 'active' ? ['network_access', 'application_access'] : [],
        certificatesRevoked: ['retired', 'lost', 'compromised'].includes(newStatus) ? device.certificates.map(c => c.id) : [],
        dataWipeRequired: ['lost', 'compromised'].includes(newStatus),
        notificationsSent: [device.metadata.assignedUser || 'unknown'].filter(Boolean)
      }
    };

    this.lifecycleEvents.set(lifecycleEvent.id, lifecycleEvent);

    // Handle certificate revocation if needed
    if (lifecycleEvent.impact.certificatesRevoked.length > 0) {
      device.certificates.forEach(cert => {
        cert.status = 'revoked';
      });
    }

    return lifecycleEvent;
  }

  /**
   * Generate device compliance report
   */
  generateComplianceReport(): {
    totalDevices: number;
    devicesByType: Record<string, number>;
    devicesByStatus: Record<string, number>;
    devicesByTrustLevel: Record<string, number>;
    certificateStatus: {
      valid: number;
      expired: number;
      expiringSoon: number;
      revoked: number;
    };
    recommendations: string[];
  } {
    const devices = Array.from(this.devices.values());
    
    const devicesByType = devices.reduce((acc, device) => {
      acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const devicesByStatus = devices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const devicesByTrustLevel = devices.reduce((acc, device) => {
      acc[device.trustLevel] = (acc[device.trustLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Certificate analysis
    const allCertificates = devices.flatMap(device => device.certificates);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const certificateStatus = {
      valid: allCertificates.filter(cert => cert.status === 'valid' && cert.validTo > now).length,
      expired: allCertificates.filter(cert => cert.validTo <= now).length,
      expiringSoon: allCertificates.filter(cert => cert.status === 'valid' && cert.validTo <= thirtyDaysFromNow && cert.validTo > now).length,
      revoked: allCertificates.filter(cert => cert.status === 'revoked').length
    };

    const recommendations: string[] = [];
    
    if (devicesByStatus.inactive > 0) {
      recommendations.push(`Review ${devicesByStatus.inactive} inactive devices for potential retirement`);
    }
    
    if (certificateStatus.expiringSoon > 0) {
      recommendations.push(`Renew ${certificateStatus.expiringSoon} certificates expiring within 30 days`);
    }
    
    if (devicesByTrustLevel.low > 0 || devicesByTrustLevel.unknown > 0) {
      recommendations.push(`Assess ${(devicesByTrustLevel.low || 0) + (devicesByTrustLevel.unknown || 0)} devices with low/unknown trust levels`);
    }

    if (devices.filter(d => !d.hardware.tpmPresent).length > 0) {
      recommendations.push('Consider TPM requirement for new device enrollments');
    }

    return {
      totalDevices: devices.length,
      devicesByType,
      devicesByStatus,
      devicesByTrustLevel,
      certificateStatus,
      recommendations
    };
  }

  /**
   * Helper methods
   */
  private detectDeviceType(deviceInfo: DeviceEnrollmentRequest['deviceInfo']): DeviceIdentity['deviceType'] {
    const os = deviceInfo.os.toLowerCase();
    if (os.includes('ios') || os.includes('android')) return 'mobile';
    if (os.includes('server')) return 'server';
    if (deviceInfo.manufacturer.toLowerCase().includes('raspberry') || deviceInfo.model.toLowerCase().includes('iot')) return 'iot';
    return 'laptop'; // Default
  }

  private generateSerialNumber(): string {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
  }

  private generateThumbprint(): string {
    return Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
  }

  private generateSessionToken(deviceId: string): string {
    return `session_${deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateEnrollmentRequest(request: DeviceEnrollmentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.deviceInfo.hostname) {
      errors.push('Device hostname is required');
    }

    if (!request.deviceInfo.serialNumber) {
      errors.push('Device serial number is required');
    }

    if (!request.deviceInfo.macAddress) {
      errors.push('Device MAC address is required');
    }

    if (!request.userInfo.email) {
      errors.push('User email is required');
    }

    if (!request.userInfo.department) {
      errors.push('User department is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateCertificate(device: DeviceIdentity, certificate?: string): boolean {
    if (!certificate) return false;
    
    // Check if device has a valid certificate
    const validCertificate = device.certificates.find(cert => 
      cert.status === 'valid' && 
      cert.validTo > new Date()
    );
    
    return !!validCertificate;
  }

  private isLocationTrusted(location?: DeviceAuthentication['location']): boolean {
    if (!location) return false;
    
    // Define trusted locations (could be loaded from configuration)
    const trustedLocations = [
      { country: 'US', region: 'CA', city: 'San Francisco' },
      { country: 'US', region: 'NY', city: 'New York' },
      { country: 'US', region: 'TX', city: 'Austin' }
    ];
    
    return trustedLocations.some(trusted => 
      trusted.country === location.country &&
      trusted.region === location.region &&
      trusted.city === location.city
    );
  }

  /**
   * Public methods for external access
   */
  getDevices(): DeviceIdentity[] {
    return Array.from(this.devices.values());
  }

  getDevice(deviceId: string): DeviceIdentity | undefined {
    return this.devices.get(deviceId);
  }

  getLifecycleEvents(): DeviceLifecycleEvent[] {
    return Array.from(this.lifecycleEvents.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getAuthenticationSessions(): DeviceAuthenticationResult[] {
    return Array.from(this.authenticationSessions.values());
  }
}

// Certificate Authority Service
class CertificateAuthority {
  async generateDeviceCertificate(device: DeviceIdentity): Promise<DeviceCertificate> {
    const certificateId = `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const serialNumber = Math.random().toString(16).toUpperCase();
    const thumbprint = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();

    return {
      id: certificateId,
      type: 'device_identity',
      subject: `CN=${device.deviceName},O=Company,C=US`,
      issuer: 'CN=Company-CA,O=Company,C=US',
      serialNumber,
      thumbprint,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      keyUsage: ['digitalSignature', 'keyEncipherment'],
      status: 'valid',
      autoRenewal: true
    };
  }
}

// Compliance Engine Service
class ComplianceEngine {
  async checkDeviceCompliance(device: DeviceIdentity): Promise<{ trustLevel: DeviceIdentity['trustLevel'] }> {
    let complianceScore = 0;
    
    // Check TPM presence
    if (device.hardware.tpmPresent) complianceScore += 20;
    
    // Check Secure Boot
    if (device.hardware.secureBootEnabled) complianceScore += 20;
    
    // Check corporate ownership
    if (device.ownership === 'corporate') complianceScore += 20;
    
    // Check recent enrollment
    const daysSinceEnrollment = (Date.now() - device.enrollmentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceEnrollment < 30) complianceScore += 20;
    
    // Check valid certificates
    const validCertificates = device.certificates.filter(cert => 
      cert.status === 'valid' && cert.validTo > new Date()
    );
    if (validCertificates.length > 0) complianceScore += 20;
    
    // Determine trust level based on compliance score
    let trustLevel: DeviceIdentity['trustLevel'] = 'unknown';
    if (complianceScore >= 80) trustLevel = 'high';
    else if (complianceScore >= 60) trustLevel = 'medium';
    else if (complianceScore >= 40) trustLevel = 'low';
    else trustLevel = 'critical';
    
    return { trustLevel };
  }
}

export default DeviceIdentityService;
