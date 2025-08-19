import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const menuItemSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  category: z.enum(['coffee', 'food', 'drink', 'dessert']),
  price: z.number().min(0, 'Цената не може да е отрицателна'),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  imageUrl: z.string().optional(),
  allergens: z.string().optional(),
  tags: z.string().optional()
})

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ menuItems })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Грешка при зареждане на менюто' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = menuItemSchema.parse(body)

    const menuItem = await prisma.menuItem.create({
      data: {
        name: validatedData.name,
        nameEn: validatedData.nameEn,
        description: validatedData.description,
        descriptionEn: validatedData.descriptionEn,
        category: validatedData.category,
        price: validatedData.price,
        isAvailable: validatedData.isAvailable,
        isFeatured: validatedData.isFeatured,
        imageUrl: validatedData.imageUrl,
        allergens: validatedData.allergens,
        tags: validatedData.tags
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Артикулът е създаден успешно!',
      menuItem 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Грешка при създаване на артикула' },
      { status: 500 }
    )
  }
}
