#!/bin/bash

echo "📦 Installing dependencies for MCP server..."
npm install

echo ""
echo "🔨 Building MCP server..."
npm run build

echo ""
echo "✅ MCP server build complete!" 