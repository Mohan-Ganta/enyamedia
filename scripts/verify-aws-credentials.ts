#!/usr/bin/env tsx

/**
 * Script to verify AWS credentials format
 * Run with: npx tsx scripts/verify-aws-credentials.ts
 */

import { config } from 'dotenv'

// Load environment variables from .env file
config()

function verifyAWSCredentials() {
  console.log('🔍 Verifying AWS Credentials Format...\n')

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION
  const bucketName = process.env.AWS_S3_BUCKET_NAME

  console.log('Current Configuration:')
  console.log(`Access Key ID: ${accessKeyId || 'NOT SET'}`)
  console.log(`Secret Access Key: ${secretAccessKey ? `${secretAccessKey.substring(0, 8)}...` : 'NOT SET'}`)
  console.log(`Region: ${region || 'NOT SET'}`)
  console.log(`Bucket Name: ${bucketName || 'NOT SET'}\n`)

  // Verify Access Key ID format
  if (!accessKeyId) {
    console.log('❌ AWS_ACCESS_KEY_ID is not set')
  } else if (accessKeyId.length !== 20) {
    console.log(`❌ AWS_ACCESS_KEY_ID should be 20 characters, got ${accessKeyId.length}`)
  } else if (!/^AKIA[A-Z0-9]{16}$/.test(accessKeyId)) {
    console.log('❌ AWS_ACCESS_KEY_ID format is invalid (should start with AKIA)')
  } else {
    console.log('✅ AWS_ACCESS_KEY_ID format is correct')
  }

  // Verify Secret Access Key format
  if (!secretAccessKey) {
    console.log('❌ AWS_SECRET_ACCESS_KEY is not set')
  } else if (secretAccessKey.length !== 40) {
    console.log(`❌ AWS_SECRET_ACCESS_KEY should be 40 characters, got ${secretAccessKey.length}`)
    console.log('   Please double-check your secret access key from AWS console')
  } else if (!/^[A-Za-z0-9+/]{40}$/.test(secretAccessKey)) {
    console.log('❌ AWS_SECRET_ACCESS_KEY contains invalid characters')
  } else {
    console.log('✅ AWS_SECRET_ACCESS_KEY format is correct')
  }

  // Verify Region
  if (!region) {
    console.log('❌ AWS_REGION is not set')
  } else if (!/^[a-z]{2}-[a-z]+-\d$/.test(region)) {
    console.log('❌ AWS_REGION format is invalid (should be like ap-south-1)')
  } else {
    console.log('✅ AWS_REGION format is correct')
  }

  // Verify Bucket Name
  if (!bucketName) {
    console.log('❌ AWS_S3_BUCKET_NAME is not set')
  } else if (bucketName.length < 3 || bucketName.length > 63) {
    console.log('❌ AWS_S3_BUCKET_NAME length is invalid (3-63 characters)')
  } else {
    console.log('✅ AWS_S3_BUCKET_NAME format is correct')
  }

  console.log('\n📁 EnyaMedia folder structure will be created in S3:')
  console.log(`${bucketName}/`)
  console.log('└── enyamedia/')
  console.log('    ├── videos/')
  console.log('    │   └── {userId}/')
  console.log('    │       └── {timestamp}_{random}_{filename}')
  console.log('    └── thumbnails/')
  console.log('        └── {userId}/')
  console.log('            └── {timestamp}_{random}_{filename}_thumbnail.jpg')

  console.log('\n💡 If your secret access key is incorrect, please:')
  console.log('1. Go to AWS IAM Console')
  console.log('2. Find your user and go to Security Credentials')
  console.log('3. Create a new access key (you cannot view existing secret keys)')
  console.log('4. Update your .env file with the new credentials')
}

// Run the verification
verifyAWSCredentials()