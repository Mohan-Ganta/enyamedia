import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { Video, User } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)

    const videos = await videosCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray() as Video[]

    // Get uploader information for each video
    const videosWithUploaders = await Promise.all(
      videos.map(async (video) => {
        const uploader = await usersCollection.findOne(
          { _id: video.uploadedBy },
          { projection: { name: 1, email: 1 } }
        ) as Pick<User, 'name' | 'email'> | null

        return {
          ...video,
          _id: video._id!.toString(),
          uploadedBy: video.uploadedBy.toString(),
          uploader: uploader ? {
            name: uploader.name,
            email: uploader.email
          } : null
        }
      })
    )

    return NextResponse.json({ videos: videosWithUploaders })
  } catch (error) {
    console.error('Get admin videos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}