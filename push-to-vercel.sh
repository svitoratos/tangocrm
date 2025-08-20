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
git commit -m "Fix journal and goals saving issue - Resolved API routing conflicts and user ID handling for proper data persistence"

# Push to Vercel
echo "🚀 Pushing to Vercel..."
git push

echo "✅ Done! Changes are being deployed to Vercel..."
echo "⏱️  Deployment typically takes 1-3 minutes" 