import * as crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

/**
 * Production-ready encryption service using industry-standard algorithms
 */
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private saltLength = 32;
  private tagLength = 16;
  private ivLength = 16;
  private keyLength = 32;
  private iterations = 100000;

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(text: string, password: string): Promise<{
    encrypted: string;
    salt: string;
    iv: string;
    tag: string;
  }> {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Derive key from password
      const key = await this.deriveKey(password, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt data
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();

      return {
        encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string,
    tag: string
  ): Promise<string> {
    try {
      // Convert hex strings back to buffers
      const saltBuffer = Buffer.from(salt, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');

      // Derive key from password
      const key = await this.deriveKey(password, saltBuffer);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
      decipher.setAuthTag(tagBuffer);

      // Decrypt data
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a cryptographically secure random key
   */
  generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash password using PBKDF2
   */
  async hashPassword(password: string, salt?: Buffer): Promise<{
    hash: string;
    salt: string;
  }> {
    const saltBuffer = salt || crypto.randomBytes(this.saltLength);
    const derivedKey = await crypto.pbkdf2Sync(
      password,
      saltBuffer,
      this.iterations,
      this.keyLength,
      'sha256'
    );

    return {
      hash: derivedKey.toString('hex'),
      salt: saltBuffer.toString('hex')
    };
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(
    password: string,
    hash: string,
    salt: string
  ): Promise<boolean> {
    const saltBuffer = Buffer.from(salt, 'hex');
    const { hash: newHash } = await this.hashPassword(password, saltBuffer);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(newHash, 'hex'));
  }

  /**
   * Generate RSA key pair
   */
  generateRSAKeyPair(): {
    publicKey: string;
    privateKey: string;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Sign data with RSA private key
   */
  signData(data: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'hex');
  }

  /**
   * Verify signature with RSA public key
   */
  verifySignature(data: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
  }

  /**
   * Encrypt with RSA public key
   */
  encryptRSA(data: string, publicKey: string): string {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  }

  /**
   * Decrypt with RSA private key
   */
  decryptRSA(encryptedData: string, privateKey: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Create HMAC
   */
  createHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data: string, hmac: string, secret: string): boolean {
    const expectedHmac = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  }

  /**
   * Derive key from password using scrypt
   */
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return await scrypt(password, salt, this.keyLength) as Buffer;
  }

  /**
   * Generate secure session ID
   */
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calculate file checksum
   */
  async calculateChecksum(data: Buffer | string): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Encrypt sensitive configuration data
   */
  async encryptConfig(config: any, masterKey: string): Promise<string> {
    const jsonString = JSON.stringify(config);
    const { encrypted, salt, iv, tag } = await this.encrypt(jsonString, masterKey);
    
    // Combine all parts into a single string
    return `${salt}:${iv}:${tag}:${encrypted}`;
  }

  /**
   * Decrypt sensitive configuration data
   */
  async decryptConfig(encryptedConfig: string, masterKey: string): Promise<any> {
    const [salt, iv, tag, encrypted] = encryptedConfig.split(':');
    const decrypted = await this.decrypt(encrypted, masterKey, salt, iv, tag);
    return JSON.parse(decrypted);
  }
}