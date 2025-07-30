#!/bin/bash

# Build script for Quantum Edge Phase 6

# Set the environment
ENVIRONMENT="production"

# Define the source and build directories
SRC_DIR="./src"
BUILD_DIR="./dist"

# Create the build directory if it doesn't exist
mkdir -p $BUILD_DIR

# Compile TypeScript files
echo "Compiling TypeScript files..."
tsc --project tsconfig.json

# Copy necessary files to the build directory
echo "Copying necessary files..."
cp -R $SRC_DIR/config $BUILD_DIR/
cp -R $SRC_DIR/types $BUILD_DIR/
cp -R $SRC_DIR/utils $BUILD_DIR/
cp -R $SRC_DIR/docs $BUILD_DIR/docs/

# Notify completion
echo "Build completed successfully. Output is in the $BUILD_DIR directory."