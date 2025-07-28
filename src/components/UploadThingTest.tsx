'use client';

import React, { useState } from 'react';
import { UploadButton, UploadDropzone } from '@/lib/uploadthing-client';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export default function UploadThingTest() {
  const [uploadStatus, setUploadStatus] = useState<string>('Ready to test');
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">UploadThing Diagnostic Test</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Status:</strong> {uploadStatus}
      </div>

      {uploadedUrl && (
        <div className="mb-4 p-3 bg-green-100 rounded">
          <strong>Uploaded URL:</strong> <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{uploadedUrl}</a>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 1: Upload Button (Avatar)</h3>
          <UploadButton
            endpoint="avatar"
            onClientUploadComplete={(res) => {
              console.log('Upload complete:', res);
              setUploadStatus('Upload completed successfully!');
              if (res?.[0]?.url) {
                setUploadedUrl(res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              console.error('Upload error:', error);
              setUploadStatus(`Upload failed: ${error.message}`);
            }}
            onUploadBegin={(name) => {
              console.log('Upload beginning:', name);
              setUploadStatus(`Starting upload: ${name}`);
            }}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Test 2: Upload Dropzone (Banner)</h3>
          <UploadDropzone
            endpoint="banner"
            onClientUploadComplete={(res) => {
              console.log('Dropzone upload complete:', res);
              setUploadStatus('Dropzone upload completed successfully!');
              if (res?.[0]?.url) {
                setUploadedUrl(res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              console.error('Dropzone upload error:', error);
              setUploadStatus(`Dropzone upload failed: ${error.message}`);
            }}
            onUploadBegin={(name) => {
              console.log('Dropzone upload beginning:', name);
              setUploadStatus(`Starting dropzone upload: ${name}`);
            }}
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h4 className="font-semibold">Debug Info:</h4>
        <ul className="text-sm mt-2 space-y-1">
          <li>• Check browser console for detailed logs</li>
          <li>• Check Network tab for API requests</li>
          <li>• Verify you're logged in (UploadThing requires authentication)</li>
          <li>• Environment: {process.env.NODE_ENV}</li>
        </ul>
      </div>
    </div>
  );
}
