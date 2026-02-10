import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all unique categories from public videos
    const categories = await prisma.video.groupBy({
      by: ['category'],
      where: {
        status: 'READY',
        isPublic: true,
        category: { not: null }
      },
      _count: {
        category: true
      }
    })

    const transformedCategories = categories.map((cat: any) => ({
      name: cat.category,
      count: cat._count.category
    }))

    return NextResponse.json({ categories: transformedCategories })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}