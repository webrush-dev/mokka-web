import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const holidayUpdateSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  nameEn: z.string().optional(),
  date: z.string().min(1, 'Датата е задължителна'),
  isClosed: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  note: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validatedData = holidayUpdateSchema.parse(body)

    // Check if holiday exists
    const existingHoliday = await prisma.holiday.findUnique({
      where: { id: id }
    })

    if (!existingHoliday) {
      return NextResponse.json(
        { error: 'Празникът не е намерен' },
        { status: 404 }
      )
    }

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

    // Check if another holiday already has this date (if changing date)
    if (existingHoliday.date.toISOString().split('T')[0] !== validatedData.date) {
      const conflictingHoliday = await prisma.holiday.findFirst({
        where: { 
          date: new Date(validatedData.date),
          id: { not: id }
        }
      })

      if (conflictingHoliday) {
        return NextResponse.json(
          { error: 'Вече има зададен празник за тази дата' },
          { status: 400 }
        )
      }
    }

    // Update holiday
    const updatedHoliday = await prisma.holiday.update({
      where: { id: id },
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
      message: 'Празникът е обновен успешно!',
      holiday: updatedHoliday 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating holiday:', error)
    return NextResponse.json(
      { error: 'Грешка при обновяване на празника' },
      { status: 500 }
    )
  }
}
