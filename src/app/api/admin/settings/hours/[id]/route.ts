import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const businessHoursUpdateSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Невалиден формат на времето'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Невалиден формат на времето'),
  isOpen: z.boolean(),
  note: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validatedData = businessHoursUpdateSchema.parse(body)

    // Check if business hours exist
    const existingHours = await prisma.businessHours.findUnique({
      where: { id: id }
    })

    if (!existingHours) {
      return NextResponse.json(
        { error: 'Работното време не е намерено' },
        { status: 404 }
      )
    }

    // Check if another day already has this dayOfWeek (if changing day)
    if (existingHours.dayOfWeek !== validatedData.dayOfWeek) {
      const conflictingHours = await prisma.businessHours.findUnique({
        where: { dayOfWeek: validatedData.dayOfWeek }
      })

      if (conflictingHours && conflictingHours.id !== id) {
        return NextResponse.json(
          { error: 'Вече има зададено работно време за този ден' },
          { status: 400 }
        )
      }
    }

    // Update business hours
    const updatedHours = await prisma.businessHours.update({
      where: { id: id },
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
      message: 'Работното време е обновено успешно!',
      businessHours: updatedHours 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating business hours:', error)
    return NextResponse.json(
      { error: 'Грешка при обновяване на работното време' },
      { status: 500 }
    )
  }
}
