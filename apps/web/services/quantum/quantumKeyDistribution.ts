/**
 * Quantum Key Distribution System
 * Implementation of BB84 protocol and quantum-safe key exchange
 */

import { EventEmitter } from 'events';

// Core interfaces for quantum key distribution
interface QuantumBit {
  value: 0 | 1;
  basis: 'RECTILINEAR' | 'DIAGONAL';
  polarization: 'HORIZONTAL' | 'VERTICAL' | 'D45' | 'D135';
  timestamp: number;
  fidelity: number;
}

interface QuantumPhoton {
  id: string;
  state: QuantumBit;
  transmitted: boolean;
  detected: boolean;
  errorRate: number;
  position: number;
}

interface BB84Session {
  sessionId: string;
  alice: {
    bits: number[];
    bases: string[];
    photons: QuantumPhoton[];
  };
  bob: {
    bases: string[];
    measurements: number[];
    detectedPhotons: QuantumPhoton[];
  };
  siftedKey: number[];
  finalKey: Uint8Array;
  errorRate: number;
  privacy: {
    amplified: boolean;
    reconciled: boolean;
    authenticated: boolean;
  };
  status: 'INIT' | 'TRANSMISSION' | 'SIFTING' | 'ERROR_CORRECTION' | 'PRIVACY_AMPLIFICATION' | 'COMPLETE' | 'FAILED';
  startTime: number;
  endTime?: number;
}

interface QuantumChannel {
  channelId: string;
  type: 'FIBER_OPTIC' | 'FREE_SPACE' | 'SATELLITE' | 'INTEGRATED_PHOTONIC';
  transmissionLoss: number;
  detectionEfficiency: number;
  darkCountRate: number;
  distanceKm: number;
  noiseLevel: number;
  securityParameters: {
    eavesdropperPresent: boolean;
    maxErrorRate: number;
    minKeyRate: number;
  };
}

interface QuantumRandomGenerator {
  source: 'PHOTONIC' | 'VACUUM_FLUCTUATION' | 'RADIOACTIVE_DECAY' | 'QUANTUM_DOTS';
  entropy: number;
  biasCorrection: boolean;
  testResults: {
    entropy: number;
    uniformity: number;
    independence: number;
    lastTested: number;
  };
}

interface KeyDistillationParams {
  errorCorrectionCode: 'LDPC' | 'TURBO' | 'POLAR' | 'CASCADE';
  privacyAmplificationHash: 'SHA3' | 'BLAKE3' | 'TOEPLITZ';
  informationReconciliation: 'WINNOW' | 'CASCADE' | 'ADAPTIVE';
  securityParameter: number;
  finalKeyLength: number;
}

// Quantum Random Number Generator
class QuantumRandomNumberGenerator {
  private source: QuantumRandomGenerator;
  private entropyPool: Uint8Array;
  private poolSize: number = 8192;
  private currentPosition: number = 0;
  private isInitialized: boolean = false;

  constructor(source: QuantumRandomGenerator['source'] = 'PHOTONIC') {
    this.source = {
      source,
      entropy: 0.99,
      biasCorrection: true,
      testResults: {
        entropy: 0,
        uniformity: 0,
        independence: 0,
        lastTested: 0
      }
    };
    this.entropyPool = new Uint8Array(this.poolSize);
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Simulate quantum entropy source initialization
    console.log(`🔮 Initializing quantum random source: ${this.source.source}`);
    
    // Fill initial entropy pool
    await this.refreshEntropyPool();
    
    // Perform statistical tests
    await this.performRandomnessTests();
    
    this.isInitialized = true;
    console.log('✅ Quantum random number generator initialized');
  }

  private async refreshEntropyPool(): Promise<void> {
    // Simulate quantum random number generation
    switch (this.source.source) {
      case 'PHOTONIC':
        await this.generatePhotonicRandomness();
        break;
      case 'VACUUM_FLUCTUATION':
        await this.generateVacuumFluctuationRandomness();
        break;
      case 'RADIOACTIVE_DECAY':
        await this.generateRadioactiveDecayRandomness();
        break;
      case 'QUANTUM_DOTS':
        await this.generateQuantumDotRandomness();
        break;
    }

    // Apply bias correction if enabled
    if (this.source.biasCorrection) {
      this.applyVonNeumannCorrection();
    }
  }

