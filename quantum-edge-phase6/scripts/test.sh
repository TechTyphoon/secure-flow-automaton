#!/bin/bash

# This script runs the tests for the Quantum Edge Computing project.

# Navigate to the project directory
cd "$(dirname "$0")/.."

# Run unit tests
echo "Running unit tests..."
npm run test:unit

# Run integration tests
echo "Running integration tests..."
npm run test:integration

# Check for test coverage
echo "Checking test coverage..."
npm run coverage

echo "All tests completed."