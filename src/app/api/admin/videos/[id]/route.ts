import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Get video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, isPublic, isFeatured } = body

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    })

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Update video
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'VIDEO_UPDATED',
        message: `Video "${updatedVideo.title}" was updated`,
        userId: decoded.userId,
        videoId: updatedVideo.id
      }
    })

    return NextResponse.json({ video: updatedVideo })
  } catch (error) {
    console.error('Update video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    })

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Delete video files
    try {
      if (existingVideo.filename) {
        const videoPath = path.join(process.cwd(), 'public', 'uploads', existingVideo.filename)
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath)
        }
      }

      if (existingVideo.thumbnail) {
        const thumbnailPath = path.join(process.cwd(), 'public', existingVideo.thumbnail)
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath)
        }
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete video from database
    await prisma.video.delete({
      where: { id }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'VIDEO_DELETED',
        message: `Video "${existingVideo.title}" was deleted`,
        userId: decoded.userId
      }
    })

    return NextResponse.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}