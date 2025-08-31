/**
 * Knowledge Graph Intelligence for Security Operations
 * Advanced graph-based threat intelligence and relationship analysis
 */

import { EventEmitter } from 'events';

// Core interfaces for knowledge graph
interface SecurityEntity {
  id: string;
  type: EntityType;
  properties: { [key: string]: EntityProperty };
  metadata: EntityMetadata;
  timestamp: number;
}

interface SecurityRelationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  type: RelationshipType;
  properties: { [key: string]: RelationshipProperty };
  confidence: number;
  temporal: TemporalInfo;
  metadata: RelationshipMetadata;
}

type EntityType = 
  | 'THREAT_ACTOR' 
  | 'MALWARE' 
  | 'VULNERABILITY' 
  | 'ASSET' 
  | 'IP_ADDRESS' 
  | 'DOMAIN' 
  | 'URL' 
  | 'FILE_HASH'
  | 'ATTACK_TECHNIQUE' 
  | 'CAMPAIGN' 
  | 'INDICATOR' 
  | 'LOCATION' 
  | 'ORGANIZATION';

type RelationshipType = 
  | 'TARGETS' 
  | 'EXPLOITS' 
  | 'COMMUNICATES_WITH' 
  | 'CONTAINS' 
  | 'USES' 
  | 'ATTRIBUTED_TO'
  | 'MITIGATES' 
  | 'INDICATES' 
  | 'RELATED_TO' 
  | 'PART_OF' 
  | 'AFFECTS' 
  | 'OWNS';

interface EntityMetadata {
  confidence: number;
  source: string[];
  lastUpdated: number;
  version: number;
  tags: string[];
  tlp: 'WHITE' | 'GREEN' | 'AMBER' | 'RED'; // Traffic Light Protocol
}

interface RelationshipMetadata {
  source: string[];
  reliability: number;
  lastSeen: number;
  frequency: number;
  context: string;
}

interface TemporalInfo {
  startTime?: number;
  endTime?: number;
  duration?: number;
  isActive: boolean;
}

interface GraphQuery {
  query: string;
  parameters?: { [key: string]: QueryParameter };
  resultLimit?: number;
  includeRelationships?: boolean;
  traversalDepth?: number;
}

interface GraphQueryResult {
  entities: SecurityEntity[];
  relationships: SecurityRelationship[];
  paths: GraphPath[];
  analytics: GraphAnalytics;
  executionTime: number;
  totalResults: number;
}

interface GraphPath {
  entities: string[]; // Entity IDs
  relationships: string[]; // Relationship IDs
  score: number;
  description: string;
}

interface GraphAnalytics {
  centrality: { [entityId: string]: number };
  clustering: { [entityId: string]: string };
  pageRank: { [entityId: string]: number };
  communities: Community[];
  temporalPatterns: TemporalPattern[];
}

interface Community {
  id: string;
  entities: string[];
  type: string;
  score: number;
  description: string;
}

interface TemporalPattern {
  pattern: string;
  entities: string[];
  timeRange: { start: number; end: number };
  frequency: number;
  significance: number;
}

interface ThreatIntelligenceEntry {
  entity: SecurityEntity;
  relationships: SecurityRelationship[];
  riskScore: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastActivity: number;
  predictions: ThreatPrediction[];
}

interface ThreatPrediction {
  type: string;
  probability: number;
  timeframe: string;
  indicators: string[];
  confidence: number;
}

// MITRE ATT&CK integration
interface AttackTechnique {
  techniqueId: string;
  name: string;
  description: string;
  tactics: string[];
  platforms: string[];
  dataSources: string[];
  mitigations: string[];
  detections: string[];
}

// Graph storage engine
class GraphStorageEngine {
  private entities: Map<string, SecurityEntity> = new Map();
  private relationships: Map<string, SecurityRelationship> = new Map();
  private entityIndex: Map<EntityType, Set<string>> = new Map();
  private relationshipIndex: Map<RelationshipType, Set<string>> = new Map();
  
