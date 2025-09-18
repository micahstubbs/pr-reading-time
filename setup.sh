#!/bin/bash

# PR Reading Time - Quick Setup Script
# This script adds the PR Reading Time action to your repository

set -e

echo "🚀 PR Reading Time - Quick Setup"
echo "================================"

# Check if in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if .github/workflows exists
mkdir -p .github/workflows

# Define the workflow file path
WORKFLOW_FILE=".github/workflows/pr-reading-time.yml"

# Check if workflow already exists
if [ -f "$WORKFLOW_FILE" ]; then
    echo "⚠️  Warning: $WORKFLOW_FILE already exists"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 1
    fi
fi

# Create the workflow file
cat > "$WORKFLOW_FILE" << 'EOF'
name: PR Reading Time

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  pull-requests: write

jobs:
  reading-time:
    runs-on: ubuntu-latest
    steps:
      - uses: micahstubbs/pr-reading-time@v1
EOF

echo "✅ Created $WORKFLOW_FILE"

# Ask about configuration options
echo ""
read -p "Do you want to post reading time as a comment instead of updating PR description? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat > "$WORKFLOW_FILE" << 'EOF'
name: PR Reading Time

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  pull-requests: write

jobs:
  reading-time:
    runs-on: ubuntu-latest
    steps:
      - uses: micahstubbs/pr-reading-time@v1
        with:
          comment-instead: 'true'
EOF
    echo "✅ Configured to post as comments"
fi

# Git status
echo ""
echo "📝 Changes made:"
git status --short

# Offer to commit
echo ""
read -p "Do you want to commit these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add "$WORKFLOW_FILE"
    git commit -m "Add PR Reading Time GitHub Action"
    echo "✅ Changes committed"

    # Offer to push
    if git remote get-url origin > /dev/null 2>&1; then
        echo ""
        read -p "Do you want to push to origin? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push
            echo "✅ Pushed to origin"
        fi
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "The PR Reading Time action will now:"
echo "  • Automatically calculate reading time for new PRs"
echo "  • Update when PRs are modified"
echo "  • Display estimates based on code complexity"
echo ""
echo "Next steps:"
echo "  1. Create a pull request to test the action"
echo "  2. Check the PR description for the reading time estimate"
echo "  3. Customize the configuration if needed"
echo ""
echo "For more options, see: https://github.com/micahstubbs/pr-reading-time"