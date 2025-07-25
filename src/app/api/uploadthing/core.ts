// app/api/uploadthing/core.ts

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "1MB" } })
    .middleware(async ({ req }) => {
      console.log('[UPLOADTHING] Avatar upload middleware starting');
      console.log('[UPLOADTHING] Request headers:', req.headers);
      
      const user = await getCurrentUser();
      if (!user) {
        console.error('[UPLOADTHING] No authenticated user found');
        throw new Error('Not authenticated');
      }
      console.log('[UPLOADTHING] User authenticated:', user.id);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UPLOADTHING] Avatar upload complete for userId:", metadata.userId);
      console.log("[UPLOADTHING] Avatar file url:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  banner: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      console.log('[UPLOADTHING] Banner upload middleware starting');
      console.log('[UPLOADTHING] Request headers:', req.headers);
      
      const user = await getCurrentUser();
      if (!user) {
        console.error('[UPLOADTHING] No authenticated user found');
        throw new Error('Not authenticated');
      }
      console.log('[UPLOADTHING] User authenticated:', user.id);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UPLOADTHING] Banner upload complete for userId:", metadata.userId);
      console.log("[UPLOADTHING] Banner file url:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  postImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Post image upload complete for userId:", metadata.userId);
      console.log("Post image file url:", file.url);
    }),

  cliqBanner: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Cliq banner upload complete for userId:", metadata.userId);
      console.log("Cliq banner file url:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
