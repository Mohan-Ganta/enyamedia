#!/usr/bin/env tsx

/**
 * Test script to verify AWS S3 configuration
 * Run with: npx tsx scripts/test-s3.ts
 */

import { config } from 'dotenv'
import { isS3Configured, uploadToS3, deleteFromS3 } from '../src/lib/aws-s3'

// Load environment variables from .env file
config()

async function testS3Configuration() {
  console.log('🔍 Testing AWS S3 Configuration...\n')

  // Check if S3 is configured
  if (!isS3Configured()) {
    console.log('❌ S3 is not configured. Please set the following environment variables:')
    console.log('   - AWS_ACCESS_KEY_ID')
    console.log('   - AWS_SECRET_ACCESS_KEY')
    console.log('   - AWS_S3_BUCKET_NAME')
    console.log('   - AWS_REGION (optional, defaults to us-east-1)')
    console.log('   - AWS_CLOUDFRONT_DOMAIN (optional, for CDN)')
    return
  }

  console.log('✅ S3 configuration found')
  console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`)
  console.log(`   Bucket: ${process.env.AWS_S3_BUCKET_NAME}`)
  console.log(`   CDN: ${process.env.AWS_CLOUDFRONT_DOMAIN || 'Not configured'}\n`)

  try {
    // Test upload
    console.log('📤 Testing S3 upload...')
    const testContent = Buffer.from('Hello, S3! This is a test file from EnyaMedia.')
    const testKey = `enyamedia/test/test-${Date.now()}.txt`
    
    const uploadResult = await uploadToS3(testContent, testKey, 'text/plain', {
      test: 'true',
      timestamp: new Date().toISOString(),
      app: 'enyamedia'
    })
    
    console.log('✅ Upload successful!')
    console.log(`   Key: ${uploadResult.key}`)
    console.log(`   URL: ${uploadResult.url}`)
    if (uploadResult.cdnUrl) {
      console.log(`   CDN URL: ${uploadResult.cdnUrl}`)
    }

    // Test delete
    console.log('\n🗑️  Testing S3 delete...')
    await deleteFromS3(uploadResult.key)
    console.log('✅ Delete successful!')

    console.log('\n🎉 All S3 tests passed! Your EnyaMedia S3 integration is working correctly.')
    console.log('📁 Files will be stored in the enyamedia/ folder in your bucket.')
    
  } catch (error) {
    console.error('\n❌ S3 test failed:')
    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
      
      // Provide specific guidance based on error type
      if (error.message.includes('credential')) {
        console.log('\n🔧 Credential Issues:')
        console.log('1. Verify your AWS Access Key ID and Secret Access Key are correct')
        console.log('2. Check if the IAM user is active and not disabled')
        console.log('3. Ensure the credentials haven\'t expired')
      } else if (error.message.includes('permission') || error.message.includes('Access Denied')) {
        console.log('\n🔧 Permission Issues:')
        console.log('1. Ensure your IAM user has s3:PutObject permission')
        console.log('2. Check if the bucket policy allows your user to access it')
        console.log('3. Verify the bucket exists and is in the correct region')
      } else if (error.message.includes('bucket') || error.message.includes('NoSuchBucket')) {
        console.log('\n🔧 Bucket Issues:')
        console.log('1. Verify the bucket name "bucket-s3-triaright" exists')
        console.log('2. Check if the bucket is in the ap-south-1 region')
        console.log('3. Ensure the bucket is accessible from your account')
      }
    } else {
      console.error(error)
    }
    
    console.log('\n📋 Troubleshooting Steps:')
    console.log('1. Go to AWS S3 Console and verify the bucket exists')
    console.log('2. Go to AWS IAM Console and check user permissions')
    console.log('3. Try creating a new access key pair')
    console.log('4. Test with AWS CLI: aws s3 ls s3://bucket-s3-triaright')
  }
}

// Run the test
testS3Configuration().catch(console.error)