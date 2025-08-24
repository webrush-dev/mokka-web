# 🚀 Mokka Web Deployment Guide

## 📋 Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres or external)

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Choose a plan (Hobby is free)
4. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option 2: External PostgreSQL (Supabase/Neon)
1. Create a database on [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Get your connection string
3. Add it to Vercel environment variables as `DATABASE_URL`

## 🚀 Deployment Steps

### 1. Set Production Environment
```bash
./scripts/set-env.sh production
```

### 2. Switch to Production Schema
```bash
./scripts/deploy.sh production
```

### 3. Sync Database Schema
```bash
npx prisma db push
```

### 4. Deploy to Vercel
```bash
vercel --prod
```

## 🔄 Switching Between Environments

### For Production/Testing:
```bash
# Set PostgreSQL environment
./scripts/set-env.sh production

# Switch to PostgreSQL schema
./scripts/deploy.sh production

# Sync database
npx prisma db push
```

### For Local Development:
```bash
# Set SQLite environment
./scripts/set-env.sh development

# Switch to SQLite schema
./scripts/deploy.sh development

# Start development server
npm run dev
```

## 📝 Environment Variables

### Development (.env)
```
DATABASE_URL="file:./dev.db"
```

### Production (.env)
```
DATABASE_URL="postgres://username:password@host:port/database"
```

### Your Vercel PostgreSQL Connection:
```
DATABASE_URL="postgres://a7c9dff08e91abd5816750a81cbfa990f8cb1c8d164864ee51b2fdd05294a28f:sk_QkfNqtO7bdJAXZmisJW_e@db.prisma.io:5432/?sslmode=require"
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is set correctly in your `.env` file
- Check that you're using the right schema (PostgreSQL vs SQLite)
- Verify the database is accessible from your location

### Schema Mismatch
- Run `./scripts/deploy.sh production` before deploying
- Ensure you're using the correct schema for your environment
- Check that `npx prisma db push` completed successfully

### Build Errors
- Check that all dependencies are installed
- Ensure Prisma client is generated: `npx prisma generate`
- Verify environment variables are loaded correctly

### Environment File Priority
- `.env` has higher priority than `.env.local` in Next.js
- Use `./scripts/set-env.sh` to manage environment files
- Always check which `.env` file is being loaded

## 📚 Useful Commands

```bash
# Environment Management
./scripts/set-env.sh production    # Switch to PostgreSQL
./scripts/set-env.sh development   # Switch to SQLite

# Schema Management
./scripts/deploy.sh production     # Switch to PostgreSQL schema
./scripts/deploy.sh development    # Switch to SQLite schema

# Database Operations
npx prisma generate                # Generate Prisma client
npx prisma db push                 # Push database schema
npx prisma studio                  # View database

# Development
npm run dev                        # Start development server
npm run build                      # Build for production
```

## 🎯 Quick Deployment Checklist

- [ ] Run `./scripts/set-env.sh production`
- [ ] Run `./scripts/deploy.sh production`
- [ ] Run `npx prisma db push`
- [ ] Test locally: `npm run dev`
- [ ] Deploy: `vercel --prod`
- [ ] Verify live site works correctly
