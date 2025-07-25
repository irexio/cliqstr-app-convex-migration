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
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' && input.includes('/api/uploadthing')) {
      // Ensure credentials are included for uploadthing requests
      init = { ...init, credentials: 'include' };
    }
    return originalFetch(input, init);
  };
}