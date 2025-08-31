/**
 * Natural Language Processing Engine for Security Operations
 * Advanced text analysis, entity recognition, and threat intelligence processing
 */

import { EventEmitter } from 'events';

// Core interfaces for NLP operations
interface SecurityEntity {
  type: 'IP' | 'DOMAIN' | 'URL' | 'HASH' | 'CVE' | 'PORT' | 'EMAIL' | 'FILE' | 'PROCESS' | 'REGISTRY' | 'TECHNIQUE';
  value: string;
  confidence: number;
  context: string;
  position: { start: number; end: number };
  attributes?: { [key: string]: any };
}

interface ThreatIntelligence {
  indicators: SecurityEntity[];
  attackTechniques: string[];
  threatActors: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  summary: string;
  recommendations: string[];
}

interface TextAnalysisResult {
  originalText: string;
  tokens: Token[];
  entities: SecurityEntity[];
  sentiment: SentimentAnalysis;
  threatIntel: ThreatIntelligence;
  language: string;
  processingTime: number;
  timestamp: number;
}

interface Token {
  text: string;
  lemma: string;
  pos: string; // Part of speech
  tag: string; // Detailed tag
  dep: string; // Dependency relation
  start: number;
  end: number;
  isSecurityRelevant: boolean;
}

interface SentimentAnalysis {
  polarity: number; // -1 to 1
  subjectivity: number; // 0 to 1
  urgency: number; // 0 to 1
  classification: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'URGENT';
  confidence: number;
}

interface SecurityPattern {
  pattern: RegExp;
  type: SecurityEntity['type'];
  validator?: (match: string) => boolean;
  extractor?: (match: string) => any;
}

interface LanguageModel {
  name: string;
  language: string;
  vocabulary: Map<string, number>;
  weights: Float32Array;
  isLoaded: boolean;
}

// Advanced tokenizer for security text
class SecurityTokenizer {
  private patterns: SecurityPattern[] = [
    // IP Addresses
    {
      pattern: /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g,
      type: 'IP',
      validator: (ip: string) => this.isValidIP(ip)
    },
    // Domain names
    {
      pattern: /(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/g,
      type: 'DOMAIN',
      validator: (domain: string) => this.isValidDomain(domain)
    },
    // URLs
    {
      pattern: /https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?/g,
      type: 'URL'
    },
    // File hashes (MD5, SHA1, SHA256)
    {
      pattern: /\b(?:[a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})\b/g,
      type: 'HASH',
      validator: (hash: string) => [32, 40, 64].includes(hash.length)
    },
    // CVE identifiers
    {
      pattern: /CVE-\d{4}-\d{4,}/g,
      type: 'CVE'
    },
    // Port numbers
    {
      pattern: /\b(?:port\s+)?(\d{1,5})\b/gi,
      type: 'PORT',
      validator: (port: string) => {
        const num = parseInt(port);
        return num >= 1 && num <= 65535;
      }
    },
    // Email addresses
    {
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      type: 'EMAIL'
    },
    // File paths
    {
      pattern: /(?:[a-zA-Z]:\\|\/)[^\s<>"|\n\r]*[^\s<>"|\n\r.]/g,
      type: 'FILE'
    },
    // Registry keys
    {
      pattern: /HKEY_(?:LOCAL_MACHINE|CURRENT_USER|CLASSES_ROOT|USERS|CURRENT_CONFIG)\\[^\s<>"|\n\r]*/g,
      type: 'REGISTRY'
    },
    // MITRE ATT&CK techniques
    {
      pattern: /T\d{4}(?:\.\d{3})?/g,
      type: 'TECHNIQUE'
    }
  ];

  tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    const words = text.toLowerCase().split(/\s+/);
    let position = 0;

    for (const word of words) {
      const start = text.toLowerCase().indexOf(word, position);
      const end = start + word.length;
      
      const token: Token = {
        text: word,
        lemma: this.lemmatize(word),
        pos: this.getPartOfSpeech(word),
        tag: this.getDetailedTag(word),
        dep: this.getDependencyRelation(word),
        start,
        end,
        isSecurityRelevant: this.isSecurityRelevant(word)
      };
      
      tokens.push(token);
      position = end;
    }

    return tokens;
  }

  extractSecurityEntities(text: string): SecurityEntity[] {
    const entities: SecurityEntity[] = [];
    
    for (const pattern of this.patterns) {
      const matches = text.matchAll(pattern.pattern);
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const value = match[0];
          
          // Apply validator if present
          if (pattern.validator && !pattern.validator(value)) {
            continue;
          }
          
          const entity: SecurityEntity = {
            type: pattern.type,
            value,
            confidence: this.calculateEntityConfidence(pattern.type, value),
            context: this.extractContext(text, match.index, value.length),
            position: { start: match.index, end: match.index + value.length },
            attributes: pattern.extractor ? pattern.extractor(value) : {}
          };
          
          entities.push(entity);
        }
      }
    }
    
