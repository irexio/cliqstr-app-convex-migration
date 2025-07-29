import { generateReactHelpers } from "@uploadthing/react";
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Configure UploadThing helpers - Fixed version without global fetch override
export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>({
    url: "/api/uploadthing"
  });

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();