import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const holidaySchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  nameEn: z.string().optional(),
  date: z.string().min(1, 'Датата е задължителна'),
  isClosed: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  note: z.string().optional()
})

export async function GET() {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ holidays })
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json(
      { error: 'Грешка при зареждане на празниците' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = holidaySchema.parse(body)

    // Validate time format if provided
    if (validatedData.openTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(validatedData.openTime)) {
      return NextResponse.json(
        { error: 'Невалиден формат на началното време' },
        { status: 400 }
      )
    }

    if (validatedData.closeTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(validatedData.closeTime)) {
      return NextResponse.json(
        { error: 'Невалиден формат на крайното време' },
        { status: 400 }
      )
    }

    // Check if holiday for this date already exists
    const existingHoliday = await prisma.holiday.findFirst({
      where: { date: new Date(validatedData.date) }
    })

    if (existingHoliday) {
      return NextResponse.json(
        { error: 'Вече има зададен празник за тази дата' },
        { status: 400 }
      )
    }

    const holiday = await prisma.holiday.create({
      data: {
        name: validatedData.name,
        nameEn: validatedData.nameEn,
        date: new Date(validatedData.date),
        isClosed: validatedData.isClosed,
        openTime: validatedData.openTime,
        closeTime: validatedData.closeTime,
        note: validatedData.note
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Празникът е създаден успешно!',
      holiday 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating holiday:', error)
    return NextResponse.json(
      { error: 'Грешка при създаване на празника' },
      { status: 500 }
    )
  }
}
