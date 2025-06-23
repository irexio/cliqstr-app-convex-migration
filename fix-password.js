// Script to manually fix the password mismatch
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixPassword() {
  try {
    const password = '77607760!'
    const hashedPassword = await bcrypt.hash(password, 12) // Using 12 rounds to match Profile
    
    console.log('🔐 Generated new hash:', hashedPassword.substring(0, 20) + '...')
    
    // Update both User and Profile with the same hash
    const user = await prisma.user.update({
      where: { email: 'mimi@cliqstr.com' },
      data: { password: hashedPassword }
    })
    
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Updated User password')
    console.log('✅ Updated Profile password')
    
    // Test the password
    const isValid = await bcrypt.compare(password, hashedPassword)
    console.log('🧪 Password test:', isValid ? '✅ VALID' : '❌ INVALID')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPassword()
