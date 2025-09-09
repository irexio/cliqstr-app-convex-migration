 import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [, , emailArg, roleArg] = process.argv
  const email = emailArg || process.env.TARGET_EMAIL || 'admin@cliqstr.com'
  const role = String(roleArg || process.env.TARGET_ROLE || 'Parent')

  const validRoles = ['Admin', 'Adult', 'Parent']
  if (!validRoles.includes(String(role))) {
    console.error(`Invalid role: ${role}. Use one of: ${validRoles.join(', ')}`)
    process.exit(1)
  }

  console.log(`Updating role for ${email} -> ${role}`)

  const user = await prisma.user.findUnique({ where: { email }, include: { account: true } })
  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  if (user.account) {
    await prisma.account.update({
      where: { id: user.account.id },
      data: {
        role,
        isApproved: true,
        plan: (user.account as any).plan || 'basic',
        stripeStatus: (user.account as any).stripeStatus || 'verified',
      },
    })
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        role,
        isApproved: true,
        plan: 'basic',
        stripeStatus: 'verified',
        birthdate: new Date('1990-01-01'),
      },
    })
  }

  console.log(`✅ Updated ${email} to role ${role}`)
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
