/**
 * Post-Quantum Cryptography Engine
 * Implementation of NIST-approved quantum-resistant cryptographic algorithms
 */

import { EventEmitter } from 'events';

// Core interfaces for post-quantum cryptography
interface PostQuantumAlgorithm {
  name: string;
  type: 'KEM' | 'SIGNATURE' | 'HASH' | 'SYMMETRIC';
  nistsecurityLevel: 1 | 2 | 3 | 4 | 5;
  keySize: {
    publicKey: number;
    privateKey: number;
    signature?: number;
    ciphertext?: number;
  };
  performance: {
    keyGenTime: number;
    encryptTime: number;
    decryptTime: number;
    signTime?: number;
    verifyTime?: number;
  };
  quantumSecurity: boolean;
  classicalSecurity: boolean;
}

interface CryptographicKey {
  algorithm: string;
  keyType: 'PUBLIC' | 'PRIVATE' | 'SYMMETRIC';
  keyData: Uint8Array;
  keyId: string;
  createdAt: number;
  expiresAt?: number;
  metadata: {
    securityLevel: number;
    quantumSafe: boolean;
    usage: string[];
    version: string;
  };
}

interface EncryptionResult {
  algorithm: string;
  ciphertext: Uint8Array;
  publicKey?: Uint8Array;
  sharedSecret?: Uint8Array;
  metadata: {
    timestamp: number;
    keyId: string;
    securityLevel: number;
  };
}

interface SignatureResult {
  algorithm: string;
  signature: Uint8Array;
  publicKey: Uint8Array;
  message: Uint8Array;
  metadata: {
    timestamp: number;
    keyId: string;
    securityLevel: number;
  };
}

interface HybridCryptoConfig {
  classical: {
    algorithm: string;
    enabled: boolean;
  };
  postQuantum: {
    algorithm: string;
    enabled: boolean;
  };
  combinerMode: 'XOR' | 'CONCATENATE' | 'KDF_COMBINE';
  failoverMode: 'CLASSICAL' | 'POST_QUANTUM' | 'FAIL';
}

// CRYSTALS-Kyber Implementation (KEM)
class CRYSTALSKyber {
  private readonly n: number = 256;
  private readonly q: number = 3329;
  private readonly eta1: number = 3;
  private readonly eta2: number = 2;
  private readonly du: number = 10;
  private readonly dv: number = 4;
  private readonly k: number; // Parameter k for different security levels

  constructor(securityLevel: 512 | 768 | 1024 = 768) {
    switch (securityLevel) {
      case 512:
        this.k = 2; // Kyber512
        break;
      case 768:
        this.k = 3; // Kyber768
        break;
      case 1024:
        this.k = 4; // Kyber1024
        break;
      default:
        this.k = 3;
    }
  }

  async generateKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }> {
    // Simplified Kyber key generation (production would use full lattice-based implementation)
    const seed = this.generateSecureRandom(32);
    
    // Generate polynomial matrix A from seed
    const A = this.generateMatrixA(seed);
    
    // Generate small polynomials s, e
    const s = this.generateSmallPolynomial(this.k, this.eta1);
    const e = this.generateSmallPolynomial(this.k, this.eta1);
    
    // Compute t = As + e
    const t = this.matrixVectorMultiply(A, s);
    this.addPolynomialVector(t, e);
    
    // Pack keys
    const publicKey = this.packPublicKey(t, seed);
    const privateKey = this.packPrivateKey(s);
    
    return { publicKey, privateKey };
  }

  async encapsulate(publicKey: Uint8Array): Promise<{ ciphertext: Uint8Array; sharedSecret: Uint8Array }> {
    // Unpack public key
    const { t, rho } = this.unpackPublicKey(publicKey);
    const A = this.generateMatrixA(rho);
    
    // Generate random message
    const m = this.generateSecureRandom(32);
    
    // Generate small polynomials r, e1, e2
    const r = this.generateSmallPolynomial(this.k, this.eta1);
    const e1 = this.generateSmallPolynomial(this.k, this.eta2);
    const e2 = this.generateSmallPolynomial(1, this.eta2)[0];
    
    // Compute u = A^T * r + e1
    const u = this.matrixVectorMultiply(this.transposeMatrix(A), r);
    this.addPolynomialVector(u, e1);
    
    // Compute v = t^T * r + e2 + Decompress_q(Decode_1(m))
    const v = this.vectorDotProduct(t, r);
    this.addPolynomial(v, e2);
    const messagePolynomial = this.decodeMessage(m);
    this.addPolynomial(v, messagePolynomial);
    
    // Pack ciphertext
    const ciphertext = this.packCiphertext(u, v);
    
    // Derive shared secret
    const sharedSecret = this.sha3_256(m);
    
    return { ciphertext, sharedSecret };
  }

  async decapsulate(ciphertext: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
    // Unpack private key and ciphertext
    const s = this.unpackPrivateKey(privateKey);
    const { u, v } = this.unpackCiphertext(ciphertext);
    
    // Compute m' = Encode_1(Compress_q(v - s^T * u))
    const sTu = this.vectorDotProduct(s, u);
    const diff = this.subtractPolynomial(v, sTu);
    const compressed = this.compressPolynomial(diff, 1);
    const m_prime = this.encodePolynomial(compressed);
    
    // Hash to get shared secret
    const sharedSecret = this.sha3_256(m_prime);
    
    return sharedSecret;
  }

  // Utility methods for polynomial arithmetic and packing
  private generateSecureRandom(length: number): Uint8Array {
    // In production, use quantum random number generator
    const array = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for Node.js environment
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }

  private generateMatrixA(seed: Uint8Array): number[][][] {
    // Generate k x k matrix of polynomials from seed
    const matrix: number[][][] = [];
    for (let i = 0; i < this.k; i++) {
      matrix[i] = [];
      for (let j = 0; j < this.k; j++) {
        matrix[i][j] = this.generatePolynomialFromSeed(seed, i, j);
      }
    }
    return matrix;
  }

  private generatePolynomialFromSeed(seed: Uint8Array, i: number, j: number): number[] {
    // XOF (extendable output function) to generate polynomial coefficients
    const poly = new Array(this.n);
    const context = new Uint8Array([...seed, i, j]);
    
    for (let k = 0; k < this.n; k++) {
      // Simplified coefficient generation (would use SHAKE-128 in production)
      const hash = this.simpleHash([...context, k]);
      poly[k] = hash % this.q;
    }
    
    return poly;
  }

  private generateSmallPolynomial(count: number, eta: number): number[][] {
    const polynomials: number[][] = [];
    
    for (let i = 0; i < count; i++) {
      const poly = new Array(this.n);
      for (let j = 0; j < this.n; j++) {
        // Generate coefficients in range [-eta, eta]
        poly[j] = (Math.floor(Math.random() * (2 * eta + 1)) - eta) % this.q;
        if (poly[j] < 0) poly[j] += this.q;
      }
      polynomials.push(poly);
    }
    
    return polynomials;
  }

  private matrixVectorMultiply(matrix: number[][][], vector: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < matrix.length; i++) {
      const poly = new Array(this.n).fill(0);
      for (let j = 0; j < matrix[i].length; j++) {
        const product = this.multiplyPolynomials(matrix[i][j], vector[j]);
        this.addPolynomial(poly, product);
      }
      result.push(poly);
    }
    
    return result;
  }

  private multiplyPolynomials(a: number[], b: number[]): number[] {
    const result = new Array(this.n).fill(0);
    
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        const k = (i + j) % this.n;
        result[k] = (result[k] + a[i] * b[j]) % this.q;
      }
    }
    
    return result;
  }

  private addPolynomial(a: number[], b: number[]): void {
    for (let i = 0; i < this.n; i++) {
      a[i] = (a[i] + b[i]) % this.q;
    }
  }

  private addPolynomialVector(a: number[][], b: number[][]): void {
    for (let i = 0; i < a.length; i++) {
      this.addPolynomial(a[i], b[i]);
    }
  }

  private subtractPolynomial(a: number[], b: number[]): number[] {
    const result = new Array(this.n);
    for (let i = 0; i < this.n; i++) {
      result[i] = (a[i] - b[i] + this.q) % this.q;
    }
    return result;
  }

  private vectorDotProduct(a: number[][], b: number[][]): number[] {
    const result = new Array(this.n).fill(0);
    
    for (let i = 0; i < a.length; i++) {
      const product = this.multiplyPolynomials(a[i], b[i]);
      this.addPolynomial(result, product);
    }
    
    return result;
  }

  private transposeMatrix(matrix: number[][][]): number[][][] {
    const transposed: number[][][] = [];
    
    for (let j = 0; j < matrix[0].length; j++) {
      transposed[j] = [];
      for (let i = 0; i < matrix.length; i++) {
        transposed[j][i] = matrix[i][j];
      }
    }
    
    return transposed;
  }

  private compressPolynomial(poly: number[], d: number): number[] {
    const compressed = new Array(this.n);
    const divisor = Math.floor(this.q / Math.pow(2, d));
    
    for (let i = 0; i < this.n; i++) {
      compressed[i] = Math.floor(poly[i] / divisor) % Math.pow(2, d);
    }
    
    return compressed;
  }

  private decodeMessage(message: Uint8Array): number[] {
    const poly = new Array(this.n).fill(0);
    
    for (let i = 0; i < message.length && i < this.n / 8; i++) {
      for (let j = 0; j < 8 && i * 8 + j < this.n; j++) {
        poly[i * 8 + j] = (message[i] >> j) & 1;
        poly[i * 8 + j] *= Math.floor(this.q / 2);
      }
    }
    
    return poly;
  }

  private encodePolynomial(poly: number[]): Uint8Array {
    const encoded = new Uint8Array(32);
    
    for (let i = 0; i < 32; i++) {
      let byte = 0;
      for (let j = 0; j < 8 && i * 8 + j < this.n; j++) {
        if (poly[i * 8 + j] > this.q / 2) {
          byte |= (1 << j);
        }
      }
      encoded[i] = byte;
    }
    
    return encoded;
  }

  private packPublicKey(t: number[][], rho: Uint8Array): Uint8Array {
    // Simplified key packing
    const packed = new Uint8Array(32 + this.k * this.n * 2);
    packed.set(rho, 0);
    
    let offset = 32;
    for (let i = 0; i < this.k; i++) {
      for (let j = 0; j < this.n; j++) {
        packed[offset++] = t[i][j] & 0xFF;
        packed[offset++] = (t[i][j] >> 8) & 0xFF;
      }
    }
    
    return packed;
  }

  private packPrivateKey(s: number[][]): Uint8Array {
    const packed = new Uint8Array(this.k * this.n * 2);
    
    let offset = 0;
    for (let i = 0; i < this.k; i++) {
      for (let j = 0; j < this.n; j++) {
        packed[offset++] = s[i][j] & 0xFF;
        packed[offset++] = (s[i][j] >> 8) & 0xFF;
      }
    }
    
    return packed;
  }

  private packCiphertext(u: number[][], v: number[]): Uint8Array {
    const packed = new Uint8Array(this.k * this.n * 2 + this.n * 2);
    
    let offset = 0;
    for (let i = 0; i < this.k; i++) {
      for (let j = 0; j < this.n; j++) {
        packed[offset++] = u[i][j] & 0xFF;
        packed[offset++] = (u[i][j] >> 8) & 0xFF;
      }
    }
    
    for (let j = 0; j < this.n; j++) {
      packed[offset++] = v[j] & 0xFF;
      packed[offset++] = (v[j] >> 8) & 0xFF;
    }
    
    return packed;
  }

  private unpackPublicKey(packed: Uint8Array): { t: number[][]; rho: Uint8Array } {
    const rho = packed.slice(0, 32);
    const t: number[][] = [];
    
    let offset = 32;
    for (let i = 0; i < this.k; i++) {
      t[i] = [];
      for (let j = 0; j < this.n; j++) {
        t[i][j] = packed[offset++] | (packed[offset++] << 8);
      }
    }
    
    return { t, rho };
  }

  private unpackPrivateKey(packed: Uint8Array): number[][] {
    const s: number[][] = [];
    
    let offset = 0;
    for (let i = 0; i < this.k; i++) {
      s[i] = [];
      for (let j = 0; j < this.n; j++) {
        s[i][j] = packed[offset++] | (packed[offset++] << 8);
      }
    }
    
    return s;
  }

  private unpackCiphertext(packed: Uint8Array): { u: number[][]; v: number[] } {
    const u: number[][] = [];
    
    let offset = 0;
    for (let i = 0; i < this.k; i++) {
      u[i] = [];
      for (let j = 0; j < this.n; j++) {
        u[i][j] = packed[offset++] | (packed[offset++] << 8);
      }
    }
    
    const v: number[] = [];
    for (let j = 0; j < this.n; j++) {
      v[j] = packed[offset++] | (packed[offset++] << 8);
    }
    
    return { u, v };
  }

  private sha3_256(input: Uint8Array): Uint8Array {
    // Simplified SHA3-256 implementation (would use proper crypto library in production)
    const output = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      output[i] = this.simpleHash([...input, i]) & 0xFF;
    }
    return output;
  }

  private simpleHash(input: number[]): number {
    // Simple hash function for demonstration (use proper crypto hash in production)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input[i]) & 0xFFFFFFFF;
    }
    return Math.abs(hash);
  }
}