  // Initialize indexes
  constructor() {
    // Initialize entity type indexes
    const entityTypes: EntityType[] = [
      'THREAT_ACTOR', 'MALWARE', 'VULNERABILITY', 'ASSET', 'IP_ADDRESS',
      'DOMAIN', 'URL', 'FILE_HASH', 'ATTACK_TECHNIQUE', 'CAMPAIGN',
      'INDICATOR', 'LOCATION', 'ORGANIZATION'
    ];
    
    entityTypes.forEach(type => {
      this.entityIndex.set(type, new Set());
    });
    
    // Initialize relationship type indexes
    const relationshipTypes: RelationshipType[] = [
      'TARGETS', 'EXPLOITS', 'COMMUNICATES_WITH', 'CONTAINS', 'USES',
      'ATTRIBUTED_TO', 'MITIGATES', 'INDICATES', 'RELATED_TO', 'PART_OF',
      'AFFECTS', 'OWNS'
    ];
    
    relationshipTypes.forEach(type => {
      this.relationshipIndex.set(type, new Set());
    });
  }

  addEntity(entity: SecurityEntity): void {
    this.entities.set(entity.id, entity);
    
    // Update index
    const typeIndex = this.entityIndex.get(entity.type);
    if (typeIndex) {
      typeIndex.add(entity.id);
    }
  }

  addRelationship(relationship: SecurityRelationship): void {
    // Validate that source and target entities exist
    if (!this.entities.has(relationship.source) || !this.entities.has(relationship.target)) {
      throw new Error('Source or target entity not found');
    }
    
    this.relationships.set(relationship.id, relationship);
    
    // Update index
    const typeIndex = this.relationshipIndex.get(relationship.type);
    if (typeIndex) {
      typeIndex.add(relationship.id);
    }
  }

  getEntity(id: string): SecurityEntity | undefined {
    return this.entities.get(id);
  }

  getRelationship(id: string): SecurityRelationship | undefined {
    return this.relationships.get(id);
  }

  getEntitiesByType(type: EntityType): SecurityEntity[] {
    const entityIds = this.entityIndex.get(type) || new Set();
    return Array.from(entityIds)
      .map(id => this.entities.get(id))
      .filter(entity => entity !== undefined) as SecurityEntity[];
  }

  getRelationshipsByType(type: RelationshipType): SecurityRelationship[] {
    const relationshipIds = this.relationshipIndex.get(type) || new Set();
    return Array.from(relationshipIds)
      .map(id => this.relationships.get(id))
      .filter(rel => rel !== undefined) as SecurityRelationship[];
  }

  getEntityRelationships(entityId: string): SecurityRelationship[] {
    const relationships: SecurityRelationship[] = [];
    
    for (const relationship of this.relationships.values()) {
      if (relationship.source === entityId || relationship.target === entityId) {
        relationships.push(relationship);
      }
    }
    
    return relationships;
  }

  findPath(sourceId: string, targetId: string, maxDepth: number = 3): GraphPath[] {
    const paths: GraphPath[] = [];
    const visited = new Set<string>();
    
    this.dfsPathFinding(sourceId, targetId, [], [], visited, paths, maxDepth, 0);
    
    // Sort paths by score (shorter paths get higher scores)
    return paths.sort((a, b) => b.score - a.score);
  }

  private dfsPathFinding(
    currentId: string,
    targetId: string,
    currentPath: string[],
    currentRelationships: string[],
    visited: Set<string>,
    paths: GraphPath[],
    maxDepth: number,
    currentDepth: number
  ): void {
    if (currentDepth > maxDepth) return;
    
    if (currentId === targetId && currentPath.length > 0) {
      const score = this.calculatePathScore(currentPath, currentRelationships);
      paths.push({
        entities: [...currentPath, currentId],
        relationships: [...currentRelationships],
        score,
        description: this.generatePathDescription(currentPath, currentRelationships, currentId)
      });
      return;
    }
    
    visited.add(currentId);
    
    const relationships = this.getEntityRelationships(currentId);
    
    for (const relationship of relationships) {
      const nextId = relationship.source === currentId ? relationship.target : relationship.source;
      
      if (!visited.has(nextId)) {
        this.dfsPathFinding(
          nextId,
          targetId,
          [...currentPath, currentId],
          [...currentRelationships, relationship.id],
          new Set(visited),
          paths,
          maxDepth,
          currentDepth + 1
        );
      }
    }
  }

  private calculatePathScore(entityPath: string[], relationshipPath: string[]): number {
    let score = 1.0 / entityPath.length; // Shorter paths get higher base score
    
    // Boost score based on relationship confidence
    for (const relId of relationshipPath) {
      const relationship = this.relationships.get(relId);
      if (relationship) {
        score *= relationship.confidence;
      }
    }
    
    return score;
  }

