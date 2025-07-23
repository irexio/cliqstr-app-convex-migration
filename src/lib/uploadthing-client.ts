import { generateReactHelpers } from "@uploadthing/react";
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Configure UploadThing to include credentials (cookies) with requests
export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>({
    // Ensure cookies are sent with requests
    url: "/api/uploadthing",
  });

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// Override the default fetch to include credentials
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('/api/uploadthing')) {
      // Ensure credentials are included for uploadthing requests
      if (args[1]) {
        args[1] = { ...args[1], credentials: 'include' };
      } else {
        args[1] = { credentials: 'include' };
      }
    }
    return originalFetch.apply(this, args);
  };
}