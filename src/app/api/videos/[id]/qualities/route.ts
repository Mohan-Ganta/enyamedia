import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { Video } from '@/lib/types'
import { ObjectId } from 'mongodb'
import { VIDEO_QUALITIES } from '@/lib/video-processing'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const videosCollection = await getCollection(Collections.VIDEOS)
    
    // Get video from database
    const video = await videosCollection.findOne({
      _id: new ObjectId(id)
    }) as Video | null

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if video is public or user has access
    if (!video.isPublic) {
      return NextResponse.json(
        { error: 'Video is private' },
        { status: 403 }
      )
    }

    const baseUrl = `/api/videos/${id}/stream`  // Always use streaming API to avoid CORS
    const availableQualities = []

    // Add Auto quality (always available)
    availableQualities.push({
      label: 'Auto',
      height: 0,
      url: baseUrl,
      bitrate: 'adaptive'
    })

    // Check for different quality versions
    for (const quality of VIDEO_QUALITIES) {
      const qualityUrl = baseUrl.replace(/\.(mp4|webm|mov)$/i, `${quality.suffix}.$1`)
      
      try {
        // Check if quality version exists
        const response = await fetch(qualityUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        if (response.ok) {
          availableQualities.push({
            label: quality.label,
            height: quality.height,
            url: qualityUrl,
            bitrate: quality.bitrate
          })
        }
      } catch (error) {
        // Quality version doesn't exist or timeout, skip
        console.log(`Quality ${quality.label} not available for video ${id}`)
      }
    }

    // If no additional qualities found, add original
    if (availableQualities.length === 1) {
      availableQualities.push({
        label: 'Original',
        height: 1080, // Assume 1080p for original
        url: baseUrl,
        bitrate: 'original'
      })
    }

    return NextResponse.json({
      videoId: id,
      qualities: availableQualities,
      defaultQuality: availableQualities[1]?.label || 'Auto' // Skip Auto, get first actual quality
    })

  } catch (error) {
    console.error('Get video qualities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}