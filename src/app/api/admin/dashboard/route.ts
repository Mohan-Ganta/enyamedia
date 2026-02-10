import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request, 'ADMIN')

    // Get dashboard statistics
    const [
      totalVideos,
      totalUsers,
      recentActivities,
      videosByStatus,
      videosByCategory,
      recentUploads
    ] = await Promise.all([
      // Total videos count
      prisma.video.count(),
      
      // Total users count
      prisma.user.count(),
      
      // Recent activities
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          video: {
            select: { title: true }
          }
        }
      }),
      
      // Videos by status
      prisma.video.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Videos by category
      prisma.video.groupBy({
        by: ['category'],
        _count: { category: true },
        where: {
          category: { not: null }
        }
      }),
      
      // Recent uploads
      prisma.video.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: { name: true, email: true }
          }
        }
      })
    ])

    // Calculate storage usage
    const storageUsage = await prisma.video.aggregate({
      _sum: { size: true }
    })

    // Get upload trends (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const uploadTrends = await prisma.video.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    })

    return NextResponse.json({
      stats: {
        totalVideos,
        totalUsers,
        totalStorage: storageUsage._sum.size || 0,
        activeUploads: videosByStatus.find((s: any) => s.status === 'PROCESSING')?._count.status || 0
      },
      videosByStatus: videosByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      videosByCategory: videosByCategory.map(item => ({
        category: item.category,
        count: item._count.category
      })),
      recentActivities,
      recentUploads,
      uploadTrends: uploadTrends.map(item => ({
        date: item.createdAt,
        count: item._count.id
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