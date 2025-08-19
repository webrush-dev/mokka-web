import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: { key: 'asc' }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Грешка при зареждане на настройките' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, description } = body

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Ключът и стойността са задължителни' },
        { status: 400 }
      )
    }

    // Check if setting already exists
    const existingSetting = await prisma.settings.findUnique({
      where: { key }
    })

    if (existingSetting) {
      return NextResponse.json(
        { error: 'Настройката вече съществува' },
        { status: 400 }
      )
    }

    const setting = await prisma.settings.create({
      data: {
        key,
        value,
        description
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Настройката е създадена успешно!',
      setting 
    })
  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json(
      { error: 'Грешка при създаване на настройката' },
      { status: 500 }
    )
  }
}
