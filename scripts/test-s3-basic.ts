#!/usr/bin/env tsx

/**
 * Basic S3 Test - Just try to list bucket contents
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { config } from 'dotenv'

config()

async function testBasicS3() {
  console.log('🔍 Basic S3 Connection Test\n')
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  
  try {
    console.log('📋 Attempting to list bucket contents...')
    
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      MaxKeys: 5
    })
    
    const response = await s3Client.send(command)
    console.log('✅ Successfully connected to S3!')
    console.log(`Found ${response.Contents?.length || 0} objects in bucket`)
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('\nRecent objects:')
      response.Contents.forEach(obj => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes, ${obj.LastModified})`)
      })
    } else {
      console.log('Bucket is empty or no objects found')
    }
    
  } catch (error: any) {
    console.error('❌ S3 connection failed:', error.message)
    
    if (error.name === 'NoSuchBucket') {
      console.log('\n💡 The bucket does not exist or is in a different region')
    } else if (error.name === 'AccessDenied') {
      console.log('\n💡 Access denied - check IAM permissions')
    } else if (error.message.includes('credential')) {
      console.log('\n💡 Credential issue - the access key or secret key may be invalid')
    }
    
    console.log('\nError details:', {
      name: error.name,
      code: error.Code,
      message: error.message
    })
  }
}

testBasicS3()