  private generatePathDescription(entityPath: string[], relationshipPath: string[], targetId: string): string {
    const descriptions: string[] = [];
    
    for (let i = 0; i < relationshipPath.length; i++) {
      const relationship = this.relationships.get(relationshipPath[i]);
      const sourceEntity = this.entities.get(entityPath[i]);
      
      if (relationship && sourceEntity) {
        descriptions.push(`${sourceEntity.type} ${relationship.type}`);
      }
    }
    
    const targetEntity = this.entities.get(targetId);
    if (targetEntity) {
      descriptions.push(targetEntity.type);
    }
    
    return descriptions.join(' → ');
  }

  searchEntities(query: string, type?: EntityType): SecurityEntity[] {
    const results: SecurityEntity[] = [];
    const searchTerm = query.toLowerCase();
    
    const entitiesToSearch = type ? 
      this.getEntitiesByType(type) : 
      Array.from(this.entities.values());
    
    for (const entity of entitiesToSearch) {
      // Search in entity properties
      const searchableText = JSON.stringify(entity.properties).toLowerCase();
      if (searchableText.includes(searchTerm)) {
        results.push(entity);
      }
    }
    
    return results;
  }

  getStatistics(): GraphStatistics {
    const entityTypeCounts: { [key: string]: number } = {};
    const relationshipTypeCounts: { [key: string]: number } = {};
    
    for (const [type, entitySet] of this.entityIndex) {
      entityTypeCounts[type] = entitySet.size;
    }
    
    for (const [type, relationshipSet] of this.relationshipIndex) {
      relationshipTypeCounts[type] = relationshipSet.size;
    }
    
    return {
      totalEntities: this.entities.size,
      totalRelationships: this.relationships.size,
      entityTypeCounts,
      relationshipTypeCounts,
      avgRelationshipsPerEntity: this.relationships.size / this.entities.size || 0
    };
  }
}

// Graph analytics engine
class GraphAnalyticsEngine {
  private storage: GraphStorageEngine;
  
  constructor(storage: GraphStorageEngine) {
    this.storage = storage;
  }

  calculateCentrality(): { [entityId: string]: number } {
    const centrality: { [entityId: string]: number } = {};
    const entities = Array.from(this.storage['entities'].keys());
    
    // Calculate degree centrality
    for (const entityId of entities) {
      const relationships = this.storage.getEntityRelationships(entityId);
      centrality[entityId] = relationships.length;
    }
    
    // Normalize values
    const maxCentrality = Math.max(...Object.values(centrality));
    if (maxCentrality > 0) {
      for (const entityId in centrality) {
        centrality[entityId] = centrality[entityId] / maxCentrality;
      }
    }
    
    return centrality;
  }

  calculatePageRank(dampingFactor: number = 0.85, iterations: number = 100): { [entityId: string]: number } {
    const entities = Array.from(this.storage['entities'].keys());
    const pageRank: { [entityId: string]: number } = {};
    
    // Initialize PageRank values
    const initialValue = 1.0 / entities.length;
    entities.forEach(id => {
      pageRank[id] = initialValue;
    });
    
    // Iterative calculation
    for (let i = 0; i < iterations; i++) {
      const newPageRank: { [entityId: string]: number } = {};
      
      for (const entityId of entities) {
        let rank = (1 - dampingFactor) / entities.length;
        
        // Get incoming relationships
        const incomingRels = this.getIncomingRelationships(entityId);
        
        for (const rel of incomingRels) {
          const sourceId = rel.source;
          const outgoingCount = this.storage.getEntityRelationships(sourceId).length;
          
          if (outgoingCount > 0) {
            rank += dampingFactor * (pageRank[sourceId] / outgoingCount);
          }
        }
        
        newPageRank[entityId] = rank;
      }
      
      // Update PageRank values
      Object.assign(pageRank, newPageRank);
    }
    
    return pageRank;
  }

  detectCommunities(): Community[] {
    const communities: Community[] = [];
    const entities = Array.from(this.storage['entities'].keys());
    const visited = new Set<string>();
    
    for (const entityId of entities) {
      if (!visited.has(entityId)) {
        const community = this.exploreCommunity(entityId, visited);
        if (community.entities.length > 1) {
          communities.push(community);
        }
      }
    }
    
    return communities.sort((a, b) => b.score - a.score);
  }

