#!/bin/bash

# Deployment script for Mokka Web
# This script helps switch between development (SQLite) and production (PostgreSQL) schemas

set -e

echo "🚀 Mokka Web Deployment Script"
echo "================================"

# Check if we're deploying to production
if [ "$1" = "production" ]; then
    echo "📦 Deploying to PRODUCTION (PostgreSQL)"
    
    # Copy PostgreSQL schema
    cp prisma/schema.postgresql.prisma prisma/schema.prisma
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client for PostgreSQL..."
    npx prisma generate
    
    echo "✅ Production schema ready!"
    echo "📝 IMPORTANT: Update your .env file to use PostgreSQL:"
    echo "   DATABASE_URL=\"postgres://your-connection-string\""
    echo ""
    echo "🔗 Your Vercel PostgreSQL connection string:"
    echo "   postgres://a7c9dff08e91abd5816750a81cbfa990f8cb1c8d164864ee51b2fdd05294a28f:sk_QkfNqtO7bdJAXZmisJW_e@db.prisma.io:5432/?sslmode=require"
    
elif [ "$1" = "development" ]; then
    echo "🛠️  Switching to DEVELOPMENT (SQLite)"
    
    # Copy SQLite schema
    cp prisma/schema.sqlite.prisma prisma/schema.prisma
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client for SQLite..."
    npx prisma generate
    
    echo "✅ Development schema ready!"
    echo "📝 Update your .env file to use SQLite:"
    echo "   DATABASE_URL=\"file:./dev.db\""
    
else
    echo "❌ Usage: $0 [development|production]"
    echo ""
    echo "Examples:"
    echo "  $0 development  # Switch to SQLite for local development"
    echo "  $0 production   # Switch to PostgreSQL for Vercel deployment"
    echo ""
    echo "Current schema:"
    if grep -q "provider = \"postgresql\"" prisma/schema.prisma; then
        echo "  🐘 PostgreSQL (Production)"
    else
        echo "  💾 SQLite (Development)"
    fi
    echo ""
    echo "Current DATABASE_URL:"
    if [ -f .env ]; then
        echo "  📁 .env: $(grep DATABASE_URL .env | cut -d'=' -f2-)"
    fi
    if [ -f .env.local ]; then
        echo "  📁 .env.local: $(grep DATABASE_URL .env.local | cut -d'=' -f2-)"
    fi
    exit 1
fi

echo ""
echo "🎯 Next steps:"
if [ "$1" = "production" ]; then
    echo "  1. Update .env with PostgreSQL connection string"
    echo "  2. Run: npx prisma db push (to sync schema)"
    echo "  3. Deploy to Vercel: vercel --prod"
else
    echo "  1. Update .env with SQLite path: file:./dev.db"
    echo "  2. Your local development is ready"
    echo "  3. Run: npm run dev"
fi
