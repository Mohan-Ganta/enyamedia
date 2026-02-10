import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user only
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@enyamedia.com' },
    update: {},
    create: {
      email: 'admin@enyamedia.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'SUPER_ADMIN'
    }
  })

  console.log('✅ Created admin user:', admin.email)

  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Login credentials:')
  console.log('Admin: admin@enyamedia.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })