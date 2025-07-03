// Debug script to check user data in database
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mimi@cliqstr.com' },
      include: { profile: true }
    })

    if (!user) {
      console.log('❌ No user found with email mimi@cliqstr.com')
      return
    }

    console.log('📧 User found:', user.email)
    console.log('🔐 User password hash:', user.password.substring(0, 20) + '...')
    console.log('📝 Profile exists:', !!user.profile)
      if (user.profile) {
      console.log('🔐 Profile password hash:', user.profile.password.substring(0, 20) + '...')
      console.log('🤝 Passwords match:', user.password === user.profile.password)
      console.log('👤 Username:', user.profile.username)
      console.log('🎭 Role:', user.profile.role)
      console.log('✅ Is approved:', user.profile.isApproved)
      console.log('💳 Stripe status:', user.profile.stripeStatus)
      console.log('👥 Age group:', user.profile.ageGroup)
    }

    console.log('🎫 Reset token:', user.resetToken || 'null')
    console.log('⏰ Reset token expires:', user.resetTokenExpires || 'null')    // Test password comparison
    console.log('\n🧪 Testing password comparison...')
    const testPassword = '77607760!' // Replace with the actual password you used in reset
    
    if (user.profile) {
      const isValid = await bcrypt.compare(testPassword, user.profile.password)
      console.log('🔍 Password test result:', isValid ? '✅ VALID' : '❌ INVALID')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUser()
