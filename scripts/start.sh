#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting TOC Portal..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "📋 Available environment variables:"
    env | grep -E "(DATABASE_URL|SUPABASE|PORT|NODE_ENV)" || echo "No relevant env vars found"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Generate Prisma client first
echo "🔧 Generating Prisma client..."
npx prisma generate || {
    echo "❌ Prisma client generation failed"
    exit 1
}

echo "✅ Prisma client generated successfully"

# Try to run migrations, but don't fail if they don't work
echo "📊 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma || {
    echo "⚠️  Database migrations failed, but continuing..."
    echo "💡 You may need to run migrations manually later"
}

echo "🚀 Starting server..."
echo "📊 Server will be available on port: ${PORT:-8080}"
echo "📊 Health check will be available at: http://localhost:${PORT:-8080}/health"

# Start the server
exec npm start 