export const deploymentConfig = {
    environment: 'production',
    region: 'global',
    maxInstances: 100,
    minInstances: 1,
    scalingPolicy: {
        cpuUtilization: {
            targetUtilization: 0.75,
            cooldownPeriod: 300,
        },
        memoryUtilization: {
            targetUtilization: 0.75,
            cooldownPeriod: 300,
        },
    },
    deploymentStrategy: 'blue-green',
    healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 5,
        healthyThreshold: 2,
        unhealthyThreshold: 2,
    },
    logging: {
        level: 'info',
        logRetentionDays: 30,
    },
    security: {
        enableEncryption: true,
        encryptionKey: 'your-encryption-key',
        complianceStandards: ['GDPR', 'HIPAA'],
    },
};