#!/bin/bash

# Clean
rm -rf build
mkdir build

# Copy latent, belonging to the index module
rsync -am . ./build  --exclude '*/*' --include '*'

# Copy latent files from source, recursively
rsync -am  ./src/* ./build --exclude '*.ts' --exclude '*.snap'

# Build typescript
yarn tsc
