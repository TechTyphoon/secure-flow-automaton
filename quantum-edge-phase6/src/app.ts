import { QuantumConfig } from './config/quantum-config';
import { NetworkConfig } from './config/network-config';
import { DeploymentConfig } from './config/deployment-config';
import { Orchestrator } from './services/deployment/orchestrator';
import { Monitoring } from './services/deployment/monitoring';
import { Scaling } from './services/deployment/scaling';
import { QuantumCrypto } from './services/security/quantum-crypto';
import { ThreatDetection } from './services/security/threat-detection';
import { Compliance } from './services/security/compliance';
import { PerformanceMetrics } from './services/analytics/performance-metrics';
import { UsageAnalytics } from './services/analytics/usage-analytics';
import { PredictiveModels } from './services/analytics/predictive-models';

async function initializeQuantumEdgeServices() {
    const orchestrator = new Orchestrator(DeploymentConfig);
    const monitoring = new Monitoring();
    const scaling = new Scaling();
    const quantumCrypto = new QuantumCrypto();
    const threatDetection = new ThreatDetection();
    const compliance = new Compliance();
    const performanceMetrics = new PerformanceMetrics();
    const usageAnalytics = new UsageAnalytics();
    const predictiveModels = new PredictiveModels();

    await orchestrator.setup();
    monitoring.start();
    scaling.enableAutoScaling();
    quantumCrypto.initialize();
    threatDetection.startMonitoring();
    compliance.ensureCompliance();
    performanceMetrics.collectMetrics();
    usageAnalytics.trackUsage();
    predictiveModels.initializeModels();
}

initializeQuantumEdgeServices().catch(error => {
    console.error('Error initializing quantum edge services:', error);
});