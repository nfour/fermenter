#!/bin/bash

# Clean
rm -rf build
mkdir build

# Copy latent, belonging to the index module
yarn cpy --dot '*' '!*/*' build
# # Copy latent files from source, recursively
yarn cpy --cwd src --parents '**/*' '!**/*.ts' '!**/*.snap' ../build

# Build typescript
yarn tsc
