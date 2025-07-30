import { generateReactHelpers } from '@uploadthing/react';
import { generateUploadButton, generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

// ✅ APA-Safe: Server-side secret authentication (no client tokens needed)
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: process.env.NODE_ENV === 'production' 
    ? 'https://cliqstr.com/api/uploadthing'
    : '/api/uploadthing'
});

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: process.env.NODE_ENV === 'production' 
    ? 'https://cliqstr.com/api/uploadthing'
    : '/api/uploadthing'
});

export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: process.env.NODE_ENV === 'production' 
    ? 'https://cliqstr.com/api/uploadthing'
    : '/api/uploadthing'
});