import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { Video, User, Activity } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)
    
    const video = await videosCollection.findOne({
      _id: new ObjectId(id)
    }) as Video | null

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Get uploader information
    const uploader = await usersCollection.findOne(
      { _id: video.uploadedBy },
      { projection: { _id: 1, name: 1, email: 1 } }
    ) as Pick<User, '_id' | 'name' | 'email'> | null

    // Increment view count
    await videosCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { views: 1 },
        $set: { updatedAt: new Date() }
      }
    )

    const videoWithUploader = {
      ...video,
      _id: video._id!.toString(),
      uploadedBy: video.uploadedBy.toString(),
      views: video.views + 1, // Return updated view count
      // Don't expose direct S3 URL to avoid CORS issues
      videoUrl: undefined,
      uploader: uploader ? {
        id: uploader._id!.toString(),
        name: uploader.name,
        email: uploader.email
      } : null
    }

    return NextResponse.json({ video: videoWithUploader })
  } catch (error) {
    console.error('Get video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const { title, description, category, tags, isPublic } = await request.json()

    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    const video = await videosCollection.findOne({
      _id: new ObjectId(id)
    }) as Video | null

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if user owns the video or is admin
    if (video.uploadedBy.toString() !== user.userId && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update video
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags
    if (isPublic !== undefined) updateData.isPublic = isPublic

    await videosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    // Get updated video with uploader info
    const updatedVideo = await videosCollection.findOne({
      _id: new ObjectId(id)
    }) as Video

    const uploader = await usersCollection.findOne(
      { _id: updatedVideo.uploadedBy },
      { projection: { _id: 1, name: 1, email: 1 } }
    ) as Pick<User, '_id' | 'name' | 'email'> | null

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'VIDEO_UPDATE',
      message: `Video updated: ${title || updatedVideo.title}`,
      userId: new ObjectId(user.userId),
      videoId: new ObjectId(id),
      createdAt: new Date()
    }

    await activitiesCollection.insertOne(activity)

    const videoWithUploader = {
      ...updatedVideo,
      _id: updatedVideo._id!.toString(),
      uploadedBy: updatedVideo.uploadedBy.toString(),
      // Don't expose direct S3 URL to avoid CORS issues
      videoUrl: undefined,
      uploader: uploader ? {
        id: uploader._id!.toString(),
        name: uploader.name,
        email: uploader.email
      } : null
    }

    return NextResponse.json({ video: videoWithUploader })
  } catch (error) {
    console.error('Update video error:', error)
    
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