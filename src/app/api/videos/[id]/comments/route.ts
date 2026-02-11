import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { ObjectId } from 'mongodb'

interface Comment {
  _id?: ObjectId
  videoId: ObjectId
  userId: ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
  likes: number
  replies?: Comment[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const commentsCollection = await getCollection(Collections.COMMENTS)
    const usersCollection = await getCollection(Collections.USERS)
    
    // Get comments for this video
    const comments = await commentsCollection
      .find({ videoId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as Comment[]
    
    // Get user information for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await usersCollection.findOne(
          { _id: comment.userId },
          { projection: { _id: 1, name: 1, email: 1 } }
        )
        
        return {
          id: comment._id!.toString(),
          content: comment.content,
          createdAt: comment.createdAt,
          likes: comment.likes || 0,
          user: user ? {
            id: user._id!.toString(),
            name: user.name,
            email: user.email
          } : null
        }
      })
    )
    
    const total = await commentsCollection.countDocuments({ videoId: new ObjectId(id) })
    
    return NextResponse.json({
      comments: commentsWithUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const { content } = await request.json()
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }
    
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 characters)' }, { status: 400 })
    }
    
    const videosCollection = await getCollection(Collections.VIDEOS)
    const commentsCollection = await getCollection(Collections.COMMENTS)
    const usersCollection = await getCollection(Collections.USERS)
    
    // Check if video exists
    const video = await videosCollection.findOne({ _id: new ObjectId(id) })
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    
    // Create comment
    const comment: Omit<Comment, '_id'> = {
      videoId: new ObjectId(id),
      userId: new ObjectId(user.userId),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0
    }
    
    const result = await commentsCollection.insertOne(comment)
    
    // Get user info for response
    const userInfo = await usersCollection.findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { _id: 1, name: 1, email: 1 } }
    )
    
    return NextResponse.json({
      comment: {
        id: result.insertedId.toString(),
        content: comment.content,
        createdAt: comment.createdAt,
        likes: 0,
        user: userInfo ? {
          id: userInfo._id!.toString(),
          name: userInfo.name,
          email: userInfo.email
        } : null
      }
    })
  } catch (error) {
    console.error('Create comment error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Please login to comment' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}