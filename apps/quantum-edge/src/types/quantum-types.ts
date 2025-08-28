/**
 * Comprehensive TypeScript Interfaces for Quantum Edge Platform
 * Provides strong type safety for quantum computing operations
 */

// ============= Core Quantum Types =============

export interface QuantumState {
    qubits: number;
    amplitudes: Complex[];
    entanglementMap?: Map<number, number[]>;
    measurement: (basis: MeasurementBasis) => MeasurementResult;
    fidelity?: number;
    coherenceTime?: number; // microseconds
}

export interface Complex {
    real: number;
    imaginary: number;
}

export interface QuantumOperation {
    name: string;
    matrix: Complex[][];
    parameters?: OperationParameters;
    apply: (state: QuantumState) => QuantumState;
    inverse?: () => QuantumOperation;
    controlQubits?: number[];
    targetQubits?: number[];
}

export interface OperationParameters {
    angle?: number;
    phase?: number;
    amplitude?: number;
    time?: number;
}

export interface QuantumCircuit {
    operations: QuantumOperation[];
    qubits: number;
    depth: number;
    metadata?: CircuitMetadata;
    addOperation: (operation: QuantumOperation) => void;
    execute: (initialState: QuantumState) => QuantumState;
    optimize?: () => QuantumCircuit;
    transpile?: (backend: string) => QuantumCircuit;
}

export interface CircuitMetadata {
    name?: string;
    description?: string;
    author?: string;
    created?: Date;
    version?: string;
}

export interface MeasurementBasis {
    name: string;
    operators: Complex[][];
}

export interface MeasurementResult {
    outcome: number[];
    probability: number;
    postMeasurementState?: QuantumState;
}

export interface QuantumMeasurement {
    observable: string;
    result: number;
    probability: number;
    uncertainty?: number;
    timestamp?: number;
}

export interface QuantumAlgorithm {
    name: string;
    description: string;
    inputType: string;
    outputType: string;
    requiredQubits: number;
    run: (input: QuantumAlgorithmInput) => Promise<QuantumAlgorithmOutput>;
    validateInput?: (input: QuantumAlgorithmInput) => boolean;
}

export interface QuantumAlgorithmInput {
    data: number[] | Complex[] | QuantumState;
    parameters?: AlgorithmParameters;
}

export interface QuantumAlgorithmOutput {
    result: number[] | Complex[] | QuantumState;
    metadata?: AlgorithmMetadata;
}

export interface AlgorithmParameters {
    iterations?: number;
    precision?: number;
    optimizationLevel?: number;
    errorMitigation?: boolean;
}

export interface AlgorithmMetadata {
    executionTime: number;
    gatesUsed: number;
    circuitDepth: number;
    successProbability?: number;
}

// ============= Financial Quantum Types =============

export interface QuantumData {
    id: string;
    type: 'financial' | 'scientific' | 'cryptographic' | 'optimization';
    payload: DataPayload;
    timestamp: number;
    priority?: number;
}

export interface DataPayload {
    raw?: number[];
    processed?: number[];
    metadata?: Record<string, unknown>;
}

export interface FinancialData {
    assetId: string;
    prices: number[];
    volumes?: number[];
    timestamps?: number[];
    volatility?: number;
    returns?: number[];
    correlations?: Map<string, number>;
}

export interface QuantumResult {
    id: string;
    status: 'success' | 'partial' | 'failed';
    data: ResultData;
    confidence?: number;
    error?: QuantumError;
}

export interface ResultData {
    value: number | number[] | Complex | Complex[];
    uncertainty?: number;
    metadata?: Record<string, unknown>;
}

export interface QuantumError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    recoverable?: boolean;
}

// ============= Quantum Network Types =============

export interface QuantumNetworkNode {
    nodeId: string;
    type: 'quantum' | 'classical' | 'hybrid';
    capabilities: NodeCapabilities;
    status: NodeStatus;
    connections: string[];
}

export interface NodeCapabilities {
    maxQubits: number;
    gateSet: string[];
    connectivity: 'full' | 'limited' | 'nearest-neighbor';
    coherenceTime: number;
    gateTime: number;
    readoutError: number;
}

