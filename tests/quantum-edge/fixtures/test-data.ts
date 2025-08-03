// This file contains mock data used for testing purposes.

export const mockHealthcareData = {
    patientId: '12345',
    symptoms: ['fever', 'cough', 'fatigue'],
    diagnosis: 'Influenza',
    treatment: {
        medication: ['Oseltamivir'],
        dosage: '75mg twice daily for 5 days'
    }
};

export const mockFinanceData = {
    userId: '67890',
    transactions: [
        { id: 't1', amount: 150.00, type: 'credit', date: '2025-07-01' },
        { id: 't2', amount: 50.00, type: 'debit', date: '2025-07-02' }
    ],
    balance: 1000.00
};

export const mockManufacturingData = {
    factoryId: 'factory-001',
    productionMetrics: {
        output: 5000,
        defects: 50,
        efficiency: 95
    },
    maintenanceSchedule: [
        { machineId: 'm1', nextService: '2025-08-01' },
        { machineId: 'm2', nextService: '2025-09-01' }
    ]
};

export const mockSmartCityData = {
    cityId: 'city-001',
    trafficData: {
        congestionLevel: 'moderate',
        averageSpeed: 30,
        incidents: [
            { type: 'accident', location: 'Main St', severity: 'minor' }
        ]
    },
    environmentalData: {
        airQualityIndex: 42,
        noiseLevel: 55
    }
};