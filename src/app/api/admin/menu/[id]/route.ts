import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const menuItemUpdateSchema = z.object({
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validatedData = menuItemUpdateSchema.parse(body)

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Артикулът не е намерен' },
        { status: 404 }
      )
    }

    // Update menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id: id },
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
      message: 'Артикулът е обновен успешно!',
      menuItem: updatedItem 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Грешка при обновяване на артикула' },
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
    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Артикулът не е намерен' },
        { status: 404 }
      )
    }

    // Delete menu item
    await prisma.menuItem.delete({
      where: { id: id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Артикулът е изтрит успешно!' 
    })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Грешка при изтриване на артикула' },
      { status: 500 }
    )
  }
}
