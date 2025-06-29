import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { generateUploadButton } from '@uploadthing/react'
import { getServerSession } from '@/lib/auth/getServerSession'

const f = createUploadthing()

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: '1MB' } }).onUploadComplete(async ({ file }) => {
    const session = await getServerSession()

    if (!session?.user?.id) {
      throw new Error('Unauthorized upload attempt')
    }

    console.log('✅ Avatar uploaded:', file.url)
    return { url: file.url }
  }),

  banner: f({ image: { maxFileSize: '4MB' } }).onUploadComplete(async ({ file }) => {
    const session = await getServerSession()

    if (!session?.user?.id) {
      throw new Error('Unauthorized upload attempt')
    }

    console.log('✅ Banner uploaded:', file.url)
    return { url: file.url }
  }),

  postImage: f({ image: { maxFileSize: '2MB' } }).onUploadComplete(async ({ file }) => {
    const session = await getServerSession()

    if (!session?.user?.id) {
      throw new Error('Unauthorized upload attempt')
    }

    console.log('✅ Post image uploaded:', file.url)
    return { url: file.url }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
export type UploadEndpoint = keyof OurFileRouter

export const UploadButton = generateUploadButton<OurFileRouter>()
