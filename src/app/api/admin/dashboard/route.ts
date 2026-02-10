import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request, 'ADMIN')

    const usersCollection = await getCollection(Collections.USERS)
    const videosCollection = await getCollection(Collections.VIDEOS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    // Get dashboard statistics
    const [
      totalVideos,
      totalUsers,
      storageUsage,
      videosByStatus,
      videosByCategory,
      recentActivities,
      recentUploads,
      uploadTrends
    ] = await Promise.all([
      // Total videos count
      videosCollection.countDocuments(),
      
      // Total users count
      usersCollection.countDocuments(),
      
      // Total storage usage
      videosCollection.aggregate([
        {
          $group: {
            _id: null,
            totalSize: { $sum: '$size' }
          }
        }
      ]).toArray(),
      
      // Videos by status
      videosCollection.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Videos by category
      videosCollection.aggregate([
        {
          $match: { category: { $ne: null } }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Recent activities (last 10)
      activitiesCollection.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),
      
      // Recent uploads (last 5)
      videosCollection.aggregate([
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'users',
            localField: 'uploadedBy',
            foreignField: '_id',
            as: 'uploader'
          }
        },
        {
          $unwind: {
            path: '$uploader',
            preserveNullAndEmptyArrays: true
          }
        }
      ]).toArray(),
      
      // Upload trends (last 7 days)
      videosCollection.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).toArray()
    ])

    const totalStorage = storageUsage[0]?.totalSize || 0
    const activeUploads = videosByStatus.find((item: any) => item._id === 'PROCESSING')?.count || 0

    return NextResponse.json({
      stats: {
        totalVideos,
        totalUsers,
        totalStorage,
        activeUploads
      },
      videosByStatus: videosByStatus.map((item: any) => ({
        status: item._id,
        count: item.count
      })),
      videosByCategory: videosByCategory.map((item: any) => ({
        category: item._id,
        count: item.count
      })),
      recentActivities: recentActivities.map((activity: any) => ({
        ...activity,
        _id: activity._id.toString(),
        userId: activity.userId?.toString(),
        videoId: activity.videoId?.toString()
      })),
      recentUploads: recentUploads.map((video: any) => ({
        ...video,
        _id: video._id.toString(),
        uploadedBy: video.uploadedBy.toString(),
        uploader: video.uploader ? {
          name: video.uploader.name,
          email: video.uploader.email
        } : null
      })),
      uploadTrends: uploadTrends.map((item: any) => ({
        date: item._id,
        count: item.count
      }))
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    
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