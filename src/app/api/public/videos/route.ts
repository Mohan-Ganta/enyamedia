import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      status: 'READY',
      isPublic: true
    }
    
    if (category) {
      where.category = category
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        uploader: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Transform to match the expected format
    const transformedVideos = videos.map((video: any) => ({
      id: video.id,
      title: video.title,
      imageUrl: video.thumbnail || '/placeholder-video.svg',
      year: new Date(video.createdAt).getFullYear().toString(),
      genre: video.category || 'Video',
      duration: video.duration ? `${Math.floor(video.duration / 60)}m` : 'N/A',
      description: video.description,
      views: video.views,
      likes: video.likes,
      uploader: video.uploader.name,
      createdAt: video.createdAt.toISOString(),
      isFeatured: video.isFeatured
    }))

    return NextResponse.json({ videos: transformedVideos })
  } catch (error) {
    console.error('Get public videos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}