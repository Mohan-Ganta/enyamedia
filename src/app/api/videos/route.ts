import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { Video, User, Activity } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    
    const skip = (page - 1) * limit

    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)

    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (category) {
      filter.category = category
    }
    
    if (status) {
      filter.status = status
    }

    const [videos, total] = await Promise.all([
      videosCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray() as Promise<Video[]>,
      videosCollection.countDocuments(filter)
    ])

    // Get uploader information for each video
    const videosWithUploaders = await Promise.all(
      videos.map(async (video) => {
        const uploader = await usersCollection.findOne(
          { _id: video.uploadedBy },
          { projection: { _id: 1, name: 1, email: 1 } }
        ) as Pick<User, '_id' | 'name' | 'email'> | null

        return {
          ...video,
          _id: video._id!.toString(),
          uploadedBy: video.uploadedBy.toString(),
          uploader: uploader ? {
            id: uploader._id!.toString(),
            name: uploader.name,
            email: uploader.email
          } : null
        }
      })
    )

    return NextResponse.json({
      videos: videosWithUploaders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get videos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'ADMIN')
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('id')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    const videosCollection = await getCollection(Collections.VIDEOS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    const video = await videosCollection.findOne({
      _id: new ObjectId(videoId)
    }) as Video | null

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Update status to DELETED instead of actually deleting
    await videosCollection.updateOne(
      { _id: new ObjectId(videoId) },
      { 
        $set: { 
          status: 'DELETED',
          updatedAt: new Date()
        } 
      }
    )

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'VIDEO_DELETE',
      message: `Video deleted: ${video.title}`,
      userId: new ObjectId(user.userId),
      videoId: new ObjectId(videoId),
      createdAt: new Date()
    }

    await activitiesCollection.insertOne(activity)

    return NextResponse.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Delete video error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}