import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN // Optional: for CDN

export interface UploadResult {
  key: string
  url: string
  cdnUrl?: string
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
      // Remove ACL since the bucket doesn't support it
      // Files will be accessible via bucket policy instead
    })

    await s3Client.send(command)

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
    const cdnUrl = CLOUDFRONT_DOMAIN ? `https://${CLOUDFRONT_DOMAIN}/${key}` : undefined

    return {
      key,
      url,
      cdnUrl
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('S3 delete error:', error)
    throw new Error(`Failed to delete from S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate presigned URL for secure access (optional)
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Presigned URL error:', error)
    throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate S3 key for video files with EnyaMedia folder prefix
 */
export function generateVideoKey(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  const extension = originalName.split('.').pop()
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  return `enyamedia/videos/${userId}/${timestamp}_${random}_${sanitizedName.replace(/\.[^/.]+$/, '')}.${extension}`
}

/**
 * Generate S3 key for thumbnail files with EnyaMedia folder prefix
 */
export function generateThumbnailKey(videoKey: string): string {
  const baseName = videoKey.replace(/\.[^/.]+$/, '')
  return `${baseName}_thumbnail.jpg`
}

/**
 * Get video URL (CDN if available, otherwise S3 direct)
 */
export function getVideoUrl(key: string): string {
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`
  }
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  )
}