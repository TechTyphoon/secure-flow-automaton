export function initializeQuantumState(dimensions: number): number[][] {
    const state = Array.from({ length: dimensions }, () => Array(dimensions).fill(0));
    state[0][0] = 1; // Initialize to |0> state
    return state;
}

export function applyQuantumGate(state: number[][], gate: number[][]): number[][] {
    const result = Array.from({ length: state.length }, () => Array(state[0].length).fill(0));
    for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[0].length; j++) {
            for (let k = 0; k < gate.length; k++) {
                result[i][j] += gate[i][k] * state[k][j];
            }
        }
    }
    return result;
}

export function measureQuantumState(state: number[][]): number {
    const probabilities = state.map(row => row.reduce((sum, val) => sum + val ** 2, 0));
    const totalProbability = probabilities.reduce((sum, val) => sum + val, 0);
    const randomValue = Math.random() * totalProbability;
    let cumulativeProbability = 0;

    for (let i = 0; i < probabilities.length; i++) {
        cumulativeProbability += probabilities[i];
        if (randomValue <= cumulativeProbability) {
            return i; // Return the index of the measured state
        }
    }
    return -1; // Should not reach here
}