// CRYSTALS-Dilithium Implementation (Digital Signatures)
class CRYSTALSDilithium {
  private readonly n: number = 256;
  private readonly q: number = 8380417;
  private readonly d: number = 13;
  private readonly tau: number = 39;
  private readonly beta: number = 78;
  private readonly gamma1: number = 1 << 17;
  private readonly gamma2: number = (this.q - 1) / 88;
  private readonly k: number;
  private readonly l: number;
  private readonly eta: number;

  constructor(securityLevel: 2 | 3 | 5 = 3) {
    switch (securityLevel) {
      case 2:
        this.k = 4; this.l = 4; this.eta = 2; // Dilithium2
        break;
      case 3:
        this.k = 6; this.l = 5; this.eta = 4; // Dilithium3
        break;
      case 5:
        this.k = 8; this.l = 7; this.eta = 2; // Dilithium5
        break;
      default:
        this.k = 6; this.l = 5; this.eta = 4;
    }
  }

  async generateKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }> {
    // Generate random seed
    const zeta = this.generateSecureRandom(32);
    
    // Expand seed to get matrix A
    const A = this.expandA(zeta);
    
    // Generate secret vectors s1, s2
    const s1 = this.generateSecretVector(this.l, this.eta);
    const s2 = this.generateSecretVector(this.k, this.eta);
    
    // Compute t = As1 + s2
    const t = this.matrixVectorMultiply(A, s1);
    const t_final = this.addVectors(t, s2);
    
    // Decompose t
    const { t1, t0 } = this.highBitsDecompose(t_final, this.d);
    
    // Pack keys
    const publicKey = this.packPublicKey(zeta, t1);
    const privateKey = this.packPrivateKey(zeta, s1, s2, t0);
    
    return { publicKey, privateKey };
  }

  async sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
    // Unpack private key
    const { zeta, s1, s2, t0 } = this.unpackPrivateKey(privateKey);
    const A = this.expandA(zeta);
    
    // Compute message representative
    const mu = this.sha3_256([...message, ...zeta]);
    
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (attempts < maxAttempts) {
      // Sample y uniformly from [-gamma1, gamma1]
      const y = this.sampleUniform(this.l, this.gamma1);
      
      // Compute w = Ay
      const w = this.matrixVectorMultiply(A, y);
      
      // Decompose w
      const { w1 } = this.powerOfTwoDecompose(w, this.gamma2);
      
      // Compute challenge
      const c = this.sampleChallenge(mu, w1);
      
      // Compute z = y + cs1
      const cs1 = this.scalarVectorMultiply(c, s1);
      const z = this.addVectors(y, cs1);
      
      // Check ||z||∞ < gamma1 - beta
      if (this.infinityNorm(z) >= this.gamma1 - this.beta) {
        attempts++;
        continue;
      }
      
      // Compute r0 = w - cs2
      const cs2 = this.scalarVectorMultiply(c, s2);
      const r0 = this.subtractVectors(w, cs2);
      
      // Check ||r0||∞ < gamma2 - beta
      if (this.infinityNorm(r0) >= this.gamma2 - this.beta) {
        attempts++;
        continue;
      }
      
      // Check that ct0 has small coefficients
      const ct0 = this.scalarVectorMultiply(c, t0);
      if (this.infinityNorm(ct0) >= this.gamma2) {
        attempts++;
        continue;
      }
      
      // Pack signature
      return this.packSignature(c, z);
    }
    
    throw new Error('Signature generation failed after maximum attempts');
  }

  async verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
    try {
      // Unpack public key and signature
      const { zeta, t1 } = this.unpackPublicKey(publicKey);
      const { c, z } = this.unpackSignature(signature);
      const A = this.expandA(zeta);
      
      // Check ||z||∞ < gamma1 - beta
      if (this.infinityNorm(z) >= this.gamma1 - this.beta) {
        return false;
      }
      
      // Compute message representative
      const mu = this.sha3_256([...message, ...zeta]);
      
      // Compute w' = Az - ct1 * 2^d
      const Az = this.matrixVectorMultiply(A, z);
      const ct1_2d = this.scalarVectorMultiply(c, t1.map(poly => 
        poly.map(coeff => (coeff * (1 << this.d)) % this.q)
      ));
      const w_prime = this.subtractVectors(Az, ct1_2d);
      
      // Decompose w'
      const { w1: w1_prime } = this.powerOfTwoDecompose(w_prime, this.gamma2);
      
      // Recompute challenge
      const c_prime = this.sampleChallenge(mu, w1_prime);
      
      // Verify c = c'
      return this.comparePolynomials(c, c_prime);
    } catch (error) {
      return false;
    }
  }

  // Utility methods for Dilithium operations
  private generateSecureRandom(length: number): Uint8Array {
    const array = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }

  private expandA(seed: Uint8Array): number[][][] {
    const A: number[][][] = [];
    
    for (let i = 0; i < this.k; i++) {
      A[i] = [];
      for (let j = 0; j < this.l; j++) {
        A[i][j] = this.samplePolynomial(seed, i, j);
      }
    }
    
    return A;
  }

  private samplePolynomial(seed: Uint8Array, i: number, j: number): number[] {
    const poly = new Array(this.n);
    const context = new Uint8Array([...seed, i, j]);
    
    for (let k = 0; k < this.n; k++) {
      const hash = this.simpleHash([...context, k]);
      poly[k] = hash % this.q;
    }
    
    return poly;
  }

  private generateSecretVector(length: number, eta: number): number[][] {
    const vector: number[][] = [];
    
    for (let i = 0; i < length; i++) {
      const poly = new Array(this.n);
      for (let j = 0; j < this.n; j++) {
        poly[j] = (Math.floor(Math.random() * (2 * eta + 1)) - eta) % this.q;
        if (poly[j] < 0) poly[j] += this.q;
      }
      vector.push(poly);
    }
    
    return vector;
  }

  private matrixVectorMultiply(matrix: number[][][], vector: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < matrix.length; i++) {
      const poly = new Array(this.n).fill(0);
      for (let j = 0; j < matrix[i].length; j++) {
        const product = this.multiplyPolynomials(matrix[i][j], vector[j]);
        this.addPolynomials(poly, product);
      }
      result.push(poly);
    }
    
    return result;
  }

  private multiplyPolynomials(a: number[], b: number[]): number[] {
    const result = new Array(this.n).fill(0);
    
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        const k = (i + j) % this.n;
        result[k] = (result[k] + a[i] * b[j]) % this.q;
      }
    }
    
    return result;
  }

  private addPolynomials(a: number[], b: number[]): void {
    for (let i = 0; i < this.n; i++) {
      a[i] = (a[i] + b[i]) % this.q;
    }
  }

  private addVectors(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < a.length; i++) {
      const poly = new Array(this.n);
      for (let j = 0; j < this.n; j++) {
        poly[j] = (a[i][j] + b[i][j]) % this.q;
      }
      result.push(poly);
    }
    
    return result;
  }

  private subtractVectors(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < a.length; i++) {
      const poly = new Array(this.n);
      for (let j = 0; j < this.n; j++) {
        poly[j] = (a[i][j] - b[i][j] + this.q) % this.q;
      }
      result.push(poly);
    }
    
    return result;
  }

  private scalarVectorMultiply(scalar: number[], vector: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < vector.length; i++) {
      const product = this.multiplyPolynomials(scalar, vector[i]);
      result.push(product);
    }
    
    return result;
  }

  private powerOfTwoDecompose(vector: number[][], alpha: number): { w1: number[][]; w0: number[][] } {
    const w1: number[][] = [];
    const w0: number[][] = [];
    
    for (let i = 0; i < vector.length; i++) {
      const poly1 = new Array(this.n);
      const poly0 = new Array(this.n);
      
      for (let j = 0; j < this.n; j++) {
        const val = vector[i][j];
        const r = val % (2 * alpha);
        if (r < alpha) {
          poly0[j] = r;
          poly1[j] = (val - r) / (2 * alpha);
        } else {
          poly0[j] = r - 2 * alpha;
          poly1[j] = (val - r + 2 * alpha) / (2 * alpha);
        }
      }
      
      w1.push(poly1);
      w0.push(poly0);
    }
    
    return { w1, w0 };
  }

  private highBitsDecompose(vector: number[][], alpha: number): { t1: number[][]; t0: number[][] } {
    const t1: number[][] = [];
    const t0: number[][] = [];
    
    for (let i = 0; i < vector.length; i++) {
      const poly1 = new Array(this.n);
      const poly0 = new Array(this.n);
      
      for (let j = 0; j < this.n; j++) {
        const val = vector[i][j];
        poly1[j] = Math.floor(val / (1 << alpha));
        poly0[j] = val - poly1[j] * (1 << alpha);
      }
      
      t1.push(poly1);
      t0.push(poly0);
    }
    
    return { t1, t0 };
  }

  private sampleUniform(length: number, bound: number): number[][] {
    const vector: number[][] = [];
    
    for (let i = 0; i < length; i++) {
      const poly = new Array(this.n);
      for (let j = 0; j < this.n; j++) {
        poly[j] = Math.floor(Math.random() * (2 * bound + 1)) - bound;
        if (poly[j] < 0) poly[j] += this.q;
      }
      vector.push(poly);
    }
    
    return vector;
  }

  private sampleChallenge(mu: Uint8Array, w1: number[][]): number[] {
    // Sample challenge polynomial with exactly tau non-zero coefficients
    const c = new Array(this.n).fill(0);
    const context = [...mu, ...this.packVector(w1)];
    
    const positions = new Set<number>();
    while (positions.size < this.tau) {
      const hash = this.simpleHash([...context, positions.size]);
      positions.add(hash % this.n);
    }
    
    for (const pos of positions) {
      c[pos] = Math.random() < 0.5 ? 1 : -1;
      if (c[pos] < 0) c[pos] += this.q;
    }
    
    return c;
  }

  private infinityNorm(vector: number[][]): number {
    let maxNorm = 0;
    
    for (let i = 0; i < vector.length; i++) {
      for (let j = 0; j < this.n; j++) {
        const val = Math.min(vector[i][j], this.q - vector[i][j]);
        maxNorm = Math.max(maxNorm, val);
      }
    }
    
    return maxNorm;
  }

  private comparePolynomials(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    
    return true;
  }

  private packPublicKey(zeta: Uint8Array, t1: number[][]): Uint8Array {
    const packed = new Uint8Array(32 + this.k * this.n * 4);
    packed.set(zeta, 0);
    
    let offset = 32;
    for (let i = 0; i < this.k; i++) {
      for (let j = 0; j < this.n; j++) {
        const val = t1[i][j];
        packed[offset++] = val & 0xFF;
        packed[offset++] = (val >> 8) & 0xFF;
        packed[offset++] = (val >> 16) & 0xFF;
        packed[offset++] = (val >> 24) & 0xFF;
      }
    }
    
    return packed;
  }

  private packPrivateKey(zeta: Uint8Array, s1: number[][], s2: number[][], t0: number[][]): Uint8Array {
    const packed = new Uint8Array(32 + (this.l + this.k + this.k) * this.n * 4);
    packed.set(zeta, 0);
    
    let offset = 32;
    
    // Pack s1
    for (let i = 0; i < this.l; i++) {
      for (let j = 0; j < this.n; j++) {
        const val = s1[i][j];
        packed[offset++] = val & 0xFF;
        packed[offset++] = (val >> 8) & 0xFF;
        packed[offset++] = (val >> 16) & 0xFF;
        packed[offset++] = (val >> 24) & 0xFF;
      }
    }
    
    // Pack s2
    for (let i = 0; i < this.k; i++) {
      for (let j = 0; j < this.n; j++) {
        const val = s2[i][j];
        packed[offset++] = val & 0xFF;
        packed[offset++] = (val >> 8) & 0xFF;
        packed[offset++] = (val >> 16) & 0xFF;
        packed[offset++] = (val >> 24) & 0xFF;
      }
    }
    
    // Pack t0
    for (let i = 0; i < this.k; i++) {
      for (let j = 0; j < this.n; j++) {
        const val = t0[i][j];
        packed[offset++] = val & 0xFF;
        packed[offset++] = (val >> 8) & 0xFF;
        packed[offset++] = (val >> 16) & 0xFF;
        packed[offset++] = (val >> 24) & 0xFF;
      }
    }
    
    return packed;
  }

  private packSignature(c: number[], z: number[][]): Uint8Array {
    const packed = new Uint8Array(this.n + this.l * this.n * 4);
    
    // Pack challenge
    for (let i = 0; i < this.n; i++) {
      packed[i] = c[i] & 0xFF;
    }
    
    // Pack z
    let offset = this.n;
    for (let i = 0; i < this.l; i++) {
      for (let j = 0; j < this.n; j++) {
        const val = z[i][j];
        packed[offset++] = val & 0xFF;
        packed[offset++] = (val >> 8) & 0xFF;
        packed[offset++] = (val >> 16) & 0xFF;
        packed[offset++] = (val >> 24) & 0xFF;
      }
    }
    
    return packed;
  }

  private unpackPublicKey(packed: Uint8Array): { zeta: Uint8Array; t1: number[][] } {
    const zeta = packed.slice(0, 32);
    const t1: number[][] = [];
    
    let offset = 32;
    for (let i = 0; i < this.k; i++) {
      t1[i] = [];
      for (let j = 0; j < this.n; j++) {
        t1[i][j] = packed[offset++] | 
                   (packed[offset++] << 8) | 
                   (packed[offset++] << 16) | 
                   (packed[offset++] << 24);
      }
    }
    
    return { zeta, t1 };
  }

  private unpackPrivateKey(packed: Uint8Array): { zeta: Uint8Array; s1: number[][]; s2: number[][]; t0: number[][] } {
    const zeta = packed.slice(0, 32);
    const s1: number[][] = [];
    const s2: number[][] = [];
    const t0: number[][] = [];
    
    let offset = 32;
    
    // Unpack s1
    for (let i = 0; i < this.l; i++) {
      s1[i] = [];
      for (let j = 0; j < this.n; j++) {
        s1[i][j] = packed[offset++] | 
                   (packed[offset++] << 8) | 
                   (packed[offset++] << 16) | 
                   (packed[offset++] << 24);
      }
    }
    
    // Unpack s2
    for (let i = 0; i < this.k; i++) {
      s2[i] = [];
      for (let j = 0; j < this.n; j++) {
        s2[i][j] = packed[offset++] | 
                   (packed[offset++] << 8) | 
                   (packed[offset++] << 16) | 
                   (packed[offset++] << 24);
      }
    }
    
    // Unpack t0
    for (let i = 0; i < this.k; i++) {
      t0[i] = [];
      for (let j = 0; j < this.n; j++) {
        t0[i][j] = packed[offset++] | 
                   (packed[offset++] << 8) | 
                   (packed[offset++] << 16) | 
                   (packed[offset++] << 24);
      }
    }
    
    return { zeta, s1, s2, t0 };
  }

  private unpackSignature(packed: Uint8Array): { c: number[]; z: number[][] } {
    const c = new Array(this.n);
    for (let i = 0; i < this.n; i++) {
      c[i] = packed[i];
    }
    
    const z: number[][] = [];
    let offset = this.n;
    
    for (let i = 0; i < this.l; i++) {
      z[i] = [];
      for (let j = 0; j < this.n; j++) {
        z[i][j] = packed[offset++] | 
                  (packed[offset++] << 8) | 
                  (packed[offset++] << 16) | 
                  (packed[offset++] << 24);
      }
    }
    
    return { c, z };
  }

  private packVector(vector: number[][]): number[] {
    const packed: number[] = [];
    for (let i = 0; i < vector.length; i++) {
      packed.push(...vector[i]);
    }
    return packed;
  }

  private sha3_256(input: number[]): Uint8Array {
    const output = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      output[i] = this.simpleHash([...input, i]) & 0xFF;
    }
    return output;
  }

  private simpleHash(input: number[]): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input[i]) & 0xFFFFFFFF;
    }
    return Math.abs(hash);
  }
}

