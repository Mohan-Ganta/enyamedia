import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Conditional import for Sharp to reduce bundle size in serverless
let sharp: any = null
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  try {
    sharp = require('sharp')
  } catch (e) {
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

export async function saveFile(file: File, filename: string, subfolder?: string): Promise<string> {
  try {
    // In production/Vercel, you should use cloud storage (S3, Cloudinary, Vercel Blob)
    if (process.env.VERCEL) {
      console.warn('File upload in serverless environment - consider using cloud storage')
      // For now, return a placeholder path
      return `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`
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
    
    return `${urlPath}/${filename}`
  } catch (error) {
    console.error('File save error:', error)
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateThumbnail(videoPath: string, thumbnailName: string): Promise<string> {
  try {
    await ensureUploadDirs()
    
    // For serverless environments or when Sharp is not available, skip thumbnail generation
    if (process.env.VERCEL || process.env.NODE_ENV === 'production' || !sharp) {
      console.log('Skipping thumbnail generation in serverless environment or Sharp not available')
      return '/placeholder-video.svg'
    }
    
    // For now, create a placeholder thumbnail
    // In production, you'd use ffmpeg to extract a frame from the video
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
    
    return `/uploads/thumbnails/${thumbnailName}`
  } catch (error) {
    console.error('Thumbnail generation failed:', error)
    // Return a default placeholder path if thumbnail generation fails
    return '/placeholder-video.svg'
  }
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