export type NodeStatus = 'online' | 'offline' | 'maintenance' | 'busy';

export interface QuantumChannel {
    channelId: string;
    source: string;
    destination: string;
    type: 'teleportation' | 'superdense' | 'qkd' | 'entanglement';
    capacity: number;
    fidelity: number;
    latency: number;
}

export interface EntanglementPair {
    pairId: string;
    qubit1: QubitReference;
    qubit2: QubitReference;
    fidelity: number;
    createdAt: number;
    expiresAt?: number;
}

export interface QubitReference {
    nodeId: string;
    qubitIndex: number;
}

// ============= Quantum Security Types =============

export interface QuantumKey {
    keyId: string;
    type: 'symmetric' | 'asymmetric';
    algorithm: 'BB84' | 'E91' | 'SARG04' | 'COW';
    bits: string;
    createdAt: number;
    expiresAt?: number;
}

export interface QuantumSignature {
    signatureId: string;
    message: string;
    signature: string;
    publicKey: string;
    algorithm: string;
    verified?: boolean;
}

export interface SecurityProtocol {
    name: string;
    version: string;
    quantumSafe: boolean;
    parameters: SecurityParameters;
}

export interface SecurityParameters {
    keyLength?: number;
    hashFunction?: string;
    errorCorrection?: string;
    privacyAmplification?: boolean;
}

// ============= Quantum Computing Backend Types =============

export interface QuantumBackend {
    name: string;
    provider: string;
    type: 'simulator' | 'hardware' | 'cloud';
    qubits: number;
    gates: GateSet;
    connectivity: QubitConnectivity;
    calibration?: CalibrationData;
}

export interface GateSet {
    single: string[];
    two: string[];
    multi?: string[];
    custom?: CustomGate[];
}

export interface CustomGate {
    name: string;
    matrix: Complex[][];
    parameters?: number[];
}

export interface QubitConnectivity {
    topology: 'full' | 'linear' | 'grid' | 'custom';
    couplingMap?: number[][];
}

export interface CalibrationData {
    timestamp: number;
    t1Times: number[]; // Relaxation times
    t2Times: number[]; // Dephasing times
    gateErrors: Map<string, number>;
    readoutErrors: number[];
}

// ============= Quantum Optimization Types =============

export interface OptimizationProblem {
    type: 'QUBO' | 'Ising' | 'VQE' | 'QAOA';
    objective: ObjectiveFunction;
    constraints?: Constraint[];
    bounds?: Bounds;
}

export interface ObjectiveFunction {
    expression: string | number[][];
    variables: Variable[];
    minimize: boolean;
}

export interface Variable {
    name: string;
    type: 'binary' | 'integer' | 'continuous';
    value?: number;
}

export interface Constraint {
    type: 'equality' | 'inequality';
    expression: string;
    value: number;
}

export interface Bounds {
    lower?: number[];
    upper?: number[];
}

export interface OptimizationResult {
    solution: number[];
    objectiveValue: number;
    iterations: number;
    converged: boolean;
    metadata?: OptimizationMetadata;
}

export interface OptimizationMetadata {
    algorithm: string;
    runtime: number;
    evaluations: number;
    improvement: number;
}

// ============= Quantum Machine Learning Types =============

export interface QuantumModel {
    modelId: string;
    type: 'classification' | 'regression' | 'clustering' | 'generation';
    architecture: ModelArchitecture;
    parameters: ModelParameters;
    trained: boolean;
}

export interface ModelArchitecture {
    layers: QuantumLayer[];
    inputDimension: number;
    outputDimension: number;
}

export interface QuantumLayer {
    type: 'encoding' | 'variational' | 'measurement';
    qubits: number;
    gates: string[];
    parameters?: number[];
}

export interface ModelParameters {
    weights: number[];
    biases?: number[];
    learningRate?: number;
    optimizer?: string;
}

export interface TrainingData {
    features: number[][];
    labels?: number[];
    validation?: ValidationSet;
}

export interface ValidationSet {
    features: number[][];
    labels: number[];
}

