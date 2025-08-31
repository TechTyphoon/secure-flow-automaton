// Aerospace-specific type definitions

export interface ComponentHealth {
  componentId: string;
  componentType: 'engine' | 'avionics' | 'landing_gear' | 'control_surface' | 'airframe';
  healthScore: number;
  lastInspection: Date;
  wearLevel: number;
  predictedFailure: Date | null;
}

export interface MaintenanceRecord {
  recordId: string;
  componentId: string;
  maintenanceType: 'inspection' | 'repair' | 'replacement' | 'overhaul';
  date: Date;
  cost: number;
  technician: string;
  notes: string;
}

export interface MaintenanceSchedule {
  componentId: string;
  maintenanceType: 'inspection' | 'repair' | 'replacement' | 'overhaul';
  scheduledDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  requiredParts: string[];
}

export interface RiskAssessment {
  riskId: string;
  componentId: string;
  riskType: 'mechanical' | 'electrical' | 'structural' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  mitigationStrategy: string;
}

export interface AircraftGeometry {
  length: number;
  wingspan: number;
  height: number;
  wingArea: number;
  aspectRatio: number;
  sweepAngle: number;
  airfoilType: string;
  [key: string]: unknown; // Allow additional properties
}

export interface OperatingConditions {
  altitude: number;
  speed: number;
  temperature: number;
  pressure: number;
  humidity: number;
  turbulence: number;
  [key: string]: unknown; // Allow additional properties
}

export interface StabilityMetrics {
  longitudinalStability?: number;
  lateralStability?: number;
  directionalStability?: number;
  controlEffectiveness?: number;
  stallCharacteristics?: number;
  pitch?: number;
  roll?: number;
  yaw?: number;
  [key: string]: unknown; // Allow additional properties
}

export interface MissionPayload {
  weight: number;
  volume: number;
  powerRequirements: number;
  communicationNeeds: string[];
  scientificInstruments: string[];
}

export interface MissionConstraints {
  budget: number;
  timeline: number;
  technicalLimitations: string[];
  regulatoryRequirements: string[];
  safetyStandards: string[];
}

export interface MissionPlan {
  phases?: MissionPhase[];
  resourceAllocation?: ResourceAllocation;
  riskMitigation?: RiskMitigation[];
  successCriteria?: SuccessCriteria[];
  [key: string]: unknown; // Allow additional properties
}

export interface MissionPhase {
  phaseId: string;
  name: string;
  duration: number;
  objectives: string[];
  activities: string[];
  dependencies: string[];
}

export interface ResourceAllocation {
  personnel?: PersonnelAllocation[];
  equipment?: EquipmentAllocation[];
  budget?: BudgetAllocation;
  fuel?: number;
  power?: number;
  [key: string]: unknown; // Allow additional properties
}

export interface PersonnelAllocation {
  role: string;
  count: number;
  skills: string[];
  availability: Date[];
}

export interface EquipmentSpecifications {
  [key: string]: string | number | boolean;
}

export interface EquipmentAllocation {
  equipmentType: string;
  quantity: number;
  specifications: EquipmentSpecifications;
  availability: Date[];
}

export interface BudgetAllocation {
  total: number;
  phases: Record<string, number>;
  contingency: number;
}

export interface RiskMitigation {
  riskId: string;
  description: string;
  probability: number;
  impact: string;
  mitigationStrategy: string;
  contingencyPlan: string;
}

export interface SuccessCriteria {
  criterionId: string;
  description: string;
  metric: string;
  target: number;
  unit: string;
}

export interface SpaceDebris {
  debrisId: string;
  size: number;
  mass: number;
  velocity: number;
  orbit: {
    altitude: number;
    inclination: number;
    eccentricity: number;
  };
  material: string;
  origin: string;
  trackingAccuracy: number;
  [key: string]: unknown; // Allow additional properties
}

export interface CollisionRisk {
  debrisId: string;
  targetId: string;
  probability: number;
  timeToCollision: number;
  impactEnergy: number;
  mitigationOptions: string[];
}

export interface QuantumOptimizationResult {
  schedule?: MaintenanceSchedule[];
  risks?: RiskAssessment[];
  cost?: number;
  accuracy?: number;
  optimizedRoute?: string[];
  fuelEfficiency?: number;
  timeSavings?: number;
  quality?: number;
  efficiency?: number;
  costSavings?: number;
  [key: string]: unknown; // Allow additional properties
}

export interface QuantumAerodynamicsResult {
  efficiency: number;
  drag: number;
  lift: number;
  stability: StabilityMetrics;
  accuracy: number;
}

export interface QuantumMissionResult {
  plan: MissionPlan;
  probability: number;
  resources: ResourceAllocation;
  efficiency: number;
}

export interface QuantumDebrisResult {
  collisionRisks: CollisionRisk[];
  trackingAccuracy: number;
  mitigationStrategies: string[];
  efficiency: number;
} 