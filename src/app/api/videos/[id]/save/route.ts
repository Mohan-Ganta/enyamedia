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
    
    // Check if user already saved this video
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(user.userId) })
    const savedVideos = userDoc?.savedVideos || []
    const hasSaved = savedVideos.includes(id)
    
    if (hasSaved) {
      // Remove from saved videos
      await usersCollection.updateOne(
        { _id: new ObjectId(user.userId) },
        { $pull: { savedVideos: id } as any }
      )
      
      return NextResponse.json({ saved: false, message: 'Video removed from saved list' })
    } else {
      // Add to saved videos
      await usersCollection.updateOne(
        { _id: new ObjectId(user.userId) },
        { $addToSet: { savedVideos: id } }
      )
      
      return NextResponse.json({ saved: true, message: 'Video saved successfully' })
    }
  } catch (error) {
    console.error('Save video error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Please login to save videos' }, { status: 401 })
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
    const savedVideos = userDoc?.savedVideos || []
    
    return NextResponse.json({ saved: savedVideos.includes(id) })
  } catch (error) {
    return NextResponse.json({ saved: false })
  }
}