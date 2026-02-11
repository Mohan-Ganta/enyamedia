#!/usr/bin/env tsx

/**
 * Test S3 Upload specifically
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { config } from 'dotenv'

config()

async function testS3Upload() {
  console.log('🔍 S3 Upload Test\n')
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  
  try {
    console.log('📤 Testing S3 upload...')
    
    const testContent = Buffer.from('Hello from EnyaMedia! This is a test upload.')
    const testKey = `enyamedia/test/test-${Date.now()}.txt`
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        test: 'true',
        app: 'enyamedia'
      }
      // No ACL specified - bucket policy should handle access
    })
    
    const result = await s3Client.send(command)
    console.log('✅ Upload successful!')
    console.log('Result:', result)
    
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`
    console.log(`File URL: ${url}`)
    
    // Test if file is accessible
    console.log('\n🔍 Testing file access...')
    const response = await fetch(url)
    if (response.ok) {
      const content = await response.text()
      console.log('✅ File is publicly accessible')
      console.log(`Content: "${content}"`)
    } else {
      console.log(`⚠️  File uploaded but not publicly accessible: ${response.status}`)
    }
    
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message)
    console.log('\nError details:', {
      name: error.name,
      code: error.Code,
      message: error.message
    })
    
    if (error.message.includes('AccessControlListNotSupported')) {
      console.log('\n💡 This is the ACL error we fixed - but it might still be in the code somewhere')
    }
  }
}

testS3Upload()