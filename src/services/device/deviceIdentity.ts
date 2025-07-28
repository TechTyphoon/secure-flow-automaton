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

  constructor() {
    this.initializeDeviceIdentityService();
  }

  /**
   * Initialize device identity service with sample data
   */
  private initializeDeviceIdentityService(): void {
    // Initialize sample device identities
    const sampleDevices: DeviceIdentity[] = [
      {
        deviceId: 'dev-laptop-001',
        enrollmentId: 'enr-2025-001',
        deviceName: 'CORP-LAPTOP-JS001',
        deviceType: 'laptop',
        platform: {
          os: 'Windows 11 Pro',
          version: '23H2',
          architecture: 'x64',
          manufacturer: 'Dell',
          model: 'Latitude 7420'
        },
        hardware: {
          processorId: 'Intel-i7-1185G7-8cores',
          memorySize: 32768, // MB
          diskSize: 1024000, // MB
          macAddresses: ['00:1B:44:11:3A:B7', '02:1B:44:11:3A:B8'],
          serialNumbers: ['DL7420-2025-001'],
          tpmPresent: true,
          secureBootEnabled: true
        },
        ownership: 'corporate',
        enrollmentDate: new Date('2025-07-15'),
        lastSeen: new Date(),
        status: 'active',
        trustLevel: 'high',
        certificates: [
          {
            id: 'cert-device-001',
            type: 'device_identity',
            subject: 'CN=CORP-LAPTOP-JS001,OU=Devices,O=SecureFlow',
            issuer: 'CN=SecureFlow Device CA,O=SecureFlow',
            serialNumber: '1A2B3C4D5E6F',
            thumbprint: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
            validFrom: new Date('2025-07-15'),
            validTo: new Date('2027-07-15'),
            keyUsage: ['digital_signature', 'key_encipherment'],
            status: 'valid',
            autoRenewal: true
          }
        ],
        metadata: {
          location: 'New York Office',
          department: 'Engineering',
          assignedUser: 'john.smith@secureflow.com',
          assetTag: 'SF-LAP-001',
          purchaseDate: new Date('2025-07-01'),
          warrantyExpiry: new Date('2028-07-01')
        }
      },
      {
        deviceId: 'dev-mobile-002',
        enrollmentId: 'enr-2025-002',
        deviceName: 'iPhone-SJ-15Pro',
        deviceType: 'mobile',
        platform: {
          os: 'iOS',
          version: '17.1.2',
          architecture: 'arm64',
          manufacturer: 'Apple',
          model: 'iPhone 15 Pro'
        },
        hardware: {
          processorId: 'Apple-A17-Pro',
          memorySize: 8192,
          diskSize: 512000,
          macAddresses: ['02:1B:44:22:4A:C8'],
          serialNumbers: ['IP15P-2025-002'],
          tpmPresent: true, // Secure Enclave
          secureBootEnabled: true
        },
        ownership: 'corporate',
        enrollmentDate: new Date('2025-07-20'),
        lastSeen: new Date(),
        status: 'active',
        trustLevel: 'high',
        certificates: [
          {
            id: 'cert-mobile-002',
            type: 'device_identity',
            subject: 'CN=iPhone-SJ-15Pro,OU=Mobile,O=SecureFlow',
            issuer: 'CN=SecureFlow Mobile CA,O=SecureFlow',
            serialNumber: '2B3C4D5E6F7G',
            thumbprint: 'B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1',
            validFrom: new Date('2025-07-20'),
            validTo: new Date('2027-07-20'),
            keyUsage: ['digital_signature', 'key_encipherment'],
            status: 'valid',
            autoRenewal: true
          }
        ],
        metadata: {
          location: 'San Francisco Office',
          department: 'Marketing',
          assignedUser: 'sarah.johnson@secureflow.com',
          assetTag: 'SF-MOB-002',
          purchaseDate: new Date('2025-07-15')
        }
      },
      {
        deviceId: 'dev-server-003',
        enrollmentId: 'enr-2025-003',
        deviceName: 'PROD-WEB-01',
        deviceType: 'server',
        platform: {
          os: 'Ubuntu Server',
          version: '22.04.3 LTS',
          architecture: 'x64',
          manufacturer: 'HPE',
          model: 'ProLiant DL380 Gen10'
        },
        hardware: {
          processorId: 'Intel-Xeon-Gold-6248R-24cores',
          memorySize: 131072,
          diskSize: 4096000,
          macAddresses: ['00:1B:44:33:5B:D9', '00:1B:44:33:5B:DA'],
          serialNumbers: ['HPE-DL380-2025-003'],
          tpmPresent: true,
          secureBootEnabled: true
        },
        ownership: 'corporate',
        enrollmentDate: new Date('2025-07-10'),
        lastSeen: new Date(),
        status: 'active',
        trustLevel: 'critical',
        certificates: [
          {
            id: 'cert-server-003',
            type: 'device_identity',
            subject: 'CN=PROD-WEB-01,OU=Servers,O=SecureFlow',
            issuer: 'CN=SecureFlow Server CA,O=SecureFlow',
            serialNumber: '3C4D5E6F7G8H',
            thumbprint: 'C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2',
            validFrom: new Date('2025-07-10'),
            validTo: new Date('2026-07-10'),
            keyUsage: ['digital_signature', 'key_encipherment', 'server_auth'],
            status: 'valid',
            autoRenewal: true
          }
        ],
        metadata: {
          location: 'Primary Data Center',
          department: 'Infrastructure',
          assetTag: 'SF-SRV-003',
          purchaseDate: new Date('2025-06-01'),
          warrantyExpiry: new Date('2030-06-01')
        }
      },
      {
        deviceId: 'dev-iot-004',
        enrollmentId: 'enr-2025-004',
        deviceName: 'SecurityCamera-East-01',
        deviceType: 'iot',
        platform: {
          os: 'Embedded Linux',
          version: '5.4.0',
          architecture: 'arm',
          manufacturer: 'Axis',
          model: 'P3248-LVE'
        },
        hardware: {
          processorId: 'ARM-Cortex-A53-quad',
          memorySize: 2048,
          diskSize: 32000,
          macAddresses: ['00:1B:44:44:6C:EA'],
          serialNumbers: ['AXIS-P3248-2025-004'],
          tpmPresent: false,
          secureBootEnabled: false
        },
        ownership: 'corporate',
        enrollmentDate: new Date('2025-07-25'),
        lastSeen: new Date(),
        status: 'active',
        trustLevel: 'medium',
        certificates: [],
        metadata: {
          location: 'Building East Entrance',
          department: 'Security',
          assetTag: 'SF-CAM-004',
          purchaseDate: new Date('2025-07-20')
        }
      }
    ];

    sampleDevices.forEach(device => {
      this.devices.set(device.deviceId, device);
    });

    this.initializeSampleEvents();
  }

  /**
   * Initialize sample lifecycle events
   */
  private initializeSampleEvents(): void {
    const sampleEvents: DeviceLifecycleEvent[] = [
      {
        id: 'event-001',
        deviceId: 'dev-laptop-001',
        eventType: 'enrollment',
        timestamp: new Date('2025-07-15T10:00:00Z'),
        initiatedBy: 'admin@secureflow.com',
        reason: 'New employee device setup',
        details: {
          newStatus: 'active',
          automaticAction: false,
          approvalRequired: true,
          approver: 'it-admin@secureflow.com'
        },
        impact: {
          accessRevoked: [],
          certificatesRevoked: [],
          dataWipeRequired: false,
          notificationsSent: ['john.smith@secureflow.com', 'it-admin@secureflow.com']
        }
      },
      {
        id: 'event-002',
        deviceId: 'dev-mobile-002',
        eventType: 'activation',
        timestamp: new Date('2025-07-20T14:30:00Z'),
        initiatedBy: 'sarah.johnson@secureflow.com',
        reason: 'Self-service mobile enrollment completed',
        details: {
          previousStatus: 'inactive',
          newStatus: 'active',
          automaticAction: true,
          approvalRequired: false
        },
        impact: {
          accessRevoked: [],
          certificatesRevoked: [],
          dataWipeRequired: false,
          notificationsSent: ['sarah.johnson@secureflow.com']
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
    const enrollmentId = `enr-${Date.now()}`;
    const deviceId = `dev-${request.deviceInfo.hostname.toLowerCase()}-${Date.now()}`;

    // Store enrollment request
    this.enrollmentRequests.set(enrollmentId, request);

    // Generate device certificates
    const certificates: DeviceCertificate[] = [
      {
        id: `cert-${deviceId}`,
        type: 'device_identity',
        subject: `CN=${request.deviceInfo.hostname},OU=Devices,O=SecureFlow`,
        issuer: 'CN=SecureFlow Device CA,O=SecureFlow',
        serialNumber: this.generateSerialNumber(),
        thumbprint: this.generateThumbprint(),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
        keyUsage: ['digital_signature', 'key_encipherment'],
        status: 'valid',
        autoRenewal: true
      }
    ];

    // Create device identity
    const deviceIdentity: DeviceIdentity = {
      deviceId,
      enrollmentId,
      deviceName: request.deviceInfo.hostname,
      deviceType: this.detectDeviceType(request.deviceInfo),
      platform: {
        os: request.deviceInfo.os,
        version: request.deviceInfo.version,
        architecture: 'x64', // Default
        manufacturer: request.deviceInfo.manufacturer,
        model: request.deviceInfo.model
      },
      hardware: {
        processorId: 'Unknown',
        memorySize: 0,
        diskSize: 0,
        macAddresses: [request.deviceInfo.macAddress],
        serialNumbers: [request.deviceInfo.serialNumber],
        tpmPresent: false,
        secureBootEnabled: false
      },
      ownership: 'corporate',
      enrollmentDate: new Date(),
      lastSeen: new Date(),
      status: request.enrollmentMethod === 'autopilot' ? 'active' : 'inactive',
      trustLevel: 'low',
      certificates,
      metadata: {
        department: request.userInfo.department,
        assignedUser: request.userInfo.email
      }
    };

    this.devices.set(deviceId, deviceIdentity);

    // Create lifecycle event
    const lifecycleEvent: DeviceLifecycleEvent = {
      id: `event-${Date.now()}`,
      deviceId,
      eventType: 'enrollment',
      timestamp: new Date(),
      initiatedBy: request.userInfo.email,
      reason: `Device enrollment via ${request.enrollmentMethod}`,
      details: {
        newStatus: deviceIdentity.status,
        automaticAction: request.enrollmentMethod === 'autopilot',
        approvalRequired: request.enrollmentMethod !== 'autopilot'
      },
      impact: {
        accessRevoked: [],
        certificatesRevoked: [],
        dataWipeRequired: false,
        notificationsSent: [request.userInfo.email]
      }
    };

    this.lifecycleEvents.set(lifecycleEvent.id, lifecycleEvent);

    return {
      success: true,
      deviceId,
      enrollmentId,
      certificates,
      policies: ['device-baseline-policy', 'user-access-policy'],
      nextSteps: [
        'Install device certificates',
        'Configure security policies',
        'Complete compliance assessment',
        ...(request.enrollmentMethod !== 'autopilot' ? ['Wait for IT approval'] : [])
      ],
      estimatedApprovalTime: request.enrollmentMethod === 'autopilot' ? 0 : 24 // hours
    };
  }

  /**
   * Authenticate device
   */
  async authenticateDevice(auth: DeviceAuthentication): Promise<DeviceAuthenticationResult> {
    const device = this.devices.get(auth.deviceId);
    
    if (!device) {
      return {
        success: false,
        deviceId: auth.deviceId,
        trustScore: 0,
        authenticationMethods: [],
        riskFactors: ['device_not_found'],
        requiredActions: ['device_enrollment_required']
      };
    }

    if (device.status !== 'active') {
      return {
        success: false,
        deviceId: auth.deviceId,
        trustScore: 0,
        authenticationMethods: [],
        riskFactors: ['device_inactive'],
        requiredActions: ['contact_it_support']
      };
    }

    // Calculate trust score based on multiple factors
    let trustScore = 50; // Base score
    const authMethods: string[] = [auth.method];
    const riskFactors: string[] = [];

    // Authentication method scoring
    switch (auth.method) {
      case 'certificate':
        if (this.validateCertificate(device, auth.credentials.certificate)) {
          trustScore += 25;
        } else {
          riskFactors.push('invalid_certificate');
          trustScore -= 20;
        }
        break;
      case 'tpm':
        if (device.hardware.tpmPresent) {
          trustScore += 30;
        } else {
          riskFactors.push('tpm_not_available');
          trustScore -= 15;
        }
        break;
      case 'hardware_token':
        trustScore += 20;
        break;
      case 'biometric':
        trustScore += 15;
        break;
      case 'multi_factor':
        trustScore += 35;
        authMethods.push('secondary_factor');
        break;
    }

    // Device trust level adjustment
    switch (device.trustLevel) {
      case 'critical': trustScore += 20; break;
      case 'high': trustScore += 15; break;
      case 'medium': trustScore += 5; break;
      case 'low': trustScore -= 10; break;
      case 'unknown': trustScore -= 20; break;
    }

    // Location-based risk assessment
    if (auth.location) {
      if (this.isLocationTrusted(auth.location)) {
        trustScore += 10;
      } else {
        riskFactors.push('untrusted_location');
        trustScore -= 15;
      }
    }

    // Time-based analysis
    const lastSeen = device.lastSeen.getTime();
    const timeSinceLastSeen = Date.now() - lastSeen;
    const daysSinceLastSeen = timeSinceLastSeen / (1000 * 60 * 60 * 24);

    if (daysSinceLastSeen > 30) {
      riskFactors.push('long_absence');
      trustScore -= 10;
    }

    // Ensure trust score is within bounds
    trustScore = Math.max(0, Math.min(100, trustScore));

    // Update device last seen
    device.lastSeen = new Date();

    // Generate session token for successful authentication
    const sessionToken = trustScore >= 60 ? this.generateSessionToken(auth.deviceId) : undefined;
    const sessionExpiry = sessionToken ? new Date(Date.now() + 8 * 60 * 60 * 1000) : undefined; // 8 hours

    const result: DeviceAuthenticationResult = {
      success: trustScore >= 60,
      deviceId: auth.deviceId,
      trustScore,
      authenticationMethods: authMethods,
      riskFactors,
      sessionToken,
      sessionExpiry,
      requiredActions: trustScore < 60 ? ['additional_verification_required'] : [],
      restrictions: trustScore < 80 ? ['limited_network_access'] : []
    };

    // Store authentication session
    this.authenticationSessions.set(auth.deviceId, result);

    return result;
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

  private validateCertificate(device: DeviceIdentity, certificate?: string): boolean {
    if (!certificate) return false;
    // Simplified certificate validation
    return device.certificates.some(cert => cert.status === 'valid' && cert.validTo > new Date());
  }

  private isLocationTrusted(location: DeviceAuthentication['location']): boolean {
    if (!location) return false;
    // Simplified location trust evaluation
    const trustedCountries = ['US', 'CA', 'UK', 'DE', 'FR'];
    return trustedCountries.includes(location.country);
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

export default DeviceIdentityService;
