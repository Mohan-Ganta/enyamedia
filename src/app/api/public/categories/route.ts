import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const videosCollection = await getCollection(Collections.VIDEOS)

    const categories = await videosCollection.aggregate([
      {
        $match: {
          category: { $ne: null },
          status: 'READY',
          isPublic: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray()

    const transformedCategories = categories.map((cat: any) => ({
      name: cat._id,
      count: cat.count
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