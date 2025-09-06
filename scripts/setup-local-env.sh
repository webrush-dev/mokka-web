#!/bin/bash

# Setup script for local development environment
echo "🔧 Setting up local development environment..."

# Create .env.local file
cat > .env.local << 'EOF'
# Database Configuration
# For local development, use SQLite
DATABASE_URL="file:./prisma/dev.db"

# For production, use PostgreSQL (uncomment when deploying)
# DATABASE_URL="postgres://54f3c59125607477e14cc465b3f1bf4a435fbdab0e3f9a18a3a82ad8db5222fd:sk_LdLoI_TArGKGdIEIK-X2Y@db.prisma.io:5432/?sslmode=require"

# Prisma Accelerate (for production only)
# PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19MZExvSV9UQXJHS0dkSUVJSy1YMlkiLCJhcGlfa2V5IjoiMDFLM0UzV1BESEVEQkdNM0daS1pKUkRXSjMiLCJ0ZW5hbnRfaWQiOiI1NGYzYzU5MTI1NjA3NDc3ZTE0Y2M0NjViM2YxYmY0YTQzNWZiZGFiMGUzZjlhMThhM2E4MmFkOGRiNTIyMmZkIiwiaW50ZXJuYWxfc2VjcmV0IjoiZDUzOGIzZTQtNjMyYy00OWI2LWE0NDItNTY2ZTQ1YjY2MDkxIn0.9m9YoPHW5HOD9Dei7FZy9hs9MBO2Fa0CsUqrfZbAdxw"

# Next.js Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_ENV="dev"
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
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="mokka2025"
EOF

echo "✅ Created .env.local file"

# Copy SQLite schema as the main schema
cp prisma/schema.sqlite.prisma prisma/schema.prisma
echo "✅ Switched to SQLite schema for local development"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Push the schema to create the database
echo "🔄 Creating local SQLite database..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

echo "🎉 Local development environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit http://localhost:3000 to see your app"
echo "3. Visit http://localhost:3000/admin to access the admin panel"
echo ""
echo "💡 To switch back to PostgreSQL for production:"
echo "1. Uncomment the PostgreSQL DATABASE_URL in .env.local"
echo "2. Copy prisma/schema.postgresql.prisma to prisma/schema.prisma"
echo "3. Run 'npx prisma generate && npx prisma db push'"
