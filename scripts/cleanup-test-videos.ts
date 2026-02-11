#!/usr/bin/env tsx

/**
 * Cleanup Test Videos Script
 * 
 * This script removes test videos and debugging content from the database
 * to clean up the application for production use.
 */

import { config } from 'dotenv'
import { MongoClient, ObjectId } from 'mongodb'
import { deleteFromS3 } from '../src/lib/aws-s3'

// Load environment variables
config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

async function cleanupTestVideos() {
  const client = new MongoClient(DATABASE_URL!)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('enyamedia')
    const videosCollection = db.collection('videos')
    
    // Find test videos (you can modify this query based on your test data)
    const testVideos = await videosCollection.find({
      $or: [
        { title: { $regex: /test/i } },
        { title: { $regex: /debug/i } },
        { filename: { $regex: /test/i } },
        { originalName: { $regex: /test/i } }
      ]
    }).toArray()
    
    console.log(`Found ${testVideos.length} test videos to remove`)
    
    for (const video of testVideos) {
      console.log(`Removing video: ${video.title} (${video._id})`)
      
      // Delete from S3 if S3 key exists
      if (video.s3Key) {
        try {
          await deleteFromS3(video.s3Key)
          console.log(`  ✓ Deleted video from S3: ${video.s3Key}`)
        } catch (error) {
          console.log(`  ⚠ Failed to delete from S3: ${error}`)
        }
      }
      
      // Delete thumbnail from S3 if exists
      if (video.thumbnailS3Key) {
        try {
          await deleteFromS3(video.thumbnailS3Key)
          console.log(`  ✓ Deleted thumbnail from S3: ${video.thumbnailS3Key}`)
        } catch (error) {
          console.log(`  ⚠ Failed to delete thumbnail from S3: ${error}`)
        }
      }
      
      // Remove from database
      await videosCollection.deleteOne({ _id: video._id })
      console.log(`  ✓ Removed from database`)
    }
    
    // Also clean up related activities
    const activitiesCollection = db.collection('activities')
    const deletedActivities = await activitiesCollection.deleteMany({
      videoId: { $in: testVideos.map(v => v._id) }
    })
    
    console.log(`Removed ${deletedActivities.deletedCount} related activities`)
    console.log('✅ Cleanup completed successfully')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Run the cleanup
cleanupTestVideos()