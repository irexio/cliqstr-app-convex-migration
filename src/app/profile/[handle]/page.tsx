// 🔐 APA-SAFE — Public Profile Page by username
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { notFound } from 'next/navigation'
import Image from 'next/image'

interface Props {
  params: { handle: string }
}

export default async function ProfilePage({ params }: Props) {
  const user = await getCurrentUser()

  if (!user?.id) {
    notFound()
  }

  const profile = await prisma.profile.findUnique({
    where: { username: params.handle },
    select: {
      username: true,
      about: true,
      image: true,
      bannerImage: true,
      user: {
        select: { id: true },
      },
    },
  })

  if (!profile) {
    notFound()
  }

  // ✅ APA check — do user and profile share a cliq?
  const sharedCliq = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      cliq: {
        members: {
          some: {
            userId: profile.user.id,
          },
        },
      },
    },
  })

  if (!sharedCliq) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Banner */}
      <div className="relative w-full h-48 bg-neutral-200">
        {profile.bannerImage && (
          <Image
            src={profile.bannerImage}
            alt="Profile Banner"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Avatar */}
      <div className="relative max-w-4xl mx-auto">
        <div className="absolute -top-12 left-4">
          <Image
            src={profile.image || '/default-avatar.png'}
            alt={profile.username}
            width={96}
            height={96}
            className="rounded-full border-4 border-white object-cover"
          />
        </div>
      </div>

      {/* Profile Content */}
      <section className="max-w-4xl mx-auto mt-16 px-6">
        <h1 className="text-2xl font-bold">{profile.username}</h1>

        {profile.about && (
          <p className="mt-2 text-sm text-neutral-600 whitespace-pre-line">
            {profile.about}
          </p>
        )}
      </section>
    </main>
  )
}
