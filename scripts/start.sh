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

# Create database tables if they don't exist
echo "📊 Creating database tables..."
npx prisma db push --accept-data-loss || {
    echo "⚠️  Database push failed, trying migrate deploy..."
    npx prisma migrate deploy --schema=./prisma/schema.prisma || {
        echo "❌ Database setup failed"
        exit 1
    }
}

echo "✅ Database tables created successfully"

# Seed the database with sample data (optional)
echo "🌱 Seeding database with sample data..."
npx prisma db seed || {
    echo "⚠️  Database seeding failed, but continuing..."
}

echo "🚀 Starting server..."
echo "📊 Server will be available on port: ${PORT:-8080}"
echo "📊 Health check will be available at: http://localhost:${PORT:-8080}/health"

# Start the server
exec npm start 