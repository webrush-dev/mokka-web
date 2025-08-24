import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  action: z.enum(['cancel', 'modify']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifySchema.parse(body)

    // Check if user has any RSVPs
    const userRSVPs = await prisma.rSVP.findMany({
      where: { email: validatedData.email },
      include: {
        session: {
          include: { event: true }
        }
      }
    })

    if (userRSVPs.length === 0) {
      return NextResponse.json(
        { error: 'Няма намерени резервации за този имейл' },
        { status: 404 }
      )
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store the verification code with expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    
    // For now, we'll store it in a simple way. In production, you'd use Redis or similar
    // For demo purposes, we'll create a simple verification record
    await prisma.verificationCode.upsert({
      where: { email: validatedData.email },
      update: {
        code: verificationCode,
        expiresAt,
        action: validatedData.action || 'modify'
      },
      create: {
        email: validatedData.email,
        code: verificationCode,
        expiresAt,
        action: validatedData.action || 'modify'
      }
    })

    // TODO: Send email with verification code via Resend
    // For now, we'll return the code in the response (remove this in production)
    console.log(`Verification code for ${validatedData.email}: ${verificationCode}`)

    return NextResponse.json({
      success: true,
      message: 'Код за потвърждение е изпратен на вашия имейл',
      // Remove this in production - only for testing
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
    })

  } catch (error) {
    console.error('Verification code generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Възникна грешка при генерирането на кода' },
      { status: 500 }
    )
  }
}
