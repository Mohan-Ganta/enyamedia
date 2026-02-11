import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { uploadToS3, generateVideoKey, generateThumbnailKey, isS3Configured } from './aws-s3'

// Conditional import for Sharp to reduce bundle size in serverless
let sharp: typeof import('sharp') | null = null
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  try {
    sharp = require('sharp')
  } catch {
    console.warn('Sharp not available, thumbnail generation disabled')
  }
}

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
export const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails')

// Ensure upload directories exist
export async function ensureUploadDirs() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
  if (!existsSync(THUMBNAILS_DIR)) {
    await mkdir(THUMBNAILS_DIR, { recursive: true })
  }
}

export async function saveFile(file: File, filename: string, subfolder?: string, userId?: string): Promise<{ url: string; s3Key?: string }> {
  try {
    // Use S3 if configured, otherwise fall back to local storage
    if (isS3Configured()) {
      console.log('Uploading to S3...')
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate S3 key with EnyaMedia folder prefix
      const s3Key = userId ? 
        generateVideoKey(filename, userId) : 
        `enyamedia/${subfolder || 'uploads'}/${filename}`
      
      // Upload to S3
      const result = await uploadToS3(buffer, s3Key, file.type, {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        userId: userId || 'unknown'
      })
      
      console.log('S3 upload successful:', result.key)
      return { 
        url: result.cdnUrl || result.url,
        s3Key: result.key
      }
    } else {
      // Fallback to local storage (development only)
      console.log('S3 not configured, using local storage')
      
      // In production/Vercel, you should use cloud storage (S3, Cloudinary, Vercel Blob)
      if (process.env.VERCEL) {
        throw new Error('S3 not configured for production deployment')
      }
      
      await ensureUploadDirs()
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      let targetDir = UPLOAD_DIR
      let urlPath = '/uploads'
      
      if (subfolder) {
        targetDir = path.join(UPLOAD_DIR, subfolder)
        urlPath = `/uploads/${subfolder}`
        
        // Ensure subfolder exists
        if (!existsSync(targetDir)) {
          await mkdir(targetDir, { recursive: true })
        }
      }
      
      const filePath = path.join(targetDir, filename)
      console.log('Saving file to:', filePath)
      
      await writeFile(filePath, buffer)
      console.log('File saved successfully')
      
      return { url: `${urlPath}/${filename}` }
    }
  } catch (error) {
    console.error('File save error:', error)
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateThumbnail(videoUrl: string, thumbnailName: string, userId?: string): Promise<{ url: string; s3Key?: string }> {
  try {
    // Use S3 if configured
    if (isS3Configured()) {
      console.log('Generating thumbnail for S3...')
      
      // For S3, we'll create a simple placeholder thumbnail
      // In production, you'd use AWS Lambda + FFmpeg or a service like AWS Elemental MediaConvert
      const placeholderBuffer = await createPlaceholderThumbnail()
      
      const s3Key = userId ? 
        generateThumbnailKey(generateVideoKey(thumbnailName, userId)) : 
        `enyamedia/thumbnails/${thumbnailName}`
      
      const result = await uploadToS3(placeholderBuffer, s3Key, 'image/jpeg')
      console.log('Thumbnail uploaded to S3:', result.key)
      
      return { 
        url: result.cdnUrl || result.url,
        s3Key: result.key
      }
    } else {
      // Fallback for local development
      if (process.env.VERCEL || process.env.NODE_ENV === 'production' || !sharp) {
        console.log('Skipping thumbnail generation in serverless environment or Sharp not available')
        return { url: '/placeholder-video.svg' }
      }
      
      await ensureUploadDirs()
      
      const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailName)
      
      // Create a simple placeholder image
      await sharp({
        create: {
          width: 320,
          height: 180,
          channels: 3,
          background: { r: 100, g: 100, b: 100 }
        }
      })
      .png()
      .toFile(thumbnailPath)
      
      return { url: `/uploads/thumbnails/${thumbnailName}` }
    }
  } catch (error) {
    console.error('Thumbnail generation failed:', error)
    // Return a default placeholder path if thumbnail generation fails
    return { url: '/placeholder-video.svg' }
  }
}

async function createPlaceholderThumbnail(): Promise<Buffer> {
  // Create a simple placeholder thumbnail buffer
  // In production, you'd extract actual frames from the video using AWS Lambda + FFmpeg
  
  // Create a minimal JPEG buffer (1x1 pixel gray image)
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x80, 0xFF, 0xD9
  ])
  
  return jpegHeader
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  const ext = path.extname(originalName)
  const name = path.basename(originalName, ext)
  
  return `${name}_${timestamp}_${random}${ext}`
}

export function isValidVideoFile(file: File): boolean {
  const validTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-ms-wmv', // Additional Windows Media formats
    'video/3gpp',     // 3GP format
    'video/x-flv'     // Flash Video format
  ]
  
  const validExtensions = ['.mp4', '.mpeg', '.mpg', '.mov', '.avi', '.webm', '.wmv', '.3gp', '.flv']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  
  return validTypes.includes(file.type) || validExtensions.includes(fileExtension)
}

export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}