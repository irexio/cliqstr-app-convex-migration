import { generateReactHelpers } from '@uploadthing/react';
import { generateUploadButton, generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

// ✅ APA-Safe: Explicit endpoint configuration for production
const config = {
  url: '/api/uploadthing',
};

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>(config);

export const UploadButton = generateUploadButton<OurFileRouter>(config);
export const UploadDropzone = generateUploadDropzone<OurFileRouter>(config);