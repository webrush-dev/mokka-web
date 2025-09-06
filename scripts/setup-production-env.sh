#!/bin/bash

# Setup script for production environment
echo "🚀 Setting up production environment..."

# Create .env.local file for production
cat > .env.local << 'EOF'
# Database Configuration
# For production, use PostgreSQL
DATABASE_URL="postgres://54f3c59125607477e14cc465b3f1bf4a435fbdab0e3f9a18a3a82ad8db5222fd:sk_LdLoI_TArGKGdIEIK-X2Y@db.prisma.io:5432/?sslmode=require"

# Prisma Accelerate (for production)
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19MZExvSV9UQXJHS0dkSUVJSy1YMlkiLCJhcGlfa2V5IjoiMDFLM0UzV1BESEVEQkdNM0daS1pKUkRXSjMiLCJ0ZW5hbnRfaWQiOiI1NGYzYzU5MTI1NjA3NDc3ZTE0Y2M0NjViM2YxYmY0YTQzNWZiZGFiMGUzZjlhMThhM2E4MmFkOGRiNTIyMmZkIiwiaW50ZXJuYWxfc2VjcmV0IjoiZDUzOGIzZTQtNjMyYy00OWI2LWE0NDItNTY2ZTQ1YjY2MDkxIn0.9m9YoPHW5HOD9Dei7FZy9hs9MBO2Fa0CsUqrfZbAdxw"

# Next.js Configuration
NEXT_PUBLIC_SITE_URL="https://mokka.cafe"
NEXT_PUBLIC_ENV="prod"
NEXT_PUBLIC_DEFAULT_LOCALE="bg"
NEXT_PUBLIC_LAUNCH_SWITCH_ISO="2025-09-01T00:01:00+03:00"

# Optional: Analytics (uncomment when ready)
# NEXT_PUBLIC_META_PIXEL_ID=""
# NEXT_PUBLIC_GA4_ID=""

# Optional: Email service (uncomment when ready)
# RESEND_API_KEY=""

# Optional: Maps (uncomment when ready)
# NEXT_PUBLIC_MAPS_EMBED_URL=""

# Admin Configuration
ADMIN_EMAIL_WHITELIST="ivan@mokka.cafe,petar@mokka.cafe"

# Admin Authentication
ADMIN_USERNAME="mokka-2025"
ADMIN_PASSWORD="X5#ES5IN!V0d"
EOF

echo "✅ Created .env.local file for production"

# Copy PostgreSQL schema as the main schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma
echo "✅ Switched to PostgreSQL schema for production"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Push the schema to create the database
echo "🔄 Creating production PostgreSQL database..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

echo "🎉 Production environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm run build' to build for production"
echo "2. Deploy to Vercel or your preferred platform"
echo "3. Make sure to set the same environment variables in your deployment platform"
echo ""
echo "⚠️  Important: Make sure to add these environment variables to your Vercel deployment:"
echo "- DATABASE_URL"
echo "- PRISMA_DATABASE_URL"
echo "- ADMIN_EMAIL_WHITELIST"
echo "- ADMIN_USERNAME"
echo "- ADMIN_PASSWORD"
echo "- NEXT_PUBLIC_SITE_URL"
echo "- NEXT_PUBLIC_ENV"
