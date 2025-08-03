export const networkConfig = {
    quantumNetwork: {
        enabled: true,
        bandwidth: '10Gbps',
        latency: '<5ms',
        protocols: ['QKD', 'QKD-Relay', 'Quantum-Safe TCP'],
    },
    edgeConnectivity: {
        edgeNodes: 1000,
        maxDevicesPerNode: 10000,
        redundancy: 'N+1',
    },
    satelliteIntegration: {
        enabled: true,
        satelliteCount: 50,
        coverageArea: 'Global',
    },
    security: {
        encryption: 'Post-Quantum',
        authentication: 'Quantum-Safe',
        compliance: ['ISO 27001', 'NIST SP 800-53'],
    },
};