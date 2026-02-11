import { NextRequest, NextResponse } from 'next/server'
import { getCollection, Collections } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { saveFile, generateThumbnail, generateUniqueFilename, isValidVideoFile } from '@/lib/upload'
import { Video, Activity } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request)
    
    const formData = await request.formData()
    const file = formData.get('video') as File
    const coverImageFile = formData.get('coverImage') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string || ''
    const category = formData.get('category') as string || ''
    const tags = formData.get('tags') as string || ''
    const isPublic = formData.get('isPublic') === 'true'
    const isFeatured = formData.get('isFeatured') === 'true'

    console.log('Upload request received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      title,
      category,
      isPublic,
      isFeatured,
      hasCoverImage: !!coverImageFile
    })

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    if (!file.name) {
      return NextResponse.json(
        { error: 'Invalid file: missing filename' },
        { status: 400 }
      )
    }

    if (!file.size || file.size === 0) {
      return NextResponse.json(
        { error: 'Invalid file: file is empty' },
        { status: 400 }
      )
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!isValidVideoFile(file)) {
      return NextResponse.json(
        { error: `Invalid video file type: ${file.type}. Supported formats: MP4, MPEG, MOV, AVI, WebM` },
        { status: 400 }
      )
    }

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    console.log('Generated filename:', filename)
    
    // Save the video file
    const videoResult = await saveFile(file, filename, undefined, user.userId)
    console.log('File saved to:', videoResult.url)
    
    let thumbnailResult: { url: string; s3Key?: string } = { url: '', s3Key: undefined }
    
    // Handle cover image or generate thumbnail
    if (coverImageFile && coverImageFile.size > 0) {
      // Save custom cover image
      const coverImageName = filename.replace(/\.[^/.]+$/, '_cover.jpg')
      thumbnailResult = await saveFile(coverImageFile, coverImageName, 'thumbnails', user.userId)
      console.log('Cover image saved:', thumbnailResult.url)
    } else {
      // Generate thumbnail from video
      const thumbnailName = filename.replace(/\.[^/.]+$/, '.png')
      thumbnailResult = await generateThumbnail(videoResult.url, thumbnailName, user.userId)
      console.log('Thumbnail generated:', thumbnailResult.url)
    }

    const videosCollection = await getCollection(Collections.VIDEOS)
    const activitiesCollection = await getCollection(Collections.ACTIVITIES)

    // Create video record in database
    const videoData: Omit<Video, '_id'> = {
      title: title.trim(),
      description: description.trim(),
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      videoUrl: videoResult.url, // Store the S3 URL or local path
      s3Key: videoResult.s3Key, // Store S3 key for easy deletion
      thumbnail: thumbnailResult.url,
      thumbnailS3Key: thumbnailResult.s3Key, // Store thumbnail S3 key
      category: category.trim() || undefined,
      tags: tags.trim() || undefined,
      isPublic,
      isFeatured,
      uploadedBy: new ObjectId(user.userId),
      status: 'READY',
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('Creating video record with data:', videoData)
    
    const result = await videosCollection.insertOne(videoData)
    const videoId = result.insertedId

    console.log('Video record created:', videoId.toString())

    // Log activity
    const activity: Omit<Activity, '_id'> = {
      type: 'VIDEO_UPLOAD',
      message: `Video uploaded: ${title}${isFeatured ? ' (Featured)' : ''}`,
      userId: new ObjectId(user.userId),
      videoId: videoId,
      metadata: JSON.stringify({
        filename,
        size: file.size,
        mimeType: file.type,
        hasCoverImage: !!coverImageFile,
        isFeatured
      }),
      createdAt: new Date()
    }

    await activitiesCollection.insertOne(activity)

    return NextResponse.json({
      video: {
        id: videoId.toString(),
        title: videoData.title,
        description: videoData.description,
        thumbnail: videoData.thumbnail,
        status: videoData.status,
        createdAt: videoData.createdAt
      }
    })
  } catch (error) {
    console.error('Upload error details:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'Failed to save file. Please try again.' },
        { status: 500 }
      )
    }

    // File system errors
    if (error instanceof Error && (error.message.includes('EACCES') || error.message.includes('EPERM'))) {
      return NextResponse.json(
        { error: 'File system permission error. Please check server configuration.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}