import { uploadToS3, generateVideoKey, isS3Configured } from './aws-s3'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export interface VideoQuality {
  label: string
  height: number
  width: number
  bitrate: string
  suffix: string
}

export const VIDEO_QUALITIES: VideoQuality[] = [
  { label: '1080p', height: 1080, width: 1920, bitrate: '5000k', suffix: '_1080p' },
  { label: '720p', height: 720, width: 1280, bitrate: '2500k', suffix: '_720p' },
  { label: '480p', height: 480, width: 854, bitrate: '1000k', suffix: '_480p' },
  { label: '360p', height: 360, width: 640, bitrate: '600k', suffix: '_360p' }
]

export interface ProcessingResult {
  originalUrl: string
  qualities: {
    label: string
    url: string
    s3Key?: string
    size: number
  }[]
}

/**
 * Check if FFmpeg is available (for server-side processing)
 */
export function isFFmpegAvailable(): boolean {
  // In a real implementation, you would check if FFmpeg is installed
  // For now, we'll return false to indicate client-side processing only
  return false
}

/**
 * Generate multiple quality versions of a video
 * This is a placeholder - in production you would use FFmpeg or a video processing service
 */
export async function processVideoQualities(
  originalFile: File,
  filename: string,
  userId: string
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    originalUrl: '',
    qualities: []
  }

  try {
    // For now, we'll just upload the original file
    // In production, you would:
    // 1. Use FFmpeg to create multiple quality versions
    // 2. Upload each version to S3
    // 3. Return URLs for each quality

    if (isS3Configured()) {
      // Upload original file
      const bytes = await originalFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const s3Key = generateVideoKey(filename, userId)
      const uploadResult = await uploadToS3(buffer, s3Key, originalFile.type, {
        originalName: originalFile.name,
        uploadedAt: new Date().toISOString(),
        userId: userId,
        quality: 'original'
      })

      result.originalUrl = uploadResult.cdnUrl || uploadResult.url

      // Add original as highest quality
      result.qualities.push({
        label: 'Original',
        url: result.originalUrl,
        s3Key: uploadResult.key,
        size: originalFile.size
      })

      // TODO: Generate additional qualities using FFmpeg
      // This would involve:
      // 1. Creating temporary files for each quality
      // 2. Using FFmpeg to transcode
      // 3. Uploading each quality to S3
      // 4. Cleaning up temporary files

    } else {
      // Local storage fallback (development only)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const bytes = await originalFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filePath = path.join(uploadDir, filename)
      
      await writeFile(filePath, buffer)
      
      result.originalUrl = `/uploads/${filename}`
      result.qualities.push({
        label: 'Original',
        url: result.originalUrl,
        size: originalFile.size
      })
    }

    return result
  } catch (error) {
    console.error('Video processing error:', error)
    throw new Error(`Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate FFmpeg commands for different qualities
 * This is for reference - actual implementation would use a video processing service
 */
export function generateFFmpegCommands(inputPath: string, outputBasePath: string): string[] {
  const commands: string[] = []

  for (const quality of VIDEO_QUALITIES) {
    const outputPath = outputBasePath.replace(/\.(mp4|webm|mov)$/i, `${quality.suffix}.$1`)
    
    const command = [
      'ffmpeg',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-preset', 'fast',
      '-crf', '23',
      '-maxrate', quality.bitrate,
      '-bufsize', `${parseInt(quality.bitrate) * 2}k`,
      '-vf', `scale=${quality.width}:${quality.height}`,
      '-movflags', '+faststart',
      '-y', // Overwrite output files
      outputPath
    ].join(' ')

    commands.push(command)
  }

  return commands
}

/**
 * Estimate optimal quality based on file size and duration
 */
export function estimateOptimalQuality(fileSize: number, duration: number): string {
  const bitrate = (fileSize * 8) / duration / 1000 // kbps

  if (bitrate > 4000) return '1080p'
  if (bitrate > 2000) return '720p'
  if (bitrate > 800) return '480p'
  return '360p'
}

/**
 * Check if a video needs quality processing
 */
export function shouldProcessQualities(fileSize: number): boolean {
  // Process videos larger than 50MB
  return fileSize > 50 * 1024 * 1024
}

/**
 * Get video quality URLs for a video
 */
export function getVideoQualityUrls(baseUrl: string): { label: string; url: string }[] {
  const qualities = []

  // Add auto quality
  qualities.push({ label: 'Auto', url: baseUrl })

  // Check for quality versions
  for (const quality of VIDEO_QUALITIES) {
    const qualityUrl = baseUrl.replace(/\.(mp4|webm|mov)$/i, `${quality.suffix}.$1`)
    qualities.push({ label: quality.label, url: qualityUrl })
  }

  return qualities
}