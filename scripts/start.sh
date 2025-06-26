#!/bin/bash

echo "🚀 Starting TOC Portal..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📊 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo "🚀 Starting server..."
npm start 