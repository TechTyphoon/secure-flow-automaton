export type ApiRequest<T> = {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: T;
  headers?: Record<string, string>;
};

export type ApiResponse<T> = {
  status: number;
  data: T;
  message?: string;
};

export interface QuantumResult {
  success: boolean;
  quantumAdvantage: number;
  processingMetrics: {
    time: number;
    accuracy: number;
    confidence: number;
  };
}

export type QuantumApiResponse = {
  quantumState: string;
  processingTime: number;
  result: QuantumResult;
};

export interface CognitiveInputData {
  stimulus: Record<string, unknown>;
  context: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

export type CognitiveProcessingRequest = {
  inputData: CognitiveInputData;
  modelId: string;
};

export interface TrainingSample {
  input: number[];
  output: number[];
  weight?: number;
}

export type NeuralNetworkTrainingRequest = {
  trainingData: TrainingSample[];
  epochs: number;
  learningRate: number;
};

export interface PatientRecord {
  id: string;
  demographics: {
    age: number;
    gender: string;
    medicalHistory: string[];
  };
  vitals: Record<string, number>;
  symptoms: string[];
  diagnosis?: string;
}

export type HealthcareAnalyticsRequest = {
  patientData: PatientRecord;
  analysisType: 'diagnostics' | 'predictive';
};

export interface FinancialData {
  assets: Array<{
    symbol: string;
    value: number;
    volatility: number;
    correlation: Record<string, number>;
  }>;
  marketConditions: {
    interestRate: number;
    inflation: number;
    marketVolatility: number;
  };
  timeHorizon: number;
}

export type FinanceModelingRequest = {
  financialData: FinancialData;
  modelType: 'riskAssessment' | 'portfolioOptimization';
};

export interface CityMetrics {
  population: number;
  infrastructure: {
    transportation: number;
    utilities: number;
    communications: number;
  };
  environmental: {
    airQuality: number;
    energyConsumption: number;
    wasteManagement: number;
  };
  economic: {
    gdp: number;
    unemployment: number;
    businessActivity: number;
  };
}

export type SmartCityOptimizationRequest = {
  cityData: CityMetrics;
  optimizationGoals: string[];
};