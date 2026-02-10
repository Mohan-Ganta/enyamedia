import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@enyamedia.com' },
    update: {},
    create: {
      email: 'admin@enyamedia.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN'
    }
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create sample regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@enyamedia.com' },
    update: {},
    create: {
      email: 'user@enyamedia.com',
      password: userPassword,
      name: 'Regular User',
      role: 'USER'
    }
  })

  console.log('✅ Regular user created:', regularUser.email)

  // Sample video data based on your movie images
  const sampleVideos = [
    {
      title: 'Mayabazar',
      description: 'Classic Telugu mythological film featuring NTR, ANR, and Savitri. A timeless tale from the Mahabharata.',
      filename: 'mayabazar_sample.mp4',
      originalName: 'Mayabazar (1957).mp4',
      mimeType: 'video/mp4',
      size: 1500000000, // 1.5GB
      duration: 10800, // 3 hours
      thumbnail: '/movies/mayabazar.jpg',
      status: 'READY',
      views: 15420,
      likes: 892,
      category: 'Mythology',
      isPublic: true,
      isFeatured: true,
      uploadedBy: adminUser.id
    },
    {
      title: 'Missamma',
      description: 'Romantic comedy-drama starring NTR, ANR, and Savitri. A heartwarming story of love and friendship.',
      filename: 'missamma_sample.mp4',
      originalName: 'Missamma (1955).mp4',
      mimeType: 'video/mp4',
      size: 1200000000,
      duration: 9600, // 2.67 hours
      thumbnail: '/movies/missamma.jpg',
      status: 'READY',
      views: 12350,
      likes: 756,
      category: 'Romance',
      isPublic: true,
      isFeatured: true,
      uploadedBy: adminUser.id
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
      uploadedBy: adminUser.id
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
      uploadedBy: adminUser.id
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
      uploadedBy: adminUser.id
    }
  ]

  // Create sample videos
  for (const videoData of sampleVideos) {
    const existingVideo = await prisma.video.findFirst({
      where: { title: videoData.title }
    })
    
    if (!existingVideo) {
      const video = await prisma.video.create({
        data: videoData
      })
      console.log('✅ Created video:', video.title)
    } else {
      console.log('⏭️  Video already exists:', videoData.title)
    }
  }

  // Create some sample activities
  const activities = [
    {
      type: 'USER_REGISTER',
      message: 'New user registered',
      userId: regularUser.id
    },
    {
      type: 'VIDEO_UPLOAD',
      message: 'Video uploaded: Mayabazar',
      userId: adminUser.id,
      videoId: (await prisma.video.findFirst({ where: { filename: 'mayabazar_sample.mp4' } }))?.id
    },
    {
      type: 'ADMIN_ACTION',
      message: 'Database seeded with sample data',
      userId: adminUser.id
    }
  ]

  for (const activityData of activities) {
    if (activityData.videoId || !activityData.videoId) { // Create activity regardless
      await prisma.activity.create({
        data: {
          type: activityData.type,
          message: activityData.message,
          userId: activityData.userId,
          videoId: activityData.videoId || undefined
        }
      })
    }
  }

  console.log('✅ Created sample activities')
  console.log('')
  console.log('🎉 Database seeded successfully!')
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
  .finally(async () => {
    await prisma.$disconnect()
  })