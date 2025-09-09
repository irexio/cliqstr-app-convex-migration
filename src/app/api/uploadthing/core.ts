// app/api/uploadthing/core.ts

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: '1MB' } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log('✅ Avatar uploaded:', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  banner: f({ image: { maxFileSize: '4MB' } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log('✅ Banner uploaded:', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  postImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // 🔒 CRITICAL: Check child permissions for image posting
      if (user.account?.role === 'Child') {
        const { convexHttp } = await import('@/lib/convex-server');
        const { api } = await import('convex/_generated/api');
        
        const childSettings = await convexHttp.query(api.users.getChildSettings, {
          profileId: user.myProfile!.id as any,
        });
        
        if (!childSettings?.canPostImages) {
          throw new Error('You do not have permission to upload images. Please ask your parent to enable this feature.');
        }
      }
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Post image upload complete for userId:", metadata.userId);
      console.log("Post image file url:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
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
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