// Main Post-Quantum Cryptography Engine
export class PostQuantumCryptoEngine extends EventEmitter {
  private algorithms: Map<string, PostQuantumAlgorithm> = new Map();
  private keyStorage: Map<string, CryptographicKey> = new Map();
  private performanceMetrics: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  // Algorithm instances
  private kyber512: CRYSTALSKyber;
  private kyber768: CRYSTALSKyber;
  private kyber1024: CRYSTALSKyber;
  private dilithium2: CRYSTALSDilithium;
  private dilithium3: CRYSTALSDilithium;
  private dilithium5: CRYSTALSDilithium;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize CRYSTALS-Kyber instances
      this.kyber512 = new CRYSTALSKyber(512);
      this.kyber768 = new CRYSTALSKyber(768);
      this.kyber1024 = new CRYSTALSKyber(1024);

      // Initialize CRYSTALS-Dilithium instances
      this.dilithium2 = new CRYSTALSDilithium(2);
      this.dilithium3 = new CRYSTALSDilithium(3);
      this.dilithium5 = new CRYSTALSDilithium(5);

      // Register algorithms
      this.registerAlgorithms();

      // Initialize performance monitoring
      this.initializePerformanceMetrics();

      this.isInitialized = true;

      this.emit('initialized', {
        algorithms: Array.from(this.algorithms.keys()),
        timestamp: Date.now()
      });

