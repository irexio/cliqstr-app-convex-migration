// lib/uploadthing.ts

import { createUploadthing, type FileRouter } from 'uploadthing/server'
import { generateUploadButton } from '@uploadthing/react'

const f = createUploadthing()

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: '1MB' } }).onUploadComplete(({ file }) => {
    console.log('✅ Avatar uploaded:', file.url)
  }),

  banner: f({ image: { maxFileSize: '4MB' } }).onUploadComplete(({ file }) => {
    console.log('✅ Banner uploaded:', file.url)
  }),

  postImage: f({ image: { maxFileSize: '2MB' } }).onUploadComplete(({ file }) => {
    console.log('✅ Post image uploaded:', file.url)
  }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
export type UploadEndpoint = keyof OurFileRouter

// ✅ Correct UploadButton export
export const UploadButton = generateUploadButton<OurFileRouter>()