    return this.deduplicateEntities(entities);
  }

  private isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }

  private isValidDomain(domain: string): boolean {
    // Basic domain validation
    return domain.length < 255 && 
           domain.split('.').every(label => label.length > 0 && label.length < 64) &&
           !domain.startsWith('.') && !domain.endsWith('.');
  }

  private lemmatize(word: string): string {
    // Simple lemmatization rules for security terms
    const lemmaRules: { [key: string]: string } = {
      'attacks': 'attack',
      'threats': 'threat',
      'vulnerabilities': 'vulnerability',
      'exploits': 'exploit',
      'malware': 'malware',
      'viruses': 'virus',
      'trojans': 'trojan',
      'rootkits': 'rootkit',
      'botnets': 'botnet',
      'phishing': 'phish',
      'infections': 'infection',
      'breaches': 'breach',
      'incidents': 'incident'
    };
    
    return lemmaRules[word.toLowerCase()] || word;
  }

  private getPartOfSpeech(word: string): string {
    // Simplified POS tagging for security context
    const securityNouns = ['attack', 'threat', 'vulnerability', 'exploit', 'malware', 'virus', 'trojan'];
    const securityVerbs = ['attack', 'exploit', 'compromise', 'breach', 'infect', 'steal'];
    const securityAdjectives = ['malicious', 'suspicious', 'vulnerable', 'compromised', 'infected'];
    
    if (securityNouns.includes(word.toLowerCase())) return 'NOUN';
    if (securityVerbs.includes(word.toLowerCase())) return 'VERB';
    if (securityAdjectives.includes(word.toLowerCase())) return 'ADJ';
    
    return 'OTHER';
  }

  private getDetailedTag(word: string): string {
    // More detailed tagging for security analysis
    const threatWords = ['apt', 'malware', 'ransomware', 'spyware', 'adware', 'rootkit'];
    const actionWords = ['execute', 'download', 'install', 'delete', 'modify', 'access'];
    
    if (threatWords.includes(word.toLowerCase())) return 'THREAT_ENTITY';
    if (actionWords.includes(word.toLowerCase())) return 'SECURITY_ACTION';
    
    return 'GENERAL';
  }

  private getDependencyRelation(word: string): string {
    // Simplified dependency parsing for security context
    return 'unknown';
  }

  private isSecurityRelevant(word: string): boolean {
    const securityKeywords = [
      'security', 'attack', 'threat', 'vulnerability', 'exploit', 'malware', 'virus',
      'trojan', 'rootkit', 'spyware', 'ransomware', 'phishing', 'breach', 'incident',
      'compromise', 'unauthorized', 'suspicious', 'anomaly', 'intrusion', 'backdoor',
      'botnet', 'ddos', 'sql', 'injection', 'xss', 'csrf', 'buffer', 'overflow',
      'privilege', 'escalation', 'lateral', 'movement', 'persistence', 'evasion'
    ];
    
    return securityKeywords.includes(word.toLowerCase());
  }

  private calculateEntityConfidence(type: SecurityEntity['type'], value: string): number {
    // Confidence scoring based on entity type and characteristics
    switch (type) {
      case 'IP':
        return this.isPrivateIP(value) ? 0.8 : 0.95;
      case 'DOMAIN':
        return this.isDGA(value) ? 0.9 : 0.85;
      case 'HASH':
        return value.length === 64 ? 0.95 : (value.length === 40 ? 0.9 : 0.85);
      case 'CVE':
        return 0.98;
      case 'URL':
        return this.isSuspiciousURL(value) ? 0.9 : 0.8;
      default:
        return 0.75;
    }
  }

  private isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    return (parts[0] === 10) ||
           (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
           (parts[0] === 192 && parts[1] === 168);
  }

  private isDGA(domain: string): boolean {
    // Simple DGA (Domain Generation Algorithm) detection
    const domainPart = domain.split('.')[0];
    const vowels = (domainPart.match(/[aeiou]/g) || []).length;
    const consonants = domainPart.length - vowels;
    const entropy = this.calculateEntropy(domainPart);
    
    return entropy > 3.5 || consonants / domainPart.length > 0.7;
  }

  private isSuspiciousURL(url: string): boolean {
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|t\.co/,
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,
      /[a-z]{20,}/i,
      /\.(tk|ml|ga|cf)$/
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  private calculateEntropy(str: string): number {
    const freq: { [key: string]: number } = {};
    
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (const count of Object.values(freq)) {
      const p = count / str.length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  private extractContext(text: string, position: number, length: number): string {
    const contextWindow = 50;
    const start = Math.max(0, position - contextWindow);
    const end = Math.min(text.length, position + length + contextWindow);
    
    return text.substring(start, end);
  }

  private deduplicateEntities(entities: SecurityEntity[]): SecurityEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.type}:${entity.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Sentiment analysis engine for security context
class SecuritySentimentAnalyzer {
  private urgencyKeywords = [
    'urgent', 'critical', 'immediate', 'emergency', 'asap', 'now',
    'breach', 'compromised', 'attack', 'exploit', 'malware', 'virus'
  ];

  private threatKeywords = [
    'threat', 'risk', 'vulnerability', 'suspicious', 'malicious',
    'dangerous', 'harmful', 'infected', 'backdoor', 'trojan'
  ];

  private positiveKeywords = [
    'secure', 'protected', 'safe', 'clean', 'resolved', 'patched',
    'updated', 'blocked', 'prevented', 'detected', 'contained'
  ];

  analyzeSentiment(text: string): SentimentAnalysis {
    const words = text.toLowerCase().split(/\s+/);
    
    let urgencyScore = 0;
    let threatScore = 0;
    let positiveScore = 0;
    
    for (const word of words) {
      if (this.urgencyKeywords.includes(word)) urgencyScore++;
      if (this.threatKeywords.includes(word)) threatScore++;
      if (this.positiveKeywords.includes(word)) positiveScore++;
    }
    
    const totalWords = words.length;
    const urgency = Math.min(urgencyScore / totalWords * 10, 1);
    const polarity = (positiveScore - threatScore) / totalWords;
    const subjectivity = (urgencyScore + threatScore + positiveScore) / totalWords;
    
    let classification: SentimentAnalysis['classification'];
    if (urgency > 0.3) classification = 'URGENT';
    else if (polarity > 0.1) classification = 'POSITIVE';
    else if (polarity < -0.1) classification = 'NEGATIVE';
    else classification = 'NEUTRAL';
    
    return {
      polarity: Math.max(-1, Math.min(1, polarity)),
      subjectivity: Math.min(1, subjectivity),
      urgency,
      classification,
      confidence: Math.min(1, (urgencyScore + threatScore + positiveScore) / 10)
    };
  }
}

// Threat intelligence extraction engine
class ThreatIntelligenceExtractor {
  private attackTechniques = new Map([
    ['T1566', 'Phishing'],
    ['T1059', 'Command and Scripting Interpreter'],
    ['T1055', 'Process Injection'],
    ['T1083', 'File and Directory Discovery'],
    ['T1105', 'Ingress Tool Transfer'],
    ['T1071', 'Application Layer Protocol'],
    ['T1027', 'Obfuscated Files or Information'],
    ['T1082', 'System Information Discovery'],
    ['T1033', 'System Owner/User Discovery'],
    ['T1087', 'Account Discovery']
  ]);

  private threatActors = [
    'APT1', 'APT28', 'APT29', 'Lazarus', 'Carbanak', 'FIN7', 'Cozy Bear',
    'Fancy Bear', 'Equation Group', 'Shadow Brokers', 'DarkHalo', 'UNC2452'
  ];

  extractThreatIntelligence(text: string, entities: SecurityEntity[]): ThreatIntelligence {
    const indicators = entities.filter(e => 
      ['IP', 'DOMAIN', 'URL', 'HASH', 'EMAIL', 'FILE'].includes(e.type)
    );

    const attackTechniques = this.identifyAttackTechniques(text);
    const threatActors = this.identifyThreatActors(text);
    const severity = this.assessSeverity(text, entities);
    const confidence = this.calculateThreatConfidence(indicators, attackTechniques, threatActors);

    return {
      indicators,
      attackTechniques,
      threatActors,
      severity,
      confidence,
      summary: this.generateThreatSummary(indicators, attackTechniques, threatActors),
      recommendations: this.generateRecommendations(severity, indicators, attackTechniques)
    };
  }

  private identifyAttackTechniques(text: string): string[] {
    const techniques: string[] = [];
    
    for (const [techniqueId, techniqueName] of this.attackTechniques) {
      const pattern = new RegExp(`\\b${techniqueId}\\b|\\b${techniqueName.toLowerCase()}\\b`, 'gi');
      if (pattern.test(text)) {
        techniques.push(`${techniqueId}: ${techniqueName}`);
      }
    }
    
    return techniques;
  }

  private identifyThreatActors(text: string): string[] {
    const actors: string[] = [];
    
    for (const actor of this.threatActors) {
      const pattern = new RegExp(`\\b${actor}\\b`, 'gi');
      if (pattern.test(text)) {
        actors.push(actor);
      }
    }
    
    return actors;
  }

  private assessSeverity(text: string, entities: SecurityEntity[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let score = 0;
    
    // High-value indicators
    const criticalEntities = entities.filter(e => 
      e.type === 'CVE' || (e.type === 'HASH' && e.confidence > 0.9)
    );
    score += criticalEntities.length * 3;
    
    // Threat keywords
    const criticalKeywords = ['critical', 'urgent', 'breach', 'compromised', 'exploit'];
    for (const keyword of criticalKeywords) {
      if (text.toLowerCase().includes(keyword)) score += 2;
    }
    
    // Network indicators
    const networkEntities = entities.filter(e => ['IP', 'DOMAIN', 'URL'].includes(e.type));
    score += networkEntities.length;
    
    if (score >= 10) return 'CRITICAL';
    if (score >= 6) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    return 'LOW';
  }

  private calculateThreatConfidence(
    indicators: SecurityEntity[], 
    techniques: string[], 
    actors: string[]
  ): number {
    let confidence = 0.5; // Base confidence
    
    // High-confidence indicators boost confidence
    const highConfidenceIndicators = indicators.filter(i => i.confidence > 0.9);
    confidence += highConfidenceIndicators.length * 0.1;
    
    // Known techniques and actors boost confidence
    confidence += techniques.length * 0.05;
    confidence += actors.length * 0.1;
    
    return Math.min(1, confidence);
  }

  private generateThreatSummary(
    indicators: SecurityEntity[], 
    techniques: string[], 
    actors: string[]
  ): string {
    const parts = [];
    
    if (indicators.length > 0) {
      parts.push(`${indicators.length} security indicators detected`);
    }
    
    if (techniques.length > 0) {
      parts.push(`${techniques.length} attack techniques identified`);
    }
    
    if (actors.length > 0) {
      parts.push(`${actors.length} threat actors mentioned`);
    }
    
    return parts.join(', ') || 'Basic threat analysis completed';
  }

  private generateRecommendations(
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    indicators: SecurityEntity[],
    techniques: string[]
  ): string[] {
    const recommendations = [];
    
    switch (severity) {
      case 'CRITICAL':
        recommendations.push('Immediate incident response required');
        recommendations.push('Isolate affected systems');
        recommendations.push('Notify security team and management');
        break;
      case 'HIGH':
        recommendations.push('Prioritize investigation');
        recommendations.push('Monitor related network activity');
        recommendations.push('Review security controls');
        break;
      case 'MEDIUM':
        recommendations.push('Schedule detailed analysis');
        recommendations.push('Update threat intelligence');
        break;
      case 'LOW':
        recommendations.push('Continue monitoring');
        recommendations.push('Document findings');
        break;
    }
    
    if (indicators.some(i => i.type === 'IP')) {
      recommendations.push('Block suspicious IP addresses');
    }
    
    if (indicators.some(i => i.type === 'DOMAIN')) {
      recommendations.push('Monitor DNS queries to suspicious domains');
    }
    
    if (techniques.length > 0) {
      recommendations.push('Review MITRE ATT&CK defensive measures');
    }
    
    return recommendations;
  }
}

// Main NLP Engine
export class SecurityNLPEngine extends EventEmitter {
  private tokenizer: SecurityTokenizer;
  private sentimentAnalyzer: SecuritySentimentAnalyzer;
  private threatExtractor: ThreatIntelligenceExtractor;
  private languageModels: Map<string, LanguageModel> = new Map();
  private isInitialized: boolean = false;
  private processingStats = {
    totalDocuments: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0,
    entityExtractionCount: 0,
    threatDetectionCount: 0
  };

  constructor() {
    super();
    this.tokenizer = new SecurityTokenizer();
    this.sentimentAnalyzer = new SecuritySentimentAnalyzer();
    this.threatExtractor = new ThreatIntelligenceExtractor();
    
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Load default language models
      await this.loadLanguageModel('en', 'english');
      
      this.isInitialized = true;
      
      this.emit('initialized', {
        languageModels: Array.from(this.languageModels.keys()),
        capabilities: this.getCapabilities(),
        timestamp: Date.now()
      });
      
      console.log('🧠 Security NLP Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize NLP Engine:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async analyzeText(text: string, options?: {
    language?: string;
    extractEntities?: boolean;
    analyzeSentiment?: boolean;
    extractThreatIntel?: boolean;
  }): Promise<TextAnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('NLP Engine not initialized');
    }

    const startTime = Date.now();
    const opts = {
      language: 'en',
      extractEntities: true,
      analyzeSentiment: true,
      extractThreatIntel: true,
      ...options
    };

    try {
      // Tokenization
      const tokens = this.tokenizer.tokenize(text);
      
      // Entity extraction
      const entities = opts.extractEntities ? 
        this.tokenizer.extractSecurityEntities(text) : [];
      
      // Sentiment analysis
      const sentiment = opts.analyzeSentiment ? 
        this.sentimentAnalyzer.analyzeSentiment(text) : this.getDefaultSentiment();
      
      // Threat intelligence extraction
      const threatIntel = opts.extractThreatIntel ? 
        this.threatExtractor.extractThreatIntelligence(text, entities) : this.getDefaultThreatIntel();
      
      const processingTime = Date.now() - startTime;
      
      // Update statistics
      this.updateProcessingStats(processingTime, entities.length, threatIntel.indicators.length > 0);
      
      const result: TextAnalysisResult = {
        originalText: text,
        tokens,
        entities,
        sentiment,
        threatIntel,
        language: opts.language,
        processingTime,
        timestamp: Date.now()
      };

      this.emit('text_analyzed', {
        textLength: text.length,
        entitiesFound: entities.length,
        threatLevel: threatIntel.severity,
        processingTime,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('❌ Text analysis failed:', error);
      this.emit('error', { type: 'analysis', error, text: text.substring(0, 100) });
      throw error;
    }
  }

  async batchAnalyze(texts: string[], options?: any): Promise<TextAnalysisResult[]> {
    const results = await Promise.all(
      texts.map(text => this.analyzeText(text, options))
    );
    
    this.emit('batch_analyzed', {
      batchSize: texts.length,
      totalProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0),
      averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length,
      timestamp: Date.now()
    });
    
    return results;
  }

  detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    if (englishWordCount / words.length > 0.1) {
      return 'en';
    }
    
    return 'unknown';
  }

  async loadLanguageModel(language: string, modelName: string): Promise<void> {
    // Simplified language model loading
    const model: LanguageModel = {
      name: modelName,
      language,
      vocabulary: new Map(),
      weights: new Float32Array(1000), // Placeholder
      isLoaded: true
    };
    
    this.languageModels.set(language, model);
    
    this.emit('model_loaded', {
      language,
      modelName,
      vocabularySize: model.vocabulary.size,
      timestamp: Date.now()
    });
  }

  getCapabilities(): any {
    return {
      textAnalysis: {
        tokenization: true,
        posTagging: true,
        dependencyParsing: false, // Simplified
        namedEntityRecognition: true
      },
      securitySpecific: {
        threatExtraction: true,
        iocDetection: true,
        vulnerabilityParsing: true,
        attackTechniqueIdentification: true
      },
      languageSupport: Array.from(this.languageModels.keys()),
      performanceTargets: {
        processingSpeed: "< 100ms per document",
        accuracy: "> 94%",
        multiLanguage: this.languageModels.size > 1
      }
    };
  }

  getProcessingStatistics(): any {
    return {
      ...this.processingStats,
      isInitialized: this.isInitialized,
      languageModelsLoaded: this.languageModels.size,
      capabilities: this.getCapabilities(),
      timestamp: Date.now()
    };
  }

  private updateProcessingStats(processingTime: number, entityCount: number, threatDetected: boolean): void {
    this.processingStats.totalDocuments++;
    this.processingStats.totalProcessingTime += processingTime;
    this.processingStats.averageProcessingTime = 
      this.processingStats.totalProcessingTime / this.processingStats.totalDocuments;
    this.processingStats.entityExtractionCount += entityCount;
    
    if (threatDetected) {
      this.processingStats.threatDetectionCount++;
    }
  }

  private getDefaultSentiment(): SentimentAnalysis {
    return {
      polarity: 0,
      subjectivity: 0,
      urgency: 0,
      classification: 'NEUTRAL',
      confidence: 0
    };
  }

  private getDefaultThreatIntel(): ThreatIntelligence {
    return {
      indicators: [],
      attackTechniques: [],
      threatActors: [],
      severity: 'LOW',
      confidence: 0,
      summary: 'No threat intelligence extracted',
      recommendations: []
    };
  }
}

export default SecurityNLPEngine;