      console.log('🔐 Post-Quantum Cryptography Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Post-Quantum Crypto Engine:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  private registerAlgorithms(): void {
    // CRYSTALS-Kyber algorithms
    this.algorithms.set('KYBER-512', {
      name: 'CRYSTALS-Kyber-512',
      type: 'KEM',
      nistsecurityLevel: 1,
      keySize: {
        publicKey: 800,
        privateKey: 1632,
        ciphertext: 768
      },
      performance: {
        keyGenTime: 0.1,
        encryptTime: 0.12,
        decryptTime: 0.11
      },
      quantumSecurity: true,
      classicalSecurity: true
    });

    this.algorithms.set('KYBER-768', {
      name: 'CRYSTALS-Kyber-768',
      type: 'KEM',
      nistsecurityLevel: 3,
      keySize: {
        publicKey: 1184,
        privateKey: 2400,
        ciphertext: 1088
      },
      performance: {
        keyGenTime: 0.15,
        encryptTime: 0.18,
        decryptTime: 0.16
      },
      quantumSecurity: true,
      classicalSecurity: true
    });

    this.algorithms.set('KYBER-1024', {
      name: 'CRYSTALS-Kyber-1024',
      type: 'KEM',
      nistsecurityLevel: 5,
      keySize: {
        publicKey: 1568,
        privateKey: 3168,
        ciphertext: 1568
      },
      performance: {
        keyGenTime: 0.2,
        encryptTime: 0.25,
        decryptTime: 0.22
      },
      quantumSecurity: true,
      classicalSecurity: true
    });

    // CRYSTALS-Dilithium algorithms
    this.algorithms.set('DILITHIUM-2', {
      name: 'CRYSTALS-Dilithium-2',
      type: 'SIGNATURE',
      nistsecurityLevel: 2,
      keySize: {
        publicKey: 1312,
        privateKey: 2544,
        signature: 2420
      },
      performance: {
        keyGenTime: 0.08,
        encryptTime: 0,
        decryptTime: 0,
        signTime: 0.5,
        verifyTime: 0.1
      },
      quantumSecurity: true,
      classicalSecurity: true
    });

    this.algorithms.set('DILITHIUM-3', {
      name: 'CRYSTALS-Dilithium-3',
      type: 'SIGNATURE',
      nistsecurityLevel: 3,
      keySize: {
        publicKey: 1952,
        privateKey: 4000,
        signature: 3293
      },
      performance: {
        keyGenTime: 0.12,
        encryptTime: 0,
        decryptTime: 0,
        signTime: 0.7,
        verifyTime: 0.15
      },
      quantumSecurity: true,
      classicalSecurity: true
    });

    this.algorithms.set('DILITHIUM-5', {
      name: 'CRYSTALS-Dilithium-5',
      type: 'SIGNATURE',
      nistsecurityLevel: 5,
      keySize: {
        publicKey: 2592,
        privateKey: 4864,
        signature: 4595
      },
      performance: {
        keyGenTime: 0.18,
        encryptTime: 0,
        decryptTime: 0,
        signTime: 1.0,
        verifyTime: 0.22
      },
      quantumSecurity: true,
      classicalSecurity: true
    });
  }

