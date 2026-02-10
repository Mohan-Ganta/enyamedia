import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { Video, User } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)

    const filter: any = {
      status: 'READY',
      isPublic: true
    }
    
    if (category) {
      filter.category = category
    }

    const videos = await videosCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray() as Video[]

    // Get uploader information for each video
    const videosWithUploaders = await Promise.all(
      videos.map(async (video) => {
        const uploader = await usersCollection.findOne(
          { _id: video.uploadedBy },
          { projection: { name: 1 } }
        ) as Pick<User, 'name'> | null

        return {
          id: video._id!.toString(),
          title: video.title,
          imageUrl: video.thumbnail || '/placeholder-video.svg',
          year: new Date(video.createdAt).getFullYear().toString(),
          genre: video.category || 'Video',
          duration: video.duration ? `${Math.floor(video.duration / 60)}m` : 'N/A',
          description: video.description,
          views: video.views,
          likes: video.likes,
          uploader: uploader?.name || 'Unknown',
          createdAt: video.createdAt.toISOString(),
          isFeatured: video.isFeatured
        }
      })
    )

    return NextResponse.json({ videos: videosWithUploaders })
  } catch (error) {
    console.error('Get public videos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}