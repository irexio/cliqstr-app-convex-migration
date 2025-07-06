// app/api/uploadthing/core.ts

import { createUploadthing } from "uploadthing/next";
import { createRouteHandler } from 'uploadthing/next';
import type { FileRouter } from "uploadthing/next";
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "1MB" } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload complete for userId:", metadata.userId);
      console.log("Avatar file url:", file.url);
    }),

  banner: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Banner upload complete for userId:", metadata.userId);
      console.log("Banner file url:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
