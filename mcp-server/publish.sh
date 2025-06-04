#!/bin/bash

echo "🚀 Publishing @fundamentallabs/minecraft-mcp to npm..."
echo ""
echo "Current version: $(node -p "require('./package.json').version")"
echo ""
echo "This script will:"
echo "1. Build the TypeScript code"
echo "2. Publish to npm"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Publishing cancelled."
    exit 1
fi

echo "📦 Building package..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "📤 Publishing to npm..."
npm publish

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully published @fundamentallabs/minecraft-mcp!"
    echo ""
    echo "Users can now install with:"
    echo "  npm install -g @fundamentallabs/minecraft-mcp"
    echo ""
    echo "And run with:"
    echo "  minecraft-mcp -p 25565 -h localhost"
else
    echo ""
    echo "❌ Publishing failed. Please check your npm authentication and try again."
    echo "You may need to run: npm login"
fi 