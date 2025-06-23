// app/api/uploadthing/core.ts

import { createUploadthing } from "uploadthing/next";
import { createRouteHandler } from 'uploadthing/next';
import type { FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Replace imageUploader with avatar and banner
  avatar: f({ image: { maxFileSize: "1MB" } })
    .middleware(async () => {
      // Add auth check here if needed
      return { userId: "user_123" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload complete for userId:", metadata.userId);
      console.log("Avatar file url:", file.url);
    }),
    
  banner: f({ image: { maxFileSize: "4MB" } }) // <-- Make sure this says "4MB"
    .middleware(async () => {
      // Add auth check here if needed  
      return { userId: "user_123" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Banner upload complete for userId:", metadata.userId);
      console.log("Banner file url:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