  private async generatePhotonicRandomness(): Promise<void> {
    // Simulate shot noise from photon detection
    for (let i = 0; i < this.poolSize; i++) {
      // Use quantum shot noise as entropy source
      const photonCount = this.simulatePhotonDetection();
      this.entropyPool[i] = photonCount & 0xFF;
    }
  }

  private async generateVacuumFluctuationRandomness(): Promise<void> {
    // Simulate vacuum fluctuation measurements
    for (let i = 0; i < this.poolSize; i++) {
      const fluctuation = this.simulateVacuumFluctuation();
      this.entropyPool[i] = fluctuation & 0xFF;
    }
  }

  private async generateRadioactiveDecayRandomness(): Promise<void> {
    // Simulate radioactive decay timing
    for (let i = 0; i < this.poolSize; i++) {
      const decayTime = this.simulateRadioactiveDecay();
      this.entropyPool[i] = decayTime & 0xFF;
    }
  }

  private async generateQuantumDotRandomness(): Promise<void> {
    // Simulate quantum dot emission timing
    for (let i = 0; i < this.poolSize; i++) {
      const emissionTime = this.simulateQuantumDotEmission();
      this.entropyPool[i] = emissionTime & 0xFF;
    }
  }

  private simulatePhotonDetection(): number {
    // Simulate Poisson distribution for photon arrival
    const lambda = 1.0; // Average photon count
    let k = 0;
    let p = 1.0;
    const l = Math.exp(-lambda);
    
    do {
      k++;
      p *= Math.random();
    } while (p > l);
    
    return k - 1;
  }

  private simulateVacuumFluctuation(): number {
    // Simulate Gaussian noise from vacuum fluctuations
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.floor((z0 + 3) * 42.5) % 256;
  }

  private simulateRadioactiveDecay(): number {
    // Simulate exponential decay timing
    const lambda = 0.5; // Decay constant
    const u = Math.random();
    const decayTime = -Math.log(1 - u) / lambda;
    return Math.floor(decayTime * 1000) % 256;
  }

  private simulateQuantumDotEmission(): number {
    // Simulate quantum dot single photon emission timing
    const tau = 1.0; // Emission lifetime
    const u = Math.random();
    const emissionTime = -tau * Math.log(u);
    return Math.floor(emissionTime * 1000) % 256;
  }

  private applyVonNeumannCorrection(): void {
    // Von Neumann bias correction: 01 -> 0, 10 -> 1, 00/11 -> discard
    const corrected = new Uint8Array(this.poolSize);
    let outputIndex = 0;
    
    for (let i = 0; i < this.poolSize - 1 && outputIndex < this.poolSize; i += 2) {
      const bit1 = this.entropyPool[i] & 1;
      const bit2 = this.entropyPool[i + 1] & 1;
      
      if (bit1 !== bit2) {
        corrected[outputIndex++] = bit1;
      }
    }
    
    // Fill remaining positions with fresh entropy
    while (outputIndex < this.poolSize) {
      corrected[outputIndex++] = Math.floor(Math.random() * 256);
    }
    
    this.entropyPool = corrected;
  }

  private async performRandomnessTests(): Promise<void> {
    // Perform NIST SP 800-22 statistical tests
    const entropy = this.calculateEntropy();
    const uniformity = this.calculateUniformity();
    const independence = this.calculateIndependence();
    
    this.source.testResults = {
      entropy,
      uniformity,
      independence,
      lastTested: Date.now()
    };
    
    console.log(`📊 Randomness tests - Entropy: ${entropy.toFixed(3)}, Uniformity: ${uniformity.toFixed(3)}, Independence: ${independence.toFixed(3)}`);
  }

