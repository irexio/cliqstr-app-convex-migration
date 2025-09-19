#!/bin/bash

set -e

echo "📦 Exporting data from Prod (upbeat-hedgehog-998)..."
npx convex export --deployment-name prod:upbeat-hedgehog-998 --path prod.zip

echo "📥 Importing data into Dev (adorable-chicken-923)..."
npx convex import --deployment-name dev:adorable-chicken-923 --replace prod.zip

echo "✅ Dev database refreshed from Prod"
