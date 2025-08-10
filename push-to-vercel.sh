#!/bin/bash

# Script to push changes to Vercel
echo "🚀 Pushing changes to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the project directory"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo "📦 Adding all changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Expand cards to full width for creator and freelancer niches - Updated grid layout to use 3 columns instead of 4 for better spacing"

# Push to Vercel
echo "🚀 Pushing to Vercel..."
git push

echo "✅ Done! Changes are being deployed to Vercel..."
echo "⏱️  Deployment typically takes 1-3 minutes" 