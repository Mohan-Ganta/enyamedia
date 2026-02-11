#!/usr/bin/env tsx

/**
 * AWS Setup Verification Script
 * 
 * This script helps verify AWS credentials and provides setup guidance.
 */

import { config } from 'dotenv'

// Load environment variables
config()

function verifyAWSSetup() {
  console.log('🔍 AWS Setup Verification\n')
  
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION
  const bucketName = process.env.AWS_S3_BUCKET_NAME
  
  console.log('📋 Current Configuration:')
  console.log(`   Access Key ID: ${accessKeyId ? `${accessKeyId.substring(0, 8)}...` : '❌ Missing'}`)
  console.log(`   Secret Key: ${secretAccessKey ? `${secretAccessKey.substring(0, 8)}... (${secretAccessKey.length} chars)` : '❌ Missing'}`)
  console.log(`   Region: ${region || '❌ Missing (will default to us-east-1)'}`)
  console.log(`   Bucket: ${bucketName || '❌ Missing'}`)
  
  console.log('\n🔍 Validation Results:')
  
  // Check Access Key ID format
  if (!accessKeyId) {
    console.log('❌ AWS_ACCESS_KEY_ID is missing')
  } else if (accessKeyId.length !== 20 || !accessKeyId.startsWith('AKIA')) {
    console.log('⚠️  AWS_ACCESS_KEY_ID format looks incorrect')
    console.log('   Expected: 20 characters starting with AKIA')
    console.log(`   Current: ${accessKeyId.length} characters starting with ${accessKeyId.substring(0, 4)}`)
  } else {
    console.log('✅ AWS_ACCESS_KEY_ID format looks correct')
  }
  
  // Check Secret Access Key format
  if (!secretAccessKey) {
    console.log('❌ AWS_SECRET_ACCESS_KEY is missing')
  } else if (secretAccessKey.length !== 40) {
    console.log('⚠️  AWS_SECRET_ACCESS_KEY length looks incorrect')
    console.log('   Expected: 40 characters')
    console.log(`   Current: ${secretAccessKey.length} characters`)
    console.log('   This is likely the cause of the "Resolved credential object is not valid" error')
  } else {
    console.log('✅ AWS_SECRET_ACCESS_KEY length looks correct')
  }
  
  // Check region
  if (!region) {
    console.log('⚠️  AWS_REGION not set (will default to us-east-1)')
  } else {
    console.log('✅ AWS_REGION is set')
  }
  
  // Check bucket name
  if (!bucketName) {
    console.log('❌ AWS_S3_BUCKET_NAME is missing')
  } else {
    console.log('✅ AWS_S3_BUCKET_NAME is set')
  }
  
  console.log('\n💡 Next Steps:')
  
  if (!secretAccessKey || secretAccessKey.length !== 40) {
    console.log('1. 🔑 Get the complete AWS Secret Access Key:')
    console.log('   - Go to AWS IAM Console → Users → Your User → Security credentials')
    console.log('   - Create a new access key pair (the secret is only shown once)')
    console.log('   - Update your .env file with the complete 40-character secret key')
    console.log('')
  }
  
  if (!accessKeyId || accessKeyId.length !== 20) {
    console.log('2. 🆔 Verify the AWS Access Key ID:')
    console.log('   - Should be exactly 20 characters')
    console.log('   - Should start with "AKIA"')
    console.log('')
  }
  
  console.log('3. 🪣 Verify the S3 bucket:')
  console.log('   - Go to AWS S3 Console')
  console.log('   - Confirm bucket "bucket-s3-triaright" exists in ap-south-1 region')
  console.log('   - Check bucket permissions and policy')
  console.log('')
  
  console.log('4. 🔐 Verify IAM permissions:')
  console.log('   Your IAM user needs these permissions:')
  console.log('   - s3:PutObject')
  console.log('   - s3:GetObject') 
  console.log('   - s3:DeleteObject')
  console.log('   - s3:ListBucket')
  console.log('')
  
  console.log('5. 🧪 Test again:')
  console.log('   After updating credentials, run: npm run test:s3')
  
  if (secretAccessKey && secretAccessKey.length !== 40) {
    console.log('\n⚠️  IMPORTANT: Your AWS Secret Access Key appears to be incomplete!')
    console.log('   AWS secret keys are always exactly 40 characters long.')
    console.log('   Please get the complete key from AWS IAM Console.')
  }
}

verifyAWSSetup()