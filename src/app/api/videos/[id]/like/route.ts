import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    const videosCollection = await getCollection(Collections.VIDEOS)
    const usersCollection = await getCollection(Collections.USERS)
    
    // Check if video exists
    const video = await videosCollection.findOne({ _id: new ObjectId(id) })
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    
    // Check if user already liked this video
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(user.userId) })
    const likedVideos = userDoc?.likedVideos || []
    const hasLiked = likedVideos.includes(id)
    
    if (hasLiked) {
      // Unlike the video
      await usersCollection.updateOne(
        { _id: new ObjectId(user.userId) },
        { $pull: { likedVideos: id } as any }
      )
      await videosCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likes: -1 } }
      )
      
      return NextResponse.json({ liked: false, message: 'Video unliked' })
    } else {
      // Like the video
      await usersCollection.updateOne(
        { _id: new ObjectId(user.userId) },
        { $addToSet: { likedVideos: id } }
      )
      await videosCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } }
      )
      
      return NextResponse.json({ liked: true, message: 'Video liked' })
    }
  } catch (error) {
    console.error('Like video error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Please login to like videos' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    const usersCollection = await getCollection(Collections.USERS)
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(user.userId) })
    const likedVideos = userDoc?.likedVideos || []
    
    return NextResponse.json({ liked: likedVideos.includes(id) })
  } catch (error) {
    return NextResponse.json({ liked: false })
  }
}