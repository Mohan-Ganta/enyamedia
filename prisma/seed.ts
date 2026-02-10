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
  console.log('📧 Email: admin@enyamedia.com')
  console.log('🔑 Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })