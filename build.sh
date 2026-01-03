#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
mkdir -p uploads
mkdir -p data
echo "✅ Build completed successfully"
