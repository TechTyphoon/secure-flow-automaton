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

export type QuantumApiResponse = {
  quantumState: string;
  processingTime: number;
  result: any;
};

export type CognitiveProcessingRequest = {
  inputData: any;
  modelId: string;
};

export type NeuralNetworkTrainingRequest = {
  trainingData: any[];
  epochs: number;
  learningRate: number;
};

export type HealthcareAnalyticsRequest = {
  patientData: any;
  analysisType: 'diagnostics' | 'predictive';
};

export type FinanceModelingRequest = {
  financialData: any;
  modelType: 'riskAssessment' | 'portfolioOptimization';
};

export type SmartCityOptimizationRequest = {
  cityData: any;
  optimizationGoals: string[];
};