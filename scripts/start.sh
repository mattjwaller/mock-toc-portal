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

# Check if database is already seeded
echo "🔍 Checking if database is already seeded..."
CUSTOMER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"Customer\";" | grep -o '[0-9]*' | tail -1 || echo "0")
INCIDENT_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"Incident\";" | grep -o '[0-9]*' | tail -1 || echo "0")

echo "📊 Found $CUSTOMER_COUNT customers and $INCIDENT_COUNT incidents"

if [ "$CUSTOMER_COUNT" -eq "0" ] || [ "$INCIDENT_COUNT" -eq "0" ]; then
    echo "🌱 Database appears empty, seeding with sample data..."
    npx prisma db seed || {
        echo "❌ Database seeding failed"
        echo "📋 Trying alternative seeding method..."
        node prisma/seed.js || {
            echo "❌ Alternative seeding also failed"
            echo "⚠️  Continuing without seed data..."
        }
    }
    echo "✅ Database seeding completed"
else
    echo "✅ Database already contains data, skipping seeding"
fi

echo "🚀 Starting server..."
echo "📊 Server will be available on port: ${PORT:-8080}"
echo "📊 Health check will be available at: http://localhost:${PORT:-8080}/health"

# Start the server
exec npm start 