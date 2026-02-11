import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Lazy initialization of S3 client
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }
  return s3Client
}

function getBucketName(): string {
  return process.env.AWS_S3_BUCKET_NAME!
}

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
    const client = getS3Client()
    const bucketName = getBucketName()
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
      // No ACL - bucket policy handles public access
    })

    await client.send(command)

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
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
    const client = getS3Client()
    const bucketName = getBucketName()
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await client.send(command)
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
    const client = getS3Client()
    const bucketName = getBucketName()
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    return await getSignedUrl(client, command, { expiresIn })
  } catch (error) {
    console.error('Presigned URL error:', error)
    throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate S3 key for video files with EnyaMedia folder prefix
 */
export function generateVideoKey(originalName: string, userId: string = 'user'): string {
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
  const bucketName = getBucketName()
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`
  }
  return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
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