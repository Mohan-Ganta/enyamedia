import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { User, Activity } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request, 'ADMIN')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    
    const skip = (page - 1) * limit

    const usersCollection = await getCollection(Collections.USERS)
    const videosCollection = await getCollection(Collections.VIDEOS)

    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role) {
      filter.role = role
    }

    const [users, total] = await Promise.all([
      usersCollection
        .find(filter, { projection: { password: 0 } }) // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray() as Promise<User[]>,
      usersCollection.countDocuments(filter)
    ])

    // Get video count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const videoCount = await videosCollection.countDocuments({
          uploadedBy: user._id
        })

        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          _count: {
            videos: videoCount
          }
        }
      })
    )

    return NextResponse.json({
      users: usersWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    
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

export async function PUT(request: NextRequest) {
  try {
    const adminUser = await requireAuth(request, 'ADMIN')
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Only SUPER_ADMIN can change roles to ADMIN or SUPER_ADMIN
    if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const usersCollection = await getCollection(Collections.USERS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    // Update user role
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get updated user
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    ) as User | null

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'ADMIN_ACTION',
      message: `User role updated: ${user.email} -> ${role}`,
      userId: new ObjectId(adminUser.userId),
      metadata: JSON.stringify({ targetUserId: userId, newRole: role }),
      createdAt: new Date()
    }

    await activitiesCollection.insertOne(activity)

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
    console.error('Update user error:', error)
    
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