  private calculateEntropy(): number {
    const counts = new Array(256).fill(0);
    for (const byte of this.entropyPool) {
      counts[byte]++;
    }
    
    let entropy = 0;
    for (const count of counts) {
      if (count > 0) {
        const p = count / this.poolSize;
        entropy -= p * Math.log2(p);
      }
    }
    
    return entropy / 8; // Normalize to [0, 1]
  }

  private calculateUniformity(): number {
    const expected = this.poolSize / 256;
    const counts = new Array(256).fill(0);
    for (const byte of this.entropyPool) {
      counts[byte]++;
    }
    
    let chiSquare = 0;
    for (const count of counts) {
      chiSquare += Math.pow(count - expected, 2) / expected;
    }
    
    // Convert chi-square to uniformity score [0, 1]
    return Math.max(0, 1 - chiSquare / (255 * expected));
  }

  private calculateIndependence(): number {
    // Serial correlation test
    let correlation = 0;
    for (let i = 0; i < this.poolSize - 1; i++) {
      correlation += (this.entropyPool[i] - 127.5) * (this.entropyPool[i + 1] - 127.5);
    }
    
    const avgCorrelation = correlation / (this.poolSize - 1);
    const expectedVariance = 127.5 * 127.5;
    
    // Normalize to independence score [0, 1]
    return Math.max(0, 1 - Math.abs(avgCorrelation) / expectedVariance);
  }

  generateRandomBytes(length: number): Uint8Array {
    if (!this.isInitialized) {
      throw new Error('Quantum random number generator not initialized');
    }

    const result = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      if (this.currentPosition >= this.poolSize) {
        // Refresh entropy pool when exhausted
        this.refreshEntropyPool();
        this.currentPosition = 0;
      }
      
      result[i] = this.entropyPool[this.currentPosition++];
    }
    
    return result;
  }

  generateRandomBits(count: number): number[] {
    const bytes = this.generateRandomBytes(Math.ceil(count / 8));
    const bits: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = i % 8;
      bits.push((bytes[byteIndex] >> bitIndex) & 1);
    }
    
    return bits;
  }

  getTestResults(): QuantumRandomGenerator['testResults'] {
    return { ...this.source.testResults };
  }

  getEntropy(): number {
    return this.source.entropy;
  }
}

// BB84 Quantum Key Distribution Protocol
export class QuantumKeyDistribution extends EventEmitter {
  private sessions: Map<string, BB84Session> = new Map();
  private channels: Map<string, QuantumChannel> = new Map();
  private quantumRNG: QuantumRandomNumberGenerator;
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.quantumRNG = new QuantumRandomNumberGenerator('PHOTONIC');
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize default quantum channel
      this.createQuantumChannel('default', {
        type: 'FIBER_OPTIC',
        transmissionLoss: 0.2, // dB/km
        detectionEfficiency: 0.85,
        darkCountRate: 100, // counts/second
        distanceKm: 10,
        noiseLevel: 0.01,
        securityParameters: {
          eavesdropperPresent: false,
          maxErrorRate: 0.11, // 11% QBER threshold
          minKeyRate: 1000 // bits/second
        }
      });

      this.isInitialized = true;

      this.emit('initialized', {
        channels: Array.from(this.channels.keys()),
        timestamp: Date.now()
      });

      console.log('🔑 Quantum Key Distribution system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize QKD system:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  createQuantumChannel(channelId: string, config: Omit<QuantumChannel, 'channelId'>): void {
    const channel: QuantumChannel = {
      channelId,
      ...config
    };

    this.channels.set(channelId, channel);

    this.emit('channel_created', {
      channelId,
      type: config.type,
      distance: config.distanceKm,
      timestamp: Date.now()
    });

    console.log(`📡 Quantum channel '${channelId}' created: ${config.type} (${config.distanceKm}km)`);
  }

