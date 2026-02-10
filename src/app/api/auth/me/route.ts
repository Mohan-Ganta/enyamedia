import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { User } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const usersCollection = await getCollection(Collections.USERS)
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(payload.userId) },
      { 
        projection: { 
          password: 0 // Exclude password from response
        } 
      }
    ) as User | null

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}