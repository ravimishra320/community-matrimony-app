#!/bin/bash
# Lambda deployment script

set -e

echo "Building Lambda functions..."
npm run build

echo "Creating deployment packages..."
mkdir -p dist

# Package each Lambda function
for dir in src/*/; do
  module=$(basename "$dir")
  for file in "$dir"*.ts; do
    if [ -f "$file" ]; then
      filename=$(basename "$file" .ts)
      echo "Packaging ${module}/${filename}..."
      
      cd dist
      zip -r "${module}-${filename}.zip" "${module}/${filename}.js" shared/ node_modules/
      cd ..
    fi
  done
done

echo "Deployment packages created in dist/"
echo "Run 'terraform apply' to deploy Lambda functions"
