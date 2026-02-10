import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { verifyPassword, generateToken } from '@/lib/auth'
import { User, Activity } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const usersCollection = await getCollection(Collections.USERS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    const user = await usersCollection.findOne({ email }) as User | null

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role
    })

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'USER_LOGIN',
      message: `User ${user.email} logged in`,
      userId: user._id,
      createdAt: new Date()
    }
    
    await activitiesCollection.insertOne(activity)

    const response = NextResponse.json({
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    })

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}