  private exploreCommunity(startEntityId: string, visited: Set<string>): Community {
    const communityEntities: string[] = [];
    const queue: string[] = [startEntityId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      communityEntities.push(currentId);
      
      // Add connected entities
      const relationships = this.storage.getEntityRelationships(currentId);
      for (const rel of relationships) {
        const connectedId = rel.source === currentId ? rel.target : rel.source;
        
        if (!visited.has(connectedId) && this.isStronglyConnected(currentId, connectedId)) {
          queue.push(connectedId);
        }
      }
    }
    
    const communityType = this.determineCommunityType(communityEntities);
    const score = this.calculateCommunityScore(communityEntities);
    
    return {
      id: `community_${startEntityId}`,
      entities: communityEntities,
      type: communityType,
      score,
      description: `${communityType} community with ${communityEntities.length} entities`
    };
  }

  private isStronglyConnected(entityId1: string, entityId2: string): boolean {
    const relationships = this.storage.getEntityRelationships(entityId1);
    const directConnections = relationships.filter(rel => 
      (rel.source === entityId1 && rel.target === entityId2) ||
      (rel.source === entityId2 && rel.target === entityId1)
    );
    
    return directConnections.length > 0 && directConnections.some(rel => rel.confidence > 0.7);
  }

  private determineCommunityType(entityIds: string[]): string {
    const entityTypes: { [type: string]: number } = {};
    
    for (const entityId of entityIds) {
      const entity = this.storage.getEntity(entityId);
      if (entity) {
        entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
      }
    }
    
    // Return the dominant entity type
    let dominantType = 'MIXED';
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(entityTypes)) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    }
    
    return dominantType;
  }

  private calculateCommunityScore(entityIds: string[]): number {
    // Calculate based on internal connectivity vs external connectivity
    let internalConnections = 0;
    let externalConnections = 0;
    
    for (const entityId of entityIds) {
      const relationships = this.storage.getEntityRelationships(entityId);
      
      for (const rel of relationships) {
        const otherId = rel.source === entityId ? rel.target : rel.source;
        
        if (entityIds.includes(otherId)) {
          internalConnections++;
        } else {
          externalConnections++;
        }
      }
    }
    
    const totalConnections = internalConnections + externalConnections;
    return totalConnections > 0 ? internalConnections / totalConnections : 0;
  }

  analyzeTemporalPatterns(): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];
    const timeWindows = this.createTimeWindows();
    
    for (const window of timeWindows) {
      const activeEntities = this.getActiveEntitiesInWindow(window);
      const pattern = this.identifyPattern(activeEntities, window);
      
      if (pattern) {
        patterns.push(pattern);
      }
    }
    
    return patterns.sort((a, b) => b.significance - a.significance);
  }

  private createTimeWindows(): { start: number; end: number }[] {
    const now = Date.now();
    const windows = [];
    
    // Create hourly windows for the last 24 hours
    for (let i = 0; i < 24; i++) {
      const end = now - (i * 3600000);
      const start = end - 3600000;
      windows.push({ start, end });
    }
    
    return windows;
  }

  private getActiveEntitiesInWindow(window: { start: number; end: number }): string[] {
    const activeEntities: string[] = [];
    
    for (const [entityId, entity] of this.storage['entities']) {
      if (entity.timestamp >= window.start && entity.timestamp <= window.end) {
        activeEntities.push(entityId);
      }
    }
    
    return activeEntities;
  }

  private identifyPattern(entityIds: string[], window: { start: number; end: number }): TemporalPattern | null {
    if (entityIds.length < 2) return null;
    
    // Simple pattern: burst of activity
    const averageActivity = 5; // Baseline entities per hour
    
    if (entityIds.length > averageActivity * 2) {
      return {
        pattern: 'ACTIVITY_BURST',
        entities: entityIds,
        timeRange: window,
        frequency: entityIds.length,
        significance: Math.min(1.0, entityIds.length / (averageActivity * 3))
      };
    }
    
    return null;
  }

  private getIncomingRelationships(entityId: string): SecurityRelationship[] {
    const incoming: SecurityRelationship[] = [];
    
    for (const relationship of this.storage['relationships'].values()) {
      if (relationship.target === entityId) {
        incoming.push(relationship);
      }
    }
    
    return incoming;
  }
}

// MITRE ATT&CK integration
class MitreAttackIntegration {
  private techniques: Map<string, AttackTechnique> = new Map();
  
  constructor() {
    this.loadMitreData();
  }

  private loadMitreData(): void {
    // Sample MITRE ATT&CK techniques
    const sampleTechniques: AttackTechnique[] = [
      {
        techniqueId: 'T1566',
        name: 'Phishing',
        description: 'Adversaries may send phishing messages to gain access to victim systems.',
        tactics: ['Initial Access'],
        platforms: ['Linux', 'macOS', 'Windows'],
        dataSources: ['Application Log', 'File', 'Network Traffic'],
        mitigations: ['M1017', 'M1021', 'M1054'],
        detections: ['Monitor for suspicious email attachments', 'Analyze network traffic patterns']
      },
      {
        techniqueId: 'T1059',
        name: 'Command and Scripting Interpreter',
        description: 'Adversaries may abuse command and script interpreters to execute commands.',
        tactics: ['Execution'],
        platforms: ['Linux', 'macOS', 'Windows'],
        dataSources: ['Command', 'Process', 'Script'],
        mitigations: ['M1038', 'M1042'],
        detections: ['Monitor command-line activity', 'Analyze process creation events']
      },
      {
        techniqueId: 'T1055',
        name: 'Process Injection',
        description: 'Adversaries may inject code into processes to hide their presence.',
        tactics: ['Defense Evasion', 'Privilege Escalation'],
        platforms: ['Linux', 'macOS', 'Windows'],
        dataSources: ['API Monitoring', 'Process', 'Windows Registry'],
        mitigations: ['M1040'],
        detections: ['Monitor for process modifications', 'Analyze memory access patterns']
      }
    ];

    for (const technique of sampleTechniques) {
      this.techniques.set(technique.techniqueId, technique);
    }
  }

  getTechnique(techniqueId: string): AttackTechnique | undefined {
    return this.techniques.get(techniqueId);
  }

  searchTechniques(query: string): AttackTechnique[] {
    const results: AttackTechnique[] = [];
    const searchTerm = query.toLowerCase();
    
    for (const technique of this.techniques.values()) {
      if (technique.name.toLowerCase().includes(searchTerm) ||
          technique.description.toLowerCase().includes(searchTerm) ||
          technique.tactics.some(tactic => tactic.toLowerCase().includes(searchTerm))) {
        results.push(technique);
      }
    }
    
    return results;
  }

  getTechniquesByTactic(tactic: string): AttackTechnique[] {
    const results: AttackTechnique[] = [];
    
    for (const technique of this.techniques.values()) {
      if (technique.tactics.includes(tactic)) {
        results.push(technique);
      }
    }
    
    return results;
  }
}

// Main Knowledge Graph Intelligence
export class SecurityKnowledgeGraph extends EventEmitter {
  private storage: GraphStorageEngine;
  private analytics: GraphAnalyticsEngine;
  private mitreIntegration: MitreAttackIntegration;
  private isInitialized: boolean = false;
  private queryCache: Map<string, GraphQueryResult> = new Map();

