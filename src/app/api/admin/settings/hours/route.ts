import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

const businessHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Невалиден формат на времето'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Невалиден формат на времето'),
  isOpen: z.boolean(),
  note: z.string().optional()
})

export async function GET() {
  try {
    const businessHours = await prisma.businessHours.findMany({
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json({ businessHours })
  } catch (error) {
    console.error('Error fetching business hours:', error)
    return NextResponse.json(
      { error: 'Грешка при зареждане на работното време' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = businessHoursSchema.parse(body)

    // Check if hours for this day already exist
    const existingHours = await prisma.businessHours.findUnique({
      where: { dayOfWeek: validatedData.dayOfWeek }
    })

    if (existingHours) {
      return NextResponse.json(
        { error: 'Вече има зададено работно време за този ден' },
        { status: 400 }
      )
    }

    const businessHours = await prisma.businessHours.create({
      data: {
        dayOfWeek: validatedData.dayOfWeek,
        openTime: validatedData.openTime,
        closeTime: validatedData.closeTime,
        isOpen: validatedData.isOpen,
        note: validatedData.note
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Работното време е създадено успешно!',
      businessHours 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating business hours:', error)
    return NextResponse.json(
      { error: 'Грешка при създаване на работното време' },
      { status: 500 }
    )
  }
}
