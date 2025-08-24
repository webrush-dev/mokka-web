import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

const eventUpdateSchema = z.object({
  title: z.string().min(1, 'Заглавието е задължително'),
  description: z.string().min(1, 'Описанието е задължително'),
  isTicketed: z.boolean(),
  sessions: z.array(z.object({
    start: z.string().min(1, 'Началното време е задължително'),
    end: z.string().min(1, 'Крайното време е задължително'),
    capacity: z.number().min(1, 'Капацитетът трябва да е поне 1')
  })).min(1, 'Поне една сесия е задължителна')
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validatedData = eventUpdateSchema.parse(body)

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: id },
      include: { sessions: true }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Събитието не е намерено' },
        { status: 404 }
      )
    }

    // Update event and sessions in a transaction
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // Update event
      const event = await tx.event.update({
        where: { id: id },
        data: {
          title: validatedData.title,
          description: validatedData.description,
          isTicketed: validatedData.isTicketed
        }
      })

      // Delete existing sessions
      await tx.eventSession.deleteMany({
        where: { eventId: id }
      })

      // Create new sessions
      const sessions = await Promise.all(
        validatedData.sessions.map(session => 
          tx.eventSession.create({
            data: {
              eventId: id,
              start: new Date(session.start),
              end: new Date(session.end),
              capacity: session.capacity,
              reserved: 0 // Reset reservations when updating
            }
          })
        )
      )

      return { ...event, sessions }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Събитието е обновено успешно!',
      event: updatedEvent 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Грешка при обновяване на събитието' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: id },
      include: { sessions: true }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Събитието не е намерено' },
        { status: 404 }
      )
    }

    // Check if there are any RSVPs for this event
    const rsvpCount = await prisma.rSVP.count({
      where: {
        session: {
          eventId: id
        }
      }
    })

    if (rsvpCount > 0) {
      return NextResponse.json(
        { error: 'Не може да изтриете събитие с активни резервации' },
        { status: 400 }
      )
    }

    // Delete event and sessions in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete sessions first
      await tx.eventSession.deleteMany({
        where: { eventId: id }
      })

      // Delete event
      await tx.event.delete({
        where: { id: id }
      })
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Събитието е изтрито успешно!' 
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Грешка при изтриване на събитието' },
      { status: 500 }
    )
  }
}