  async generateKeyPair(algorithm: string, keyId?: string): Promise<{ keyId: string; publicKey: CryptographicKey; privateKey: CryptographicKey }> {
    if (!this.isInitialized) {
      throw new Error('Post-Quantum Crypto Engine not initialized');
    }

    const algo = this.algorithms.get(algorithm);
    if (!algo) {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    const generatedKeyId = keyId || `key_${algorithm}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      let keyPair: { publicKey: Uint8Array; privateKey: Uint8Array };

      switch (algorithm) {
        case 'KYBER-512':
          keyPair = await this.kyber512.generateKeyPair();
          break;
        case 'KYBER-768':
          keyPair = await this.kyber768.generateKeyPair();
          break;
        case 'KYBER-1024':
          keyPair = await this.kyber1024.generateKeyPair();
          break;
        case 'DILITHIUM-2':
          keyPair = await this.dilithium2.generateKeyPair();
          break;
        case 'DILITHIUM-3':
          keyPair = await this.dilithium3.generateKeyPair();
          break;
        case 'DILITHIUM-5':
          keyPair = await this.dilithium5.generateKeyPair();
          break;
        default:
          // For unsupported algorithms, generate a mock key pair for development
          console.warn(`Algorithm ${algorithm} not fully implemented, generating mock key pair`);
          keyPair = this.generateMockKeyPair(algorithm);
      }

      const publicKey: CryptographicKey = {
        algorithm,
        keyType: 'PUBLIC',
        keyData: keyPair.publicKey,
        keyId: generatedKeyId,
        createdAt: Date.now(),
        metadata: {
          securityLevel: algo.nistsecurityLevel,
          quantumSafe: true,
          usage: ['encrypt', 'verify'],
          version: '1.0'
        }
      };

      const privateKey: CryptographicKey = {
        algorithm,
        keyType: 'PRIVATE',
        keyData: keyPair.privateKey,
        keyId: generatedKeyId,
        createdAt: Date.now(),
        metadata: {
          securityLevel: algo.nistsecurityLevel,
          quantumSafe: true,
          usage: ['decrypt', 'sign'],
          version: '1.0'
        }
      };

      // Store keys
      this.keyStorage.set(`${generatedKeyId}_public`, publicKey);
      this.keyStorage.set(`${generatedKeyId}_private`, privateKey);

      const generationTime = Date.now() - startTime;
      this.updatePerformanceMetrics(algorithm, 'keygen', generationTime);

      this.emit('key_pair_generated', {
        keyId: generatedKeyId,
        algorithm,
        generationTime,
        timestamp: Date.now()
      });

      return { keyId: generatedKeyId, publicKey, privateKey };
    } catch (error) {
      console.error(`❌ Key generation failed for ${algorithm}:`, error);
      this.emit('error', { type: 'key_generation', algorithm, error });
      throw error;
    }
  }

  private generateMockKeyPair(algorithm: string): { publicKey: Uint8Array; privateKey: Uint8Array } {
    // Generate cryptographically secure random key pairs for unsupported algorithms
    const keySize = this.getKeySizeForAlgorithm(algorithm);
    
    const publicKey = new Uint8Array(keySize.publicKey);
    const privateKey = new Uint8Array(keySize.privateKey);
    
    // Fill with cryptographically secure random data
    crypto.getRandomValues(publicKey);
    crypto.getRandomValues(privateKey);
    
    return { publicKey, privateKey };
  }

  private getKeySizeForAlgorithm(algorithm: string): { publicKey: number; privateKey: number } {
    const sizes: Record<string, { publicKey: number; privateKey: number }> = {
      'KYBER-512': { publicKey: 800, privateKey: 1632 },
      'KYBER-768': { publicKey: 1184, privateKey: 2400 },
      'KYBER-1024': { publicKey: 1568, privateKey: 3168 },
      'DILITHIUM-2': { publicKey: 1312, privateKey: 2528 },
      'DILITHIUM-3': { publicKey: 1952, privateKey: 4000 },
      'DILITHIUM-5': { publicKey: 2592, privateKey: 4864 },
      'FALCON-512': { publicKey: 897, privateKey: 1281 },
      'FALCON-1024': { publicKey: 1793, privateKey: 2305 },
      'SPHINCS+-SHA256-128F-SIMPLE': { publicKey: 32, privateKey: 64 },
      'SPHINCS+-SHA256-192F-SIMPLE': { publicKey: 48, privateKey: 96 },
      'SPHINCS+-SHA256-256F-SIMPLE': { publicKey: 64, privateKey: 128 }
    };
    
    return sizes[algorithm] || { publicKey: 1024, privateKey: 2048 };
  }

  async encapsulate(publicKeyId: string, data?: Uint8Array): Promise<EncryptionResult> {
    if (!this.isInitialized) {
      throw new Error('Post-Quantum Crypto Engine not initialized');
    }

    const publicKey = this.keyStorage.get(`${publicKeyId}_public`);
    if (!publicKey) {
      throw new Error(`Public key not found: ${publicKeyId}`);
    }

    const startTime = Date.now();

    try {
      let result: { ciphertext: Uint8Array; sharedSecret: Uint8Array };

      switch (publicKey.algorithm) {
        case 'KYBER-512':
          result = await this.kyber512.encapsulate(publicKey.keyData);
          break;
        case 'KYBER-768':
          result = await this.kyber768.encapsulate(publicKey.keyData);
          break;
        case 'KYBER-1024':
          result = await this.kyber1024.encapsulate(publicKey.keyData);
          break;
        default:
          throw new Error(`Encapsulation not supported for ${publicKey.algorithm}`);
      }

      const encryptionResult: EncryptionResult = {
        algorithm: publicKey.algorithm,
        ciphertext: result.ciphertext,
        publicKey: publicKey.keyData,
        sharedSecret: result.sharedSecret,
        metadata: {
          timestamp: Date.now(),
          keyId: publicKeyId,
          securityLevel: publicKey.metadata.securityLevel
        }
      };

      const encryptionTime = Date.now() - startTime;
      this.updatePerformanceMetrics(publicKey.algorithm, 'encrypt', encryptionTime);

      this.emit('data_encapsulated', {
        keyId: publicKeyId,
        algorithm: publicKey.algorithm,
        encryptionTime,
        timestamp: Date.now()
      });

      return encryptionResult;
    } catch (error) {
      console.error(`❌ Encapsulation failed for key ${publicKeyId}:`, error);
      this.emit('error', { type: 'encapsulation', keyId: publicKeyId, error });
      throw error;
    }
  }

  async decapsulate(privateKeyId: string, ciphertext: Uint8Array): Promise<Uint8Array> {
    if (!this.isInitialized) {
      throw new Error('Post-Quantum Crypto Engine not initialized');
    }

    const privateKey = this.keyStorage.get(`${privateKeyId}_private`);
    if (!privateKey) {
      throw new Error(`Private key not found: ${privateKeyId}`);
    }

    const startTime = Date.now();

    try {
      let sharedSecret: Uint8Array;

      switch (privateKey.algorithm) {
        case 'KYBER-512':
          sharedSecret = await this.kyber512.decapsulate(ciphertext, privateKey.keyData);
          break;
        case 'KYBER-768':
          sharedSecret = await this.kyber768.decapsulate(ciphertext, privateKey.keyData);
          break;
        case 'KYBER-1024':
          sharedSecret = await this.kyber1024.decapsulate(ciphertext, privateKey.keyData);
          break;
        default:
          throw new Error(`Decapsulation not supported for ${privateKey.algorithm}`);
      }

      const decryptionTime = Date.now() - startTime;
      this.updatePerformanceMetrics(privateKey.algorithm, 'decrypt', decryptionTime);

      this.emit('data_decapsulated', {
        keyId: privateKeyId,
        algorithm: privateKey.algorithm,
        decryptionTime,
        timestamp: Date.now()
      });

      return sharedSecret;
    } catch (error) {
      console.error(`❌ Decapsulation failed for key ${privateKeyId}:`, error);
      this.emit('error', { type: 'decapsulation', keyId: privateKeyId, error });
      throw error;
    }
  }

  async sign(privateKeyId: string, message: Uint8Array): Promise<SignatureResult> {
    if (!this.isInitialized) {
      throw new Error('Post-Quantum Crypto Engine not initialized');
    }

    const privateKey = this.keyStorage.get(`${privateKeyId}_private`);
    const publicKey = this.keyStorage.get(`${privateKeyId}_public`);
    
    if (!privateKey || !publicKey) {
      throw new Error(`Key pair not found: ${privateKeyId}`);
    }

    const startTime = Date.now();

    try {
      let signature: Uint8Array;

      switch (privateKey.algorithm) {
        case 'DILITHIUM-2':
          signature = await this.dilithium2.sign(message, privateKey.keyData);
          break;
        case 'DILITHIUM-3':
          signature = await this.dilithium3.sign(message, privateKey.keyData);
          break;
        case 'DILITHIUM-5':
          signature = await this.dilithium5.sign(message, privateKey.keyData);
          break;
        default:
          throw new Error(`Signing not supported for ${privateKey.algorithm}`);
      }

      const signatureResult: SignatureResult = {
        algorithm: privateKey.algorithm,
        signature,
        publicKey: publicKey.keyData,
        message,
        metadata: {
          timestamp: Date.now(),
          keyId: privateKeyId,
          securityLevel: privateKey.metadata.securityLevel
        }
      };

      const signingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(privateKey.algorithm, 'sign', signingTime);

      this.emit('message_signed', {
        keyId: privateKeyId,
        algorithm: privateKey.algorithm,
        signingTime,
        timestamp: Date.now()
      });

      return signatureResult;
    } catch (error) {
      console.error(`❌ Signing failed for key ${privateKeyId}:`, error);
      this.emit('error', { type: 'signing', keyId: privateKeyId, error });
      throw error;
    }
  }

  async verify(publicKeyId: string, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Post-Quantum Crypto Engine not initialized');
    }

    const publicKey = this.keyStorage.get(`${publicKeyId}_public`);
    if (!publicKey) {
      throw new Error(`Public key not found: ${publicKeyId}`);
    }

    const startTime = Date.now();

    try {
      let isValid: boolean;

      switch (publicKey.algorithm) {
        case 'DILITHIUM-2':
          isValid = await this.dilithium2.verify(message, signature, publicKey.keyData);
          break;
        case 'DILITHIUM-3':
          isValid = await this.dilithium3.verify(message, signature, publicKey.keyData);
          break;
        case 'DILITHIUM-5':
          isValid = await this.dilithium5.verify(message, signature, publicKey.keyData);
          break;
        default:
          throw new Error(`Verification not supported for ${publicKey.algorithm}`);
      }

      const verificationTime = Date.now() - startTime;
      this.updatePerformanceMetrics(publicKey.algorithm, 'verify', verificationTime);

      this.emit('signature_verified', {
        keyId: publicKeyId,
        algorithm: publicKey.algorithm,
        isValid,
        verificationTime,
        timestamp: Date.now()
      });

      return isValid;
    } catch (error) {
      console.error(`❌ Verification failed for key ${publicKeyId}:`, error);
      this.emit('error', { type: 'verification', keyId: publicKeyId, error });
      throw error;
    }
  }

  getAlgorithms(): PostQuantumAlgorithm[] {
    return Array.from(this.algorithms.values());
  }

  getAlgorithm(name: string): PostQuantumAlgorithm | undefined {
    return this.algorithms.get(name);
  }

  getStoredKeys(): CryptographicKey[] {
    return Array.from(this.keyStorage.values());
  }

  getKey(keyId: string, keyType: 'PUBLIC' | 'PRIVATE'): CryptographicKey | undefined {
    const suffix = keyType === 'PUBLIC' ? '_public' : '_private';
    return this.keyStorage.get(`${keyId}${suffix}`);
  }

  deleteKey(keyId: string): boolean {
    const publicDeleted = this.keyStorage.delete(`${keyId}_public`);
    const privateDeleted = this.keyStorage.delete(`${keyId}_private`);
    
    if (publicDeleted || privateDeleted) {
      this.emit('key_deleted', { keyId, timestamp: Date.now() });
      return true;
    }
    
    return false;
  }

  getPerformanceMetrics(): any {
    return Object.fromEntries(this.performanceMetrics);
  }

  getStatistics(): any {
    const algorithmUsage: { [key: string]: number } = {};
    const keyTypes: { [key: string]: number } = {};
    
    for (const key of this.keyStorage.values()) {
      algorithmUsage[key.algorithm] = (algorithmUsage[key.algorithm] || 0) + 1;
      keyTypes[key.keyType] = (keyTypes[key.keyType] || 0) + 1;
    }

    return {
      totalKeys: this.keyStorage.size,
      algorithmsSupported: this.algorithms.size,
      algorithmUsage,
      keyTypes,
      performanceMetrics: this.getPerformanceMetrics(),
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  // Helper methods
  private initializePerformanceMetrics(): void {
    for (const algorithm of this.algorithms.keys()) {
      this.performanceMetrics.set(`${algorithm}_keygen_avg`, 0);
      this.performanceMetrics.set(`${algorithm}_keygen_count`, 0);
      this.performanceMetrics.set(`${algorithm}_encrypt_avg`, 0);
      this.performanceMetrics.set(`${algorithm}_encrypt_count`, 0);
      this.performanceMetrics.set(`${algorithm}_decrypt_avg`, 0);
      this.performanceMetrics.set(`${algorithm}_decrypt_count`, 0);
      this.performanceMetrics.set(`${algorithm}_sign_avg`, 0);
      this.performanceMetrics.set(`${algorithm}_sign_count`, 0);
      this.performanceMetrics.set(`${algorithm}_verify_avg`, 0);
      this.performanceMetrics.set(`${algorithm}_verify_count`, 0);
    }
  }

  private updatePerformanceMetrics(algorithm: string, operation: string, time: number): void {
    const avgKey = `${algorithm}_${operation}_avg`;
    const countKey = `${algorithm}_${operation}_count`;
    
    const currentAvg = this.performanceMetrics.get(avgKey) || 0;
    const currentCount = this.performanceMetrics.get(countKey) || 0;
    
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + time) / newCount;
    
    this.performanceMetrics.set(avgKey, newAvg);
    this.performanceMetrics.set(countKey, newCount);
  }

  destroy(): void {
    this.algorithms.clear();
    this.keyStorage.clear();
    this.performanceMetrics.clear();
    this.isInitialized = false;
  }
}

export type {
  PostQuantumAlgorithm,
  CryptographicKey,
  EncryptionResult,
  SignatureResult,
  HybridCryptoConfig
};

export default PostQuantumCryptoEngine;
