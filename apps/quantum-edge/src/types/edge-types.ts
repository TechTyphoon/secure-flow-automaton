export type EdgeDevice = {
    id: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance';
    capabilities: string[];
    location: {
        latitude: number;
        longitude: number;
    };
};

export type EdgeService = {
    id: string;
    name: string;
    description: string;
    version: string;
    status: 'running' | 'stopped' | 'error';
    deviceId: string;
    metrics: {
        latency: number;
        throughput: number;
        errorRate: number;
    };
};

export type EdgeNetwork = {
    id: string;
    devices: EdgeDevice[];
    services: EdgeService[];
    topology: 'star' | 'mesh' | 'tree';
    bandwidth: number; // in Mbps
};