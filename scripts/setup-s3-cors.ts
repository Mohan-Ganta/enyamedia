#!/usr/bin/env tsx

/**
 * Setup S3 CORS Configuration
 * 
 * This script configures CORS on the S3 bucket to allow video streaming
 * from your web application domains.
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3'
import { config } from 'dotenv'

config()

async function setupS3CORS() {
  console.log('🔧 Setting up S3 CORS Configuration...\n')
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  
  const bucketName = process.env.AWS_S3_BUCKET_NAME!
  
  try {
    // Check current CORS configuration
    console.log('📋 Checking current CORS configuration...')
    try {
      const getCorsCommand = new GetBucketCorsCommand({
        Bucket: bucketName
      })
      const currentCors = await s3Client.send(getCorsCommand)
      console.log('Current CORS rules:', JSON.stringify(currentCors.CORSRules, null, 2))
    } catch (error: any) {
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('No CORS configuration found - will create new one')
      } else {
        console.log('Error checking CORS:', error.message)
      }
    }
    
    // Define CORS configuration
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedOrigins: [
            'http://localhost:3000',
            'http://localhost:3001', 
            'https://enyamediatv.vercel.app',
            'https://*.vercel.app' // Allow all Vercel preview deployments
          ],
          ExposeHeaders: [
            'Content-Range',
            'Content-Length', 
            'Content-Type',
            'Accept-Ranges',
            'ETag'
          ],
          MaxAgeSeconds: 3600
        }
      ]
    }
    
    console.log('🔧 Applying CORS configuration...')
    const putCorsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration
    })
    
    await s3Client.send(putCorsCommand)
    console.log('✅ CORS configuration applied successfully!')
    
    console.log('\n📋 Applied CORS Rules:')
    corsConfiguration.CORSRules.forEach((rule, index) => {
      console.log(`Rule ${index + 1}:`)
      console.log(`  Allowed Origins: ${rule.AllowedOrigins.join(', ')}`)
      console.log(`  Allowed Methods: ${rule.AllowedMethods.join(', ')}`)
      console.log(`  Allowed Headers: ${rule.AllowedHeaders.join(', ')}`)
      console.log(`  Exposed Headers: ${rule.ExposeHeaders.join(', ')}`)
      console.log(`  Max Age: ${rule.MaxAgeSeconds} seconds`)
    })
    
    console.log('\n🎉 S3 CORS setup completed!')
    console.log('Your videos should now be accessible from:')
    console.log('- http://localhost:3000')
    console.log('- http://localhost:3001')
    console.log('- https://enyamediatv.vercel.app')
    console.log('- All Vercel preview deployments')
    
  } catch (error: any) {
    console.error('❌ Failed to setup CORS:', error.message)
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 Access denied - your IAM user needs s3:PutBucketCors permission')
      console.log('Add this permission to your IAM user policy:')
      console.log(JSON.stringify({
        "Effect": "Allow",
        "Action": [
          "s3:PutBucketCors",
          "s3:GetBucketCors"
        ],
        "Resource": `arn:aws:s3:::${bucketName}`
      }, null, 2))
    }
    
    console.log('\n🔧 Manual Setup Instructions:')
    console.log('1. Go to AWS S3 Console')
    console.log(`2. Open bucket: ${bucketName}`)
    console.log('3. Go to Permissions tab')
    console.log('4. Scroll to "Cross-origin resource sharing (CORS)"')
    console.log('5. Click Edit and paste this configuration:')
    
    const manualCorsConfig = [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": [
          "http://localhost:3000",
          "http://localhost:3001", 
          "https://enyamediatv.vercel.app",
          "https://*.vercel.app"
        ],
        "ExposeHeaders": [
          "Content-Range",
          "Content-Length", 
          "Content-Type",
          "Accept-Ranges",
          "ETag"
        ],
        "MaxAgeSeconds": 3600
      }
    ]
    
    console.log(JSON.stringify(manualCorsConfig, null, 2))
  }
}

setupS3CORS()