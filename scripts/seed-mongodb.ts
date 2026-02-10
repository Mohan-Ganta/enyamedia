import { config } from 'dotenv'
import { getCollection, Collections } from '../src/lib/mongodb'
import { User, Video, Activity } from '../src/lib/types'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

// Load environment variables
config()

async function main() {
  console.log('🌱 Seeding MongoDB database...')

  const usersCollection = await getCollection(Collections.USERS)
  const videosCollection = await getCollection(Collections.VIDEOS)
  const activitiesCollection = await getCollection(Collections.ACTIVITIES)

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser: Omit<User, '_id'> = {
    email: 'admin@enyamedia.com',
    password: hashedPassword,
    name: 'Admin User',
    role: 'SUPER_ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const existingAdmin = await usersCollection.findOne({ email: adminUser.email })
  let adminId: ObjectId

  if (!existingAdmin) {
    const result = await usersCollection.insertOne(adminUser)
    adminId = result.insertedId
    console.log('✅ Admin user created:', adminUser.email)
  } else {
    adminId = existingAdmin._id
    console.log('⏭️  Admin user already exists:', adminUser.email)
  }

  // Create sample regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const regularUser: Omit<User, '_id'> = {
    email: 'user@enyamedia.com',
    password: userPassword,
    name: 'Regular User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const existingUser = await usersCollection.findOne({ email: regularUser.email })
  let userId: ObjectId

  if (!existingUser) {
    const result = await usersCollection.insertOne(regularUser)
    userId = result.insertedId
    console.log('✅ Regular user created:', regularUser.email)
  } else {
    userId = existingUser._id
    console.log('⏭️  Regular user already exists:', regularUser.email)
  }

  // Sample video data
  const sampleVideos: Omit<Video, '_id'>[] = [
    {
      title: 'Mayabazar',
      description: 'Classic Telugu mythological film featuring NTR, ANR, and Savitri. A timeless tale from the Mahabharata.',
      filename: 'mayabazar_sample.mp4',
      originalName: 'Mayabazar (1957).mp4',
      mimeType: 'video/mp4',
      size: 1500000000,
      duration: 10800,
      thumbnail: '/movies/mayabazar.jpg',
      status: 'READY',
      views: 15420,
      likes: 892,
      category: 'Mythology',
      isPublic: true,
      isFeatured: true,
      uploadedBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Missamma',
      description: 'Romantic comedy-drama starring NTR, ANR, and Savitri. A heartwarming story of love and friendship.',
      filename: 'missamma_sample.mp4',
      originalName: 'Missamma (1955).mp4',
      mimeType: 'video/mp4',
      size: 1200000000,
      duration: 9600,
      thumbnail: '/movies/missamma.jpg',
      status: 'READY',
      views: 12350,
      likes: 756,
      category: 'Romance',
      isPublic: true,
      isFeatured: true,
      uploadedBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Gundamma Katha',
      description: 'Family drama featuring NTR, ANR, and Savitri. A story about family values and relationships.',
      filename: 'gundamma_katha_sample.mp4',
      originalName: 'Gundamma Katha (1962).mp4',
      mimeType: 'video/mp4',
      size: 1350000000,
      duration: 10200,
      thumbnail: '/movies/gundamma_katha.jpg',
      status: 'READY',
      views: 9876,
      likes: 543,
      category: 'Family',
      isPublic: true,
      isFeatured: false,
      uploadedBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Pathala Bhairavi',
      description: 'Fantasy adventure film with NTR. A magical tale of courage and adventure.',
      filename: 'pathala_bhairavi_sample.mp4',
      originalName: 'Pathala Bhairavi (1951).mp4',
      mimeType: 'video/mp4',
      size: 1100000000,
      duration: 8400,
      thumbnail: '/movies/pathala_bhairavi.jpg',
      status: 'READY',
      views: 8765,
      likes: 432,
      category: 'Fantasy',
      isPublic: true,
      isFeatured: false,
      uploadedBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Sankarabharanam',
      description: 'Musical drama showcasing classical Indian music and culture.',
      filename: 'sankarabharanam_sample.mp4',
      originalName: 'Sankarabharanam (1980).mp4',
      mimeType: 'video/mp4',
      size: 1250000000,
      duration: 9000,
      thumbnail: '/movies/sankarabharanam.jpg',
      status: 'READY',
      views: 11234,
      likes: 678,
      category: 'Musical',
      isPublic: true,
      isFeatured: true,
      uploadedBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // Create sample videos
  for (const videoData of sampleVideos) {
    const existingVideo = await videosCollection.findOne({ title: videoData.title })
    
    if (!existingVideo) {
      await videosCollection.insertOne(videoData)
      console.log('✅ Created video:', videoData.title)
    } else {
      console.log('⏭️  Video already exists:', videoData.title)
    }
  }

  // Create some sample activities
  const activities: Omit<Activity, '_id'>[] = [
    {
      type: 'USER_REGISTER',
      message: 'New user registered',
      userId: userId,
      createdAt: new Date()
    },
    {
      type: 'ADMIN_ACTION',
      message: 'Database seeded with sample data',
      userId: adminId,
      createdAt: new Date()
    }
  ]

  for (const activityData of activities) {
    await activitiesCollection.insertOne(activityData)
  }

  console.log('✅ Created sample activities')
  console.log('')
  console.log('🎉 MongoDB database seeded successfully!')
  console.log('')
  console.log('Login credentials:')
  console.log('📧 Admin: admin@enyamedia.com / admin123')
  console.log('📧 User: user@enyamedia.com / user123')
  console.log('')
  console.log('Sample data created:')
  console.log('🎬 5 sample videos with thumbnails')
  console.log('👥 2 users (1 admin, 1 regular)')
  console.log('📊 Sample activities')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })