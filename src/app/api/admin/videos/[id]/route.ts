import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { Video, User, Activity } from '@/lib/types'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)

    const video = await videosCollection.findOne({
      _id: new ObjectId(id)
    }) as Video | null

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Get uploader information
    const uploader = await usersCollection.findOne(
      { _id: video.uploadedBy },
      { projection: { name: 1, email: 1 } }
    ) as Pick<User, 'name' | 'email'> | null

    const videoWithUploader = {
      ...video,
      _id: video._id!.toString(),
      uploadedBy: video.uploadedBy.toString(),
      uploader: uploader ? {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, isPublic, isFeatured } = body

    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    // Check if video exists
    const existingVideo = await videosCollection.findOne({
      _id: new ObjectId(id)
    }) as Video | null

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Update video
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured

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
      { projection: { name: 1, email: 1 } }
    ) as Pick<User, 'name' | 'email'> | null

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'VIDEO_UPDATED',
      message: `Video "${updatedVideo.title}" was updated`,
      userId: new ObjectId(decoded.userId),
      videoId: new ObjectId(id),
      createdAt: new Date()
    }

    await activitiesCollection.insertOne(activity)

    const videoWithUploader = {
      ...updatedVideo,
      _id: updatedVideo._id!.toString(),
      uploadedBy: updatedVideo.uploadedBy.toString(),
      uploader: uploader ? {
        name: uploader.name,
        email: uploader.email
      } : null
    }

    return NextResponse.json({ video: videoWithUploader })
  } catch (error) {
    console.error('Update video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const videosCollection = await getCollection(Collections.VIDEOS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    // Check if video exists
    const existingVideo = await videosCollection.findOne({
      _id: new ObjectId(id)
    }) as Video | null

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Delete video files
    try {
      if (existingVideo.filename) {
        const videoPath = path.join(process.cwd(), 'public', 'uploads', existingVideo.filename)
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath)
        }
      }

      if (existingVideo.thumbnail) {
        const thumbnailPath = path.join(process.cwd(), 'public', existingVideo.thumbnail)
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath)
        }
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete video from database
    await videosCollection.deleteOne({
      _id: new ObjectId(id)
    })

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'VIDEO_DELETED',
      message: `Video "${existingVideo.title}" was deleted`,
      userId: new ObjectId(decoded.userId),
      createdAt: new Date()
    }

    await activitiesCollection.insertOne(activity)

    return NextResponse.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}