export interface TrainingResult {
    loss: number[];
    accuracy?: number[];
    finalWeights: number[];
    epochs: number;
}

// ============= Quantum Simulation Types =============

export interface QuantumSimulation {
    simulationId: string;
    type: 'dynamics' | 'ground-state' | 'thermal' | 'open-system';
    system: QuantumSystem;
    parameters: SimulationParameters;
}

export interface QuantumSystem {
    hamiltonian: Hamiltonian;
    initialState: QuantumState;
    observables?: Observable[];
}

export interface Hamiltonian {
    terms: HamiltonianTerm[];
    dimension: number;
    hermitian: boolean;
}

export interface HamiltonianTerm {
    operator: string | Complex[][];
    coefficient: Complex;
    sites?: number[];
}

export interface Observable {
    name: string;
    operator: Complex[][];
    expectationValue?: number;
}

export interface SimulationParameters {
    timeStep?: number;
    totalTime?: number;
    method?: 'trotterization' | 'exact' | 'variational';
    precision?: number;
}

export interface SimulationResult {
    times: number[];
    states?: QuantumState[];
    observables?: Map<string, number[]>;
    fidelity?: number[];
}

// ============= Quantum Error Correction Types =============

export interface ErrorCorrectionCode {
    name: string;
    type: 'stabilizer' | 'topological' | 'bosonic';
    distance: number;
    rate: number;
    threshold?: number;
}

export interface Syndrome {
    measurements: boolean[];
    error?: ErrorPattern;
    correctable: boolean;
}

export interface ErrorPattern {
    type: 'bit-flip' | 'phase-flip' | 'both';
    locations: number[];
    probability?: number;
}

export interface DecoderResult {
    correction: QuantumOperation[];
    success: boolean;
    confidence?: number;
}

// ============= Quantum Resource Management Types =============

export interface QuantumResource {
    resourceId: string;
    type: 'qubit' | 'gate' | 'measurement' | 'entanglement';
    allocated: boolean;
    owner?: string;
    expiresAt?: number;
}

export interface ResourceAllocation {
    allocationId: string;
    resources: QuantumResource[];
    priority: number;
    duration?: number;
}

export interface ResourceMetrics {
    utilization: number;
    availability: number;
    queueLength: number;
    averageWaitTime: number;
}

// ============= Event and Monitoring Types =============

export interface QuantumEvent {
    eventId: string;
    type: 'measurement' | 'gate' | 'error' | 'allocation' | 'network';
    timestamp: number;
    source: string;
    data: Record<string, unknown>;
    severity?: 'info' | 'warning' | 'error' | 'critical';
}

export interface PerformanceMetrics {
    executionTime: number;
    gateCount: number;
    circuitDepth: number;
    successRate: number;
    fidelity?: number;
    throughput?: number;
}

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'critical';
    components: ComponentHealth[];
    lastCheck: number;
}

export interface ComponentHealth {
    name: string;
    status: 'up' | 'down' | 'warning';
    metrics?: Record<string, number>;
    message?: string;
}

// ============= Utility Types =============

export type QuantumGate = 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'CNOT' | 'CZ' | 'SWAP' | 'Toffoli';

export type QuantumRegister = {
    name: string;
    size: number;
    qubits: number[];
};

export type ClassicalRegister = {
    name: string;
    size: number;
    bits: boolean[];
};

export interface QuantumInstruction {
    gate: QuantumGate | string;
    qubits: number[];
    parameters?: number[];
    condition?: ClassicalCondition;
}

export interface ClassicalCondition {
    register: string;
    value: number;
}

// Export type guards for runtime type checking
export const isQuantumState = (obj: unknown): obj is QuantumState => {
    return typeof obj === 'object' && obj !== null && 'qubits' in obj && 'amplitudes' in obj;
};

export const isFinancialData = (obj: unknown): obj is FinancialData => {
    return typeof obj === 'object' && obj !== null && 'assetId' in obj && 'prices' in obj;
};

export const isQuantumResult = (obj: unknown): obj is QuantumResult => {
    return typeof obj === 'object' && obj !== null && 'id' in obj && 'status' in obj && 'data' in obj;
};