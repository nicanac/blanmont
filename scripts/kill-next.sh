#!/bin/bash

# Script to kill all running Node.js and Next.js processes
# Useful when the dev server lock file prevents starting a new instance

echo "Cleaning up local development environment..."

# Kill all node processes (including Next.js)
echo "Stopping all Node.js processes..."
taskkill //F //IM node.exe //T 2>/dev/null || true

# Remove Next.js dev lock if it exists
if [ -f ".next/dev/lock" ]; then
    echo "Removing .next/dev/lock..."
    rm -f .next/dev/lock
fi

echo "✓ All processes terminated and environment cleaned."
