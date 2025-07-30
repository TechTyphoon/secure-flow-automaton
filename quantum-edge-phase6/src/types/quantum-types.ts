export type QuantumState = {
  qubits: number;
  amplitudes: number[];
  measurement: (basis: number[]) => number[];
};

export type QuantumOperation = {
  name: string;
  matrix: number[][];
  apply: (state: QuantumState) => QuantumState;
};

export type QuantumCircuit = {
  operations: QuantumOperation[];
  addOperation: (operation: QuantumOperation) => void;
  execute: (initialState: QuantumState) => QuantumState;
};

export type QuantumMeasurement = {
  observable: string;
  result: number;
  probability: number;
};

export type QuantumAlgorithm = {
  name: string;
  description: string;
  run: (input: any) => any;
};