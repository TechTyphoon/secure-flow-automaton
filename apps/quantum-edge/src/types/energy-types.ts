// Energy-specific type definitions

export interface PowerGridData {
  gridId: string;
  capacity: number;
  currentLoad: number;
  renewablePercentage: number;
  storageCapacity: number;
  transmissionLines: TransmissionLine[];
  substations: Substation[];
}

export interface TransmissionLine {
  lineId: string;
  voltage: number;
  capacity: number;
  length: number;
  efficiency: number;
  maintenanceStatus: 'operational' | 'maintenance' | 'outage';
}

export interface Substation {
  substationId: string;
  voltage: number;
  capacity: number;
  load: number;
  efficiency: number;
  maintenanceStatus: 'operational' | 'maintenance' | 'outage';
  [key: string]: unknown; // Allow additional properties
}

export interface RenewableEnergySource {
  sourceId: string;
  type: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';
  capacity: number;
  currentOutput: number;
  efficiency: number;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  weatherConditions: WeatherConditions;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  solarIrradiance: number;
  cloudCover: number;
  [key: string]: unknown; // Allow additional properties
}

export interface EnergyStorage {
  storageId: string;
  type: 'battery' | 'pumped_hydro' | 'compressed_air' | 'thermal';
  capacity: number;
  currentCharge: number;
  efficiency: number;
  chargeRate: number;
  dischargeRate: number;
}

export interface EnergyDemand {
  demandId: string;
  timestamp: Date;
  residential: number;
  commercial: number;
  industrial: number;
  total: number;
  peakDemand: number;
  averageDemand: number;
  [key: string]: unknown; // Allow additional properties
}

export interface GridOptimizationResult {
  gridId: string;
  efficiency: number;
  costSavings: number;
  carbonReduction: number;
  reliability: number;
  quantumAdvantage: number;
}

export interface RenewableOptimizationResult {
  sourceId: string;
  outputOptimization: number;
  efficiency: number;
  costSavings: number;
  quantumAdvantage: number;
}

export interface StorageOptimizationResult {
  storageId: string;
  chargeSchedule: ChargeSchedule[];
  dischargeSchedule: DischargeSchedule[];
  efficiency: number;
  costSavings: number;
  quantumAdvantage: number;
}

export interface ChargeSchedule {
  timeSlot: Date;
  chargeRate: number;
  energySource: string;
  cost: number;
}

export interface DischargeSchedule {
  timeSlot: Date;
  dischargeRate: number;
  demandSource: string;
  revenue: number;
}

export interface NuclearReactorData {
  reactorId: string;
  type: 'pressurized_water' | 'boiling_water' | 'fast_breeder' | 'fusion';
  thermalPower: number;
  electricalPower: number;
  efficiency: number;
  fuelType: string;
  fuelEnrichment: number;
  controlRods: ControlRod[];
  safetySystems: SafetySystem[];
}

export interface ControlRod {
  rodId: string;
  position: number;
  reactivity: number;
  status: 'inserted' | 'withdrawn' | 'maintenance';
}

export interface SafetySystem {
  systemId: string;
  type: 'emergency_cooling' | 'containment' | 'shutdown' | 'monitoring';
  status: 'operational' | 'maintenance' | 'failure';
  reliability: number;
}

export interface NuclearOptimizationResult {
  reactorId: string;
  powerOutput: number;
  efficiency: number;
  safetyScore: number;
  fuelEfficiency: number;
  quantumAdvantage: number;
}

export interface SmartGridData {
  gridId: string;
  smartMeters: SmartMeter[];
  demandResponse: DemandResponse[];
  distributedGeneration: DistributedGeneration[];
  microgrids: Microgrid[];
}

export interface SmartMeter {
  meterId: string;
  location: string;
  currentReading: number;
  historicalData: MeterReading[];
  communicationStatus: 'online' | 'offline' | 'error';
}

export interface MeterReading {
  timestamp: Date;
  reading: number;
  quality: 'good' | 'questionable' | 'bad';
}

export interface DemandResponse {
  responseId: string;
  type: 'load_shedding' | 'load_shifting' | 'peak_shaving';
  participants: number;
  totalReduction: number;
  duration: number;
  costSavings: number;
}

export interface DistributedGeneration {
  generatorId: string;
  type: 'solar' | 'wind' | 'microturbine' | 'fuel_cell';
  capacity: number;
  currentOutput: number;
  location: string;
  gridConnection: 'grid_connected' | 'island_mode';
}

export interface Microgrid {
  microgridId: string;
  capacity: number;
  currentLoad: number;
  generation: DistributedGeneration[];
  storage: EnergyStorage[];
  gridConnection: 'connected' | 'islanded';
}

export interface SmartGridOptimizationResult {
  gridId: string;
  efficiency: number;
  reliability: number;
  costSavings: number;
  carbonReduction: number;
  quantumAdvantage: number;
}

export interface QuantumEnergyResult {
  optimization?: GridOptimizationResult | RenewableOptimizationResult | StorageOptimizationResult | NuclearOptimizationResult | SmartGridOptimizationResult;
  accuracy?: number;
  processingTime?: number;
  forecastId?: string;
  demandPrediction?: number[];
  generationPrediction?: number[];
  pricePrediction?: number[];
  quantumAdvantage?: number;
  [key: string]: unknown; // Allow additional properties
} 