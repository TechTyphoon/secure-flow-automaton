// Entertainment-specific type definitions

export interface UserPreferences {
  userId: string;
  interests: string[];
  contentHistory: ContentHistory[];
  viewingPatterns: ViewingPattern[];
  devicePreferences: DevicePreference[];
  accessibilityNeeds: AccessibilityNeed[];
  [key: string]: unknown; // Allow additional properties
}

export interface ContentHistory {
  contentId: string;
  contentType: 'video' | 'audio' | 'image' | 'text' | '3d';
  viewDuration: number;
  rating: number;
  timestamp: Date;
  platform: string;
  [key: string]: unknown; // Allow additional properties
}

export interface ViewingPattern {
  timeOfDay: number;
  dayOfWeek: number;
  duration: number;
  contentType: string;
  deviceType: string;
}

export interface DevicePreference {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'vr';
  screenSize: number;
  bandwidth: number;
  processingPower: number;
}

export interface AccessibilityNeed {
  type: 'visual' | 'auditory' | 'motor' | 'cognitive';
  requirements: string[];
  assistiveTechnologies: string[];
}

export interface PersonalizedContent {
  contentId: string;
  contentType: string;
  title: string;
  description: string;
  relevance: number;
  diversity: number;
  tags: string[];
}

export interface ImmersiveExperience {
  experienceId: string;
  type: 'vr' | 'ar' | 'mixed';
  complexity: 'simple' | 'moderate' | 'complex';
  interactivity: 'low' | 'medium' | 'high';
  immersionLevel: number;
  interactivityScore: number;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  frameRate: number;
  latency: number;
  resolution: number;
  renderingQuality: number;
  networkEfficiency: number;
}

export interface UserBehaviorData {
  userId: string;
  sessionId: string;
  timestamp: Date;
  action: 'view' | 'click' | 'scroll' | 'pause' | 'resume' | 'share' | 'like' | 'comment';
  contentId: string;
  duration: number;
  deviceInfo: DeviceInfo;
  location: Location;
  [key: string]: unknown; // Allow additional properties
}

export interface DeviceInfo {
  deviceType: string;
  os: string;
  browser: string;
  screenResolution: string;
  networkType: string;
}

export interface Location {
  country: string;
  region: string;
  city: string;
  timezone: string;
}

export interface BehaviorPattern {
  patternId: string;
  patternType: 'viewing' | 'interaction' | 'preference' | 'temporal';
  confidence: number;
  description: string;
  dataPoints: number;
}

export interface BehaviorPrediction {
  predictionId: string;
  userId: string;
  predictedAction: string;
  probability: number;
  timeframe: number;
  confidence: number;
}

export interface ContentRecommendation {
  contentId: string;
  reason: string;
  relevance: number;
  diversity: number;
  novelty: number;
}

export interface QuantumContentResult {
  content: PersonalizedContent[];
  relevance: number;
  diversity: number;
  processingTime: number;
}

export interface QuantumImmersiveResult {
  immersion: number;
  interactivity: number;
  metrics: PerformanceMetrics;
  processingTime: number;
}

export interface QuantumBehaviorResult {
  patterns: BehaviorPattern[];
  predictions: BehaviorPrediction[];
  recommendations: ContentRecommendation[];
  accuracy: number;
  processingTime: number;
}

export interface QuantumGamingResult {
  performance: number;
  aiIntelligence: number;
  playerExperience: number;
  processingTime: number;
}

export interface QuantumInteractiveResult {
  interactivity: number;
  responsiveness: number;
  userEngagement: number;
  processingTime: number;
} 