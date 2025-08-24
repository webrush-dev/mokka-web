#!/bin/bash

# Environment management script for Mokka Web
# This script helps switch between development and production environment variables

set -e

echo "🌍 Mokka Web Environment Manager"
echo "================================="

if [ "$1" = "production" ]; then
    echo "📦 Setting up PRODUCTION environment (PostgreSQL)"
    
    # Update .env with PostgreSQL connection
    echo 'DATABASE_URL="postgres://a7c9dff08e91abd5816750a81cbfa990f8cb1c8d164864ee51b2fdd05294a28f:sk_QkfNqtO7bdJAXZmisJW_e@db.prisma.io:5432/?sslmode=require"' > .env
    
    echo "✅ Production environment set!"
    echo "📝 .env updated with PostgreSQL connection string"
    echo ""
    echo "🎯 Next steps:"
    echo "  1. Run: ./scripts/deploy.sh production"
    echo "  2. Run: npx prisma db push"
    echo "  3. Test locally or deploy to Vercel"
    
elif [ "$1" = "development" ]; then
    echo "🛠️  Setting up DEVELOPMENT environment (SQLite)"
    
    # Update .env with SQLite connection
    echo 'DATABASE_URL="file:./dev.db"' > .env
    
    echo "✅ Development environment set!"
    echo "📝 .env updated with SQLite path"
    echo ""
    echo "🎯 Next steps:"
    echo "  1. Run: ./scripts/deploy.sh development"
    echo "  2. Your local development is ready"
    echo "  3. Run: npm run dev"
    
else
    echo "❌ Usage: $0 [development|production]"
    echo ""
    echo "Examples:"
    echo "  $0 development  # Switch to SQLite for local development"
    echo "  $0 production   # Switch to PostgreSQL for production/Vercel"
    echo ""
    echo "Current environment:"
    if [ -f .env ]; then
        echo "  📁 .env: $(grep DATABASE_URL .env | cut -d'=' -f2-)"
    fi
    exit 1
fi