  constructor() {
    super();
    
    this.storage = new GraphStorageEngine();
    this.analytics = new GraphAnalyticsEngine(this.storage);
    this.mitreIntegration = new MitreAttackIntegration();
    
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Load sample data
      await this.loadSampleData();
      
      this.isInitialized = true;
      
      this.emit('initialized', {
        entities: this.storage.getStatistics().totalEntities,
        relationships: this.storage.getStatistics().totalRelationships,
        timestamp: Date.now()
      });
      
      console.log('🕸️ Security Knowledge Graph initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Knowledge Graph:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async executeQuery(query: GraphQuery): Promise<GraphQueryResult> {
    if (!this.isInitialized) {
      throw new Error('Knowledge Graph not initialized');
    }

    const startTime = Date.now();
    const cacheKey = JSON.stringify(query);
    
    // Check cache
    if (this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey)!;
      this.emit('query_cached', { query: query.query, executionTime: 0 });
      return cached;
    }

    try {
      let entities: SecurityEntity[] = [];
      let relationships: SecurityRelationship[] = [];
      let paths: GraphPath[] = [];

      // Simple query parsing (in production, use a proper query parser)
      if (query.query.toLowerCase().includes('find entities')) {
        entities = this.handleFindEntitiesQuery(query);
      } else if (query.query.toLowerCase().includes('find path')) {
        paths = this.handleFindPathQuery(query);
      } else if (query.query.toLowerCase().includes('find relationships')) {
        relationships = this.handleFindRelationshipsQuery(query);
      } else {
        // Generic search
        entities = this.storage.searchEntities(query.query);
      }

      // Include relationships if requested
      if (query.includeRelationships && entities.length > 0) {
        const entityIds = new Set(entities.map(e => e.id));
        relationships = Array.from(this.storage['relationships'].values())
          .filter(rel => entityIds.has(rel.source) || entityIds.has(rel.target));
      }

      // Calculate analytics
      const analytics = this.calculateQueryAnalytics(entities, relationships);
      
      const result: GraphQueryResult = {
        entities: entities.slice(0, query.resultLimit || 100),
        relationships: relationships.slice(0, query.resultLimit || 100),
        paths: paths.slice(0, query.resultLimit || 50),
        analytics,
        executionTime: Date.now() - startTime,
        totalResults: entities.length + relationships.length + paths.length
      };

      // Cache result
      this.queryCache.set(cacheKey, result);
      
      // Limit cache size
      if (this.queryCache.size > 100) {
        const firstKey = this.queryCache.keys().next().value;
        this.queryCache.delete(firstKey);
      }

      this.emit('query_executed', {
        query: query.query,
        resultCount: result.totalResults,
        executionTime: result.executionTime,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('❌ Graph query execution failed:', error);
      this.emit('error', { type: 'query_execution', error, query: query.query });
      throw error;
    }
  }

  addThreatIntelligence(intel: ThreatIntelligenceEntry): void {
    // Add entity
    this.storage.addEntity(intel.entity);
    
    // Add relationships
    for (const relationship of intel.relationships) {
      try {
        this.storage.addRelationship(relationship);
      } catch (error) {
        console.warn('Failed to add relationship:', relationship.id, error);
      }
    }

    this.emit('threat_intelligence_added', {
      entityId: intel.entity.id,
      relationshipCount: intel.relationships.length,
      threatLevel: intel.threatLevel,
      timestamp: Date.now()
    });
  }

  analyzeEntity(entityId: string): ThreatIntelligenceEntry | null {
    const entity = this.storage.getEntity(entityId);
    if (!entity) return null;

    const relationships = this.storage.getEntityRelationships(entityId);
    const riskScore = this.calculateRiskScore(entity, relationships);
    const threatLevel = this.determineThreatLevel(riskScore);
    const predictions = this.generateThreatPredictions(entity, relationships);

    return {
      entity,
      relationships,
      riskScore,
      threatLevel,
      lastActivity: entity.timestamp,
      predictions
    };
  }

  findThreatActorCampaigns(actorId: string): GraphPath[] {
    return this.storage.findPath(actorId, 'CAMPAIGN');
  }

  analyzeThreatLandscape(): {
    topThreats: ThreatIntelligenceEntry[];
    emergingPatterns: TemporalPattern[];
    riskAssessment: RiskAssessment;
  } {
    const entities = Array.from(this.storage['entities'].values());
    const threatEntities = entities.filter(e => 
      ['THREAT_ACTOR', 'MALWARE', 'CAMPAIGN'].includes(e.type)
    );

    const topThreats = threatEntities
      .map(entity => {
        const analysis = this.analyzeEntity(entity.id);
        return analysis;
      })
      .filter(analysis => analysis !== null)
      .sort((a, b) => b!.riskScore - a!.riskScore)
      .slice(0, 10) as ThreatIntelligenceEntry[];

    const emergingPatterns = this.analytics.analyzeTemporalPatterns();
    
    const riskAssessment = {
      overallRiskLevel: this.calculateOverallRisk(topThreats),
      criticalAssets: this.identifyCriticalAssets(),
      vulnerabilityExposure: this.assessVulnerabilityExposure()
    };

    return {
      topThreats,
      emergingPatterns,
      riskAssessment
    };
  }

  getGraphStatistics(): ExtendedGraphStatistics {
    const baseStats = this.storage.getStatistics();
    const centrality = this.analytics.calculateCentrality();
    const communities = this.analytics.detectCommunities();
    
    return {
      ...baseStats,
      topCentralEntities: Object.entries(centrality)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      communityCount: communities.length,
      cacheSize: this.queryCache.size,
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  private async loadSampleData(): Promise<void> {
    // Sample entities
    const sampleEntities: SecurityEntity[] = [
      {
        id: 'apt29',
        type: 'THREAT_ACTOR',
        properties: {
          name: 'APT29',
          aliases: ['Cozy Bear', 'The Dukes'],
          origin: 'Russia',
          firstSeen: '2010-01-01',
          motivations: ['espionage', 'intelligence']
        },
        metadata: {
          confidence: 0.95,
          source: ['FireEye', 'CrowdStrike'],
          lastUpdated: Date.now(),
          version: 1,
          tags: ['apt', 'russia', 'espionage'],
          tlp: 'WHITE'
        },
        timestamp: Date.now()
      },
      {
        id: 'sunburst_malware',
        type: 'MALWARE',
        properties: {
          name: 'SUNBURST',
          family: 'Backdoor',
          platforms: ['Windows'],
          firstSeen: '2020-03-01',
          description: 'Supply chain backdoor in SolarWinds Orion'
        },
        metadata: {
          confidence: 0.98,
          source: ['SolarWinds', 'FireEye'],
          lastUpdated: Date.now(),
          version: 1,
          tags: ['backdoor', 'supply-chain', 'solarwinds'],
          tlp: 'WHITE'
        },
        timestamp: Date.now()
      }
    ];

    // Add sample entities
    for (const entity of sampleEntities) {
      this.storage.addEntity(entity);
    }

    // Sample relationships
    const sampleRelationships: SecurityRelationship[] = [
      {
        id: 'apt29_uses_sunburst',
        source: 'apt29',
        target: 'sunburst_malware',
        type: 'USES',
        properties: {
          campaign: 'SolarWinds Supply Chain',
          timeframe: '2020-2021'
        },
        confidence: 0.9,
        temporal: {
          startTime: new Date('2020-03-01').getTime(),
          endTime: new Date('2020-12-01').getTime(),
          isActive: false
        },
        metadata: {
          source: ['FireEye', 'Microsoft'],
          reliability: 0.95,
          lastSeen: Date.now(),
          frequency: 1,
          context: 'SolarWinds breach analysis'
        }
      }
    ];

    // Add sample relationships
    for (const relationship of sampleRelationships) {
      this.storage.addRelationship(relationship);
    }
  }

  private handleFindEntitiesQuery(query: GraphQuery): SecurityEntity[] {
    // Parse entity type from query
    const typeMatch = query.query.match(/type:(\w+)/i);
    const entityType = typeMatch ? typeMatch[1].toUpperCase() as EntityType : undefined;
    
    if (entityType) {
      return this.storage.getEntitiesByType(entityType);
    }
    
    return this.storage.searchEntities(query.query);
  }

  private handleFindPathQuery(query: GraphQuery): GraphPath[] {
    // Simple path query parsing: "find path from X to Y"
    const pathMatch = query.query.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    
    if (pathMatch) {
      const sourceId = pathMatch[1];
      const targetId = pathMatch[2];
      return this.storage.findPath(sourceId, targetId, query.traversalDepth || 3);
    }
    
    return [];
  }

  private handleFindRelationshipsQuery(query: GraphQuery): SecurityRelationship[] {
    // Parse relationship type from query
    const typeMatch = query.query.match(/type:(\w+)/i);
    const relType = typeMatch ? typeMatch[1].toUpperCase() as RelationshipType : undefined;
    
    if (relType) {
      return this.storage.getRelationshipsByType(relType);
    }
    
    return Array.from(this.storage['relationships'].values());
  }

  private calculateQueryAnalytics(
    entities: SecurityEntity[], 
    relationships: SecurityRelationship[]
  ): GraphAnalytics {
    const entityIds = entities.map(e => e.id);
    
    // Calculate centrality for result entities
    const allCentrality = this.analytics.calculateCentrality();
    const resultCentrality: { [entityId: string]: number } = {};
    for (const entityId of entityIds) {
      if (allCentrality[entityId]) {
        resultCentrality[entityId] = allCentrality[entityId];
      }
    }

    // Simple clustering based on entity types
    const clustering: { [entityId: string]: string } = {};
    for (const entity of entities) {
      clustering[entity.id] = entity.type;
    }

    return {
      centrality: resultCentrality,
      clustering,
      pageRank: {}, // Computed on demand
      communities: this.analytics.detectCommunities(),
      temporalPatterns: this.analytics.analyzeTemporalPatterns()
    };
  }

  private calculateRiskScore(entity: SecurityEntity, relationships: SecurityRelationship[]): number {
    let score = 0.5; // Base score

    // Entity type weighting
    const typeWeights: { [key in EntityType]: number } = {
      'THREAT_ACTOR': 0.9,
      'MALWARE': 0.8,
      'VULNERABILITY': 0.7,
      'CAMPAIGN': 0.8,
      'ATTACK_TECHNIQUE': 0.6,
      'IP_ADDRESS': 0.4,
      'DOMAIN': 0.4,
      'URL': 0.3,
      'FILE_HASH': 0.5,
      'INDICATOR': 0.5,
      'ASSET': 0.2,
      'LOCATION': 0.1,
      'ORGANIZATION': 0.2
    };

    score = typeWeights[entity.type] || 0.5;

    // Relationship impact
    const highRiskRelationships = relationships.filter(rel => 
      ['TARGETS', 'EXPLOITS', 'USES'].includes(rel.type)
    );
    
    score += highRiskRelationships.length * 0.1;

    // Recency impact
    const daysSinceLastActivity = (Date.now() - entity.timestamp) / (24 * 60 * 60 * 1000);
    if (daysSinceLastActivity < 7) {
      score += 0.2; // Recent activity increases risk
    }

    return Math.min(1.0, score);
  }

  private determineThreatLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore >= 0.8) return 'CRITICAL';
    if (riskScore >= 0.6) return 'HIGH';
    if (riskScore >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private generateThreatPredictions(
    entity: SecurityEntity, 
    relationships: SecurityRelationship[]
  ): ThreatPrediction[] {
    const predictions: ThreatPrediction[] = [];

    // Predict based on entity type and relationships
    if (entity.type === 'THREAT_ACTOR') {
      const targetingRelationships = relationships.filter(rel => rel.type === 'TARGETS');
      
      if (targetingRelationships.length > 0) {
        predictions.push({
          type: 'CONTINUED_TARGETING',
          probability: 0.7,
          timeframe: '30 days',
          indicators: targetingRelationships.map(rel => rel.target),
          confidence: 0.8
        });
      }
    }

    return predictions;
  }

  private calculateOverallRisk(threats: ThreatIntelligenceEntry[]): string {
    if (threats.length === 0) return 'LOW';
    
    const avgRisk = threats.reduce((sum, threat) => sum + threat.riskScore, 0) / threats.length;
    
    if (avgRisk >= 0.8) return 'CRITICAL';
    if (avgRisk >= 0.6) return 'HIGH';
    if (avgRisk >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private identifyCriticalAssets(): string[] {
    const assets = this.storage.getEntitiesByType('ASSET');
    return assets
      .filter(asset => {
        const relationships = this.storage.getEntityRelationships(asset.id);
        const threatRelationships = relationships.filter(rel => 
          rel.type === 'TARGETS' && rel.target === asset.id
        );
        return threatRelationships.length > 0;
      })
      .map(asset => asset.id);
  }

  private assessVulnerabilityExposure(): { exposed: number; total: number; percentage: number } {
    const vulnerabilities = this.storage.getEntitiesByType('VULNERABILITY');
    const exposedVulns = vulnerabilities.filter(vuln => {
      const relationships = this.storage.getEntityRelationships(vuln.id);
      return relationships.some(rel => rel.type === 'EXPLOITS');
    });

    return {
      exposed: exposedVulns.length,
      total: vulnerabilities.length,
      percentage: vulnerabilities.length > 0 ? (exposedVulns.length / vulnerabilities.length) * 100 : 0
    };
  }
}

// Type definitions for knowledge graph
type EntityProperty = string | number | boolean | string[] | Record<string, unknown>;

type RelationshipProperty = string | number | boolean | string[] | Record<string, unknown>;

type QueryParameter = string | number | boolean | string[];

interface GraphStatistics {
  totalEntities: number;
  totalRelationships: number;
  entityTypeCounts: Record<string, number>;
  relationshipTypeCounts: Record<string, number>;
  avgRelationshipsPerEntity: number;
}

interface RiskAssessment {
  overallRiskLevel: string;
  criticalAssets: string[];
  vulnerabilityExposure: { exposed: number; total: number; percentage: number };
}

interface ExtendedGraphStatistics extends GraphStatistics {
  topCentralEntities: [string, number][];
  communityCount: number;
  cacheSize: number;
  isInitialized: boolean;
  timestamp: number;
}

export default SecurityKnowledgeGraph;
