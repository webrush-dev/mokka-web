import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to parse JSON tags
export function parseTags(tags: string): string[] {
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

// Helper function to stringify tags
export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags)
}

// Helper function to parse origin badges
export function parseOriginBadges(badges: string): string[] {
  try {
    return JSON.parse(badges)
  } catch {
    return []
  }
}

// Helper function to stringify origin badges
export function stringifyOriginBadges(badges: string[]): string {
  return JSON.stringify(badges)
}