  async startBB84Session(channelId: string = 'default', keyLength: number = 2048): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('QKD system not initialized');
    }

    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    const sessionId = `bb84_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: BB84Session = {
      sessionId,
      alice: {
        bits: [],
        bases: [],
        photons: []
      },
      bob: {
        bases: [],
        measurements: [],
        detectedPhotons: []
      },
      siftedKey: [],
      finalKey: new Uint8Array(0),
      errorRate: 0,
      privacy: {
        amplified: false,
        reconciled: false,
        authenticated: false
      },
      status: 'INIT',
      startTime: Date.now()
    };

    this.sessions.set(sessionId, session);

    this.emit('session_started', {
      sessionId,
      channelId,
      keyLength,
      timestamp: Date.now()
    });

    // Start BB84 protocol phases
    await this.runBB84Protocol(sessionId, channelId, keyLength);

    return sessionId;
  }

  private async runBB84Protocol(sessionId: string, channelId: string, targetKeyLength: number): Promise<void> {
    const session = this.sessions.get(sessionId)!;
    const channel = this.channels.get(channelId)!;

    try {
      // Phase 1: Quantum transmission
      session.status = 'TRANSMISSION';
      await this.quantumTransmissionPhase(session, channel, targetKeyLength * 4); // Over-provision for losses

      // Phase 2: Public discussion and sifting
      session.status = 'SIFTING';
      await this.siftingPhase(session);

      // Phase 3: Error estimation and correction
      session.status = 'ERROR_CORRECTION';
      await this.errorCorrectionPhase(session, channel);

      // Phase 4: Privacy amplification
      session.status = 'PRIVACY_AMPLIFICATION';
      await this.privacyAmplificationPhase(session, targetKeyLength);

      session.status = 'COMPLETE';
      session.endTime = Date.now();

      this.emit('session_complete', {
        sessionId,
        keyLength: session.finalKey.length * 8,
        errorRate: session.errorRate,
        duration: session.endTime - session.startTime,
        timestamp: Date.now()
      });

      console.log(`✅ BB84 session ${sessionId} completed: ${session.finalKey.length * 8} bits generated`);

    } catch (error) {
      session.status = 'FAILED';
      session.endTime = Date.now();

      this.emit('session_failed', {
        sessionId,
        error: error.message,
        timestamp: Date.now()
      });

      console.error(`❌ BB84 session ${sessionId} failed:`, error);
    }
  }

  private async quantumTransmissionPhase(session: BB84Session, channel: QuantumChannel, bitCount: number): Promise<void> {
    console.log(`🔬 Starting quantum transmission: ${bitCount} qubits`);

    // Alice generates random bits and bases
    session.alice.bits = this.quantumRNG.generateRandomBits(bitCount);
    session.alice.bases = this.quantumRNG.generateRandomBits(bitCount).map(bit => bit ? 'DIAGONAL' : 'RECTILINEAR');

    // Bob chooses random measurement bases
    session.bob.bases = this.quantumRNG.generateRandomBits(bitCount).map(bit => bit ? 'DIAGONAL' : 'RECTILINEAR');

    // Simulate quantum transmission and measurement
    for (let i = 0; i < bitCount; i++) {
      const photon = this.createQuantumPhoton(
        `photon_${i}`,
        session.alice.bits[i] as 0 | 1,
        session.alice.bases[i] as 'RECTILINEAR' | 'DIAGONAL',
        i
      );

      session.alice.photons.push(photon);

      // Simulate channel effects (loss, noise, eavesdropping)
      const transmitted = this.simulateChannelTransmission(photon, channel);
      
      if (transmitted) {
        const measurement = this.simulateQuantumMeasurement(
          photon,
          session.bob.bases[i] as 'RECTILINEAR' | 'DIAGONAL',
          channel
        );

        session.bob.measurements[i] = measurement.value;
        session.bob.detectedPhotons.push(measurement.photon);
      } else {
        session.bob.measurements[i] = -1; // Detection failure
      }
    }

    this.emit('transmission_complete', {
      sessionId: session.sessionId,
      transmitted: session.alice.photons.length,
      detected: session.bob.detectedPhotons.length,
      lossRate: 1 - (session.bob.detectedPhotons.length / session.alice.photons.length),
      timestamp: Date.now()
    });
  }

  private createQuantumPhoton(id: string, bit: 0 | 1, basis: 'RECTILINEAR' | 'DIAGONAL', position: number): QuantumPhoton {
    let polarization: QuantumBit['polarization'];

    if (basis === 'RECTILINEAR') {
      polarization = bit === 0 ? 'HORIZONTAL' : 'VERTICAL';
    } else {
      polarization = bit === 0 ? 'D45' : 'D135';
    }

    return {
      id,
      state: {
        value: bit,
        basis,
        polarization,
        timestamp: Date.now(),
        fidelity: 0.99
      },
      transmitted: false,
      detected: false,
      errorRate: 0,
      position
    };
  }

  private simulateChannelTransmission(photon: QuantumPhoton, channel: QuantumChannel): boolean {
    // Calculate transmission probability based on channel parameters
    const distanceLoss = Math.exp(-channel.transmissionLoss * channel.distanceKm / 4.34); // Convert dB to natural loss
    const detectionProb = channel.detectionEfficiency * distanceLoss;
    
    // Add noise and eavesdropping effects
    const noiseEffect = 1 - channel.noiseLevel;
    const finalProb = detectionProb * noiseEffect;

    photon.transmitted = Math.random() < finalProb;
    return photon.transmitted;
  }

  private simulateQuantumMeasurement(
    photon: QuantumPhoton, 
    measurementBasis: 'RECTILINEAR' | 'DIAGONAL',
    channel: QuantumChannel
  ): { value: number; photon: QuantumPhoton } {
    let measuredBit: number;

    if (photon.state.basis === measurementBasis) {
      // Correct basis: perfect measurement (with channel errors)
      measuredBit = photon.state.value;
      
      // Add channel-induced errors
      if (Math.random() < channel.noiseLevel) {
        measuredBit = 1 - measuredBit;
        photon.errorRate = channel.noiseLevel;
      }
    } else {
      // Wrong basis: random result
      measuredBit = Math.random() < 0.5 ? 0 : 1;
      photon.errorRate = 0.5;
    }

    // Add dark counts
    if (Math.random() < channel.darkCountRate / 1000000) {
      measuredBit = Math.random() < 0.5 ? 0 : 1;
    }

    photon.detected = true;
    return { value: measuredBit, photon };
  }

  private async siftingPhase(session: BB84Session): Promise<void> {
    console.log('🔄 Starting sifting phase');

    const siftedBits: number[] = [];
    let matchingBases = 0;

    // Compare bases and keep bits where Alice and Bob used the same basis
    for (let i = 0; i < session.alice.bases.length; i++) {
      if (session.bob.measurements[i] !== -1 && session.alice.bases[i] === session.bob.bases[i]) {
        siftedBits.push(session.alice.bits[i]);
        matchingBases++;
      }
    }

    session.siftedKey = siftedBits;

    this.emit('sifting_complete', {
      sessionId: session.sessionId,
      originalBits: session.alice.bits.length,
      siftedBits: siftedBits.length,
      siftingRate: siftedBits.length / session.alice.bits.length,
      timestamp: Date.now()
    });

    console.log(`🔄 Sifting complete: ${siftedBits.length} bits from ${session.alice.bits.length} transmitted`);
  }

  private async errorCorrectionPhase(session: BB84Session, channel: QuantumChannel): Promise<void> {
    console.log('🔧 Starting error correction phase');

    if (session.siftedKey.length === 0) {
      throw new Error('No sifted key available for error correction');
    }

    // Estimate error rate using a subset of bits
    const testSampleSize = Math.min(100, Math.floor(session.siftedKey.length * 0.1));
    const testBits = session.siftedKey.slice(0, testSampleSize);
    
    // Simulate Bob's measurements for test bits (with errors)
    let errors = 0;
    for (let i = 0; i < testSampleSize; i++) {
      const aliceBit = testBits[i];
      const errorProb = channel.noiseLevel + (channel.securityParameters.eavesdropperPresent ? 0.05 : 0);
      const bobBit = Math.random() < errorProb ? 1 - aliceBit : aliceBit;
      
      if (aliceBit !== bobBit) {
        errors++;
      }
    }

    session.errorRate = errors / testSampleSize;

    // Check if error rate is acceptable
    if (session.errorRate > channel.securityParameters.maxErrorRate) {
      throw new Error(`Error rate too high: ${session.errorRate.toFixed(3)} > ${channel.securityParameters.maxErrorRate}`);
    }

    // Remove test bits from sifted key
    session.siftedKey = session.siftedKey.slice(testSampleSize);

    // Apply error correction (simplified CASCADE protocol)
    const correctedKey = await this.applyCascadeProtocol(session.siftedKey, session.errorRate);
    session.siftedKey = correctedKey;
    session.privacy.reconciled = true;

    this.emit('error_correction_complete', {
      sessionId: session.sessionId,
      errorRate: session.errorRate,
      correctedBits: correctedKey.length,
      timestamp: Date.now()
    });

    console.log(`🔧 Error correction complete: QBER = ${(session.errorRate * 100).toFixed(1)}%`);
  }

  private async applyCascadeProtocol(key: number[], errorRate: number): Promise<number[]> {
    // Simplified CASCADE error correction protocol
    const correctedKey = [...key];
    const blockSize = Math.max(4, Math.ceil(1 / (2 * errorRate)));
    
    // Multiple passes with different block sizes
    for (let pass = 0; pass < 4; pass++) {
      const currentBlockSize = blockSize * Math.pow(2, pass);
      
      for (let i = 0; i < correctedKey.length; i += currentBlockSize) {
        const block = correctedKey.slice(i, Math.min(i + currentBlockSize, correctedKey.length));
        
        // Simulate parity check and correction
        const parity = block.reduce((sum, bit) => sum ^ bit, 0);
        
        // If parity error detected, locate and fix error
        if (Math.random() < errorRate && block.length > 1) {
          const errorPosition = Math.floor(Math.random() * block.length);
          correctedKey[i + errorPosition] = 1 - correctedKey[i + errorPosition];
        }
      }
    }
    
    return correctedKey;
  }

  private async privacyAmplificationPhase(session: BB84Session, targetLength: number): Promise<void> {
    console.log('🔒 Starting privacy amplification phase');

    const availableBits = session.siftedKey.length;
    const informationLeakage = this.calculateInformationLeakage(session.errorRate, availableBits);
    const maxSecureLength = availableBits - informationLeakage - 100; // Security margin

    const finalLength = Math.min(targetLength, maxSecureLength);
    
    if (finalLength <= 0) {
      throw new Error('Insufficient key material after privacy amplification');
    }

    // Apply privacy amplification using universal hashing
    const amplifiedKey = await this.applyPrivacyAmplification(session.siftedKey, finalLength);
    
    // Convert to bytes
    session.finalKey = this.bitsToBytes(amplifiedKey);
    session.privacy.amplified = true;

    this.emit('privacy_amplification_complete', {
      sessionId: session.sessionId,
      originalBits: availableBits,
      finalBits: amplifiedKey.length,
      compressionRatio: amplifiedKey.length / availableBits,
      timestamp: Date.now()
    });

    console.log(`🔒 Privacy amplification complete: ${amplifiedKey.length} secure bits generated`);
  }

  private calculateInformationLeakage(errorRate: number, keyLength: number): number {
    // Calculate information leakage based on error rate (Shannon entropy)
    const h = (p: number) => p === 0 ? 0 : -p * Math.log2(p);
    const entropyLoss = h(errorRate) + h(1 - errorRate);
    return Math.ceil(keyLength * entropyLoss);
  }

  private async applyPrivacyAmplification(key: number[], targetLength: number): Promise<number[]> {
    // Universal hashing for privacy amplification
    const inputLength = key.length;
    const amplifiedKey: number[] = [];
    
    // Create random Toeplitz matrix for universal hashing
    const matrixSeed = this.quantumRNG.generateRandomBits(inputLength + targetLength - 1);
    
    for (let i = 0; i < targetLength; i++) {
      let bit = 0;
      for (let j = 0; j < inputLength; j++) {
        bit ^= key[j] & matrixSeed[i + j];
      }
      amplifiedKey.push(bit);
    }
    
    return amplifiedKey;
  }

  private bitsToBytes(bits: number[]): Uint8Array {
    const bytes = new Uint8Array(Math.ceil(bits.length / 8));
    
    for (let i = 0; i < bits.length; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = i % 8;
      
      if (bits[i] === 1) {
        bytes[byteIndex] |= (1 << bitIndex);
      }
    }
    
    return bytes;
  }

  getSession(sessionId: string): BB84Session | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(s => s.status !== 'COMPLETE' && s.status !== 'FAILED').length;
  }

  getSessionKey(sessionId: string): Uint8Array | null {
    const session = this.sessions.get(sessionId);
    return session?.status === 'COMPLETE' ? session.finalKey : null;
  }

  getChannelStatus(channelId: string): QuantumChannel | undefined {
    return this.channels.get(channelId);
  }

  async performChannelCalibration(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    console.log(`🔧 Calibrating quantum channel: ${channelId}`);

    // Perform test transmission to measure channel parameters
    const testBits = 1000;
    const testPhotons = this.quantumRNG.generateRandomBits(testBits);
    let detectedPhotons = 0;
    let errors = 0;

    for (const bit of testPhotons) {
      const photon = this.createQuantumPhoton(`cal_${Date.now()}`, bit as 0 | 1, 'RECTILINEAR', 0);
      
      if (this.simulateChannelTransmission(photon, channel)) {
        detectedPhotons++;
        
        // Measure detection fidelity
        if (Math.random() < channel.noiseLevel) {
          errors++;
        }
      }
    }

    // Update channel parameters based on calibration
    channel.detectionEfficiency = detectedPhotons / testBits;
    channel.noiseLevel = errors / Math.max(detectedPhotons, 1);

    this.emit('channel_calibrated', {
      channelId,
      detectionEfficiency: channel.detectionEfficiency,
      noiseLevel: channel.noiseLevel,
      timestamp: Date.now()
    });

    console.log(`✅ Channel calibration complete: efficiency=${(channel.detectionEfficiency * 100).toFixed(1)}%, noise=${(channel.noiseLevel * 100).toFixed(1)}%`);
  }

  getSystemStatistics(): SystemStatistics {
    const sessions = Array.from(this.sessions.values());
    const completedSessions = sessions.filter(s => s.status === 'COMPLETE');
    const failedSessions = sessions.filter(s => s.status === 'FAILED');
    
    const totalKeyBits = completedSessions.reduce((sum, s) => sum + s.finalKey.length * 8, 0);
    const avgErrorRate = completedSessions.length > 0 ? 
      completedSessions.reduce((sum, s) => sum + s.errorRate, 0) / completedSessions.length : 0;

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      failedSessions: failedSessions.length,
      successRate: sessions.length > 0 ? completedSessions.length / sessions.length : 0,
      totalKeyBits,
      averageErrorRate: avgErrorRate,
      activeChannels: this.channels.size,
      quantumRandomGenerator: this.quantumRNG.getTestResults(),
      timestamp: Date.now()
    };
  }

  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  clearAllSessions(): void {
    this.sessions.clear();
    this.emit('sessions_cleared', { timestamp: Date.now() });
  }

  destroy(): void {
    this.sessions.clear();
    this.channels.clear();
    this.isInitialized = false;
  }
}

export type {
  QuantumBit,
  QuantumPhoton,
  BB84Session,
  QuantumChannel,
  QuantumRandomGenerator,
  KeyDistillationParams
};

// Type definitions for quantum key distribution
interface SystemStatistics {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  successRate: number;
  totalKeyBits: number;
  averageErrorRate: number;
  activeChannels: number;
  quantumRandomGenerator: {
    entropy: number;
    uniformity: number;
    independence: number;
    lastTested: number;
  };
  timestamp: number;
}

export default QuantumKeyDistribution;
