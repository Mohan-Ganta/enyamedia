import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { Video } from '@/lib/types'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { ObjectId } from 'mongodb'
import { isS3Configured } from '@/lib/aws-s3'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  })
}

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

    // If using S3, proxy the video content to avoid CORS issues
    if (isS3Configured() && video.videoUrl) {
      try {
        // Fetch the video from S3
        const s3Response = await fetch(video.videoUrl, {
          headers: request.headers.get('range') ? {
            'Range': request.headers.get('range')!
          } : {}
        })

        if (!s3Response.ok) {
          throw new Error(`S3 fetch failed: ${s3Response.status}`)
        }

        // Get the response body
        const body = s3Response.body
        if (!body) {
          throw new Error('No response body from S3')
        }

        // Create response with proper headers
        const headers = new Headers()
        headers.set('Content-Type', video.mimeType)
        headers.set('Access-Control-Allow-Origin', '*')
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        headers.set('Access-Control-Allow-Headers', 'Range, Content-Type')
        headers.set('Cache-Control', 'public, max-age=3600')

        // Copy relevant headers from S3 response
        const contentLength = s3Response.headers.get('content-length')
        const contentRange = s3Response.headers.get('content-range')
        const acceptRanges = s3Response.headers.get('accept-ranges')

        if (contentLength) headers.set('Content-Length', contentLength)
        if (contentRange) headers.set('Content-Range', contentRange)
        if (acceptRanges) headers.set('Accept-Ranges', acceptRanges)

        return new NextResponse(body, {
          status: s3Response.status,
          headers
        })
      } catch (error) {
        console.error('S3 proxy error:', error)
        // Fall through to local file handling
      }
    }

    // Fallback to local file streaming (development only)
    const filePath = path.join(process.cwd(), 'public', 'uploads', video.filename)
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Video file not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Get range header for video streaming
    const range = request.headers.get('range')
    const fileSize = fileBuffer.length
    
    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = (end - start) + 1
      const chunk = fileBuffer.subarray(start, end + 1)
      
      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': video.mimeType,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range'
        }
      })
    } else {
      // Return full file
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': video.mimeType,
          'Content-Length': fileSize.toString(),
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range'
        }
      })
    }
  } catch (error) {
    console.error('Stream video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}