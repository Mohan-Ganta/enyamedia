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
    const { platform } = await request.json()
    
    const videosCollection = await getCollection(Collections.VIDEOS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)
    
    // Check if video exists
    const video = await videosCollection.findOne({ _id: new ObjectId(id) })
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    
    // Generate share URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const videoUrl = `${baseUrl}/watch/${id}`
    const title = encodeURIComponent(video.title)
    const description = encodeURIComponent(video.description || 'Watch this amazing video on EnyaMedia')
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${encodeURIComponent(videoUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(videoUrl)}&title=${title}`,
      copy: videoUrl
    }
    
    // Log share activity
    const activity = {
      type: 'VIDEO_SHARE',
      message: `Shared video: ${video.title} on ${platform || 'unknown platform'}`,
      userId: new ObjectId(user.userId),
      videoId: new ObjectId(id),
      metadata: JSON.stringify({ platform, shareUrl: shareUrls[platform as keyof typeof shareUrls] || videoUrl }),
      createdAt: new Date()
    }
    
    await activitiesCollection.insertOne(activity)
    
    return NextResponse.json({
      shareUrls,
      message: 'Share URLs generated successfully'
    })
  } catch (error) {
    console.error('Share video error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Please login to share videos' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}