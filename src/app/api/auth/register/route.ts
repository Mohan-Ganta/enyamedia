import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { hashPassword, generateToken } from '@/lib/auth'
import { User, Activity } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'USER' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const usersCollection = await getCollection(Collections.USERS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email }) as User | null

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const userData: Omit<User, '_id'> = {
      email,
      password: hashedPassword,
      name,
      role: role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await usersCollection.insertOne(userData)
    const userId = result.insertedId

    const token = generateToken({
      userId: userId.toString(),
      email,
      role
    })

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'USER_REGISTER',
      message: `New user registered: ${email}`,
      userId,
      createdAt: new Date()
    }
    
    await activitiesCollection.insertOne(activity)

    const response = NextResponse.json({
      user: {
        id: userId.toString(),
        email,
        name,
        role
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}