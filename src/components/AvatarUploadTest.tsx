'use client';

import React, { useState } from 'react';
import { UploadButton } from '@/lib/uploadthing-client';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export default function AvatarUploadTest() {
  const [uploadStatus, setUploadStatus] = useState<string>('Ready to test avatar upload');
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleSaveToProfile = async (avatarUrl: string) => {
    try {
      setUploadStatus('Getting current user...');
      
      // First get current user info
      const userResponse = await fetch('/api/auth/status');
      if (!userResponse.ok) {
        throw new Error('Not authenticated');
      }
      const userData = await userResponse.json();
      
      if (!userData.user?.myProfile?.username) {
        throw new Error('No profile found');
      }
      
      setUploadStatus('Saving avatar to profile...');
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.user.myProfile.username,
          image: avatarUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save avatar');
      }

      const result = await response.json();
      setUploadStatus('✅ Avatar saved to profile successfully!');
      console.log('Profile update result:', result);
    } catch (error) {
      console.error('Save error:', error);
      setUploadStatus(`❌ Failed to save avatar: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Avatar Upload Test</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Status:</strong> {uploadStatus}
      </div>

      {uploadedUrl && (
        <div className="mb-4">
          <div className="p-3 bg-green-100 rounded mb-2">
            <strong>Uploaded URL:</strong> 
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">
              {uploadedUrl}
            </a>
          </div>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300">
            <img 
              src={uploadedUrl} 
              alt="Uploaded avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => handleSaveToProfile(uploadedUrl)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save to Profile
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test Avatar Upload</h3>
          <UploadButton
            endpoint="avatar"
            onUploadBegin={(name) => {
              console.log('🚀 [UPLOAD] Avatar upload beginning:', name);
              setUploading(true);
              setUploadStatus(`🚀 Starting upload: ${name}`);
            }}
            onUploadProgress={(progress) => {
              console.log('📊 [UPLOAD] Progress:', progress);
              setUploadStatus(`📊 Uploading: ${progress}%`);
            }}
            onClientUploadComplete={(res) => {
              console.log('✅ [UPLOAD] Avatar upload complete:', res);
              console.log('✅ [UPLOAD] Response details:', JSON.stringify(res, null, 2));
              setUploading(false);
              
              if (res && res.length > 0 && res[0]?.url) {
                const url = res[0].url;
                console.log('✅ [UPLOAD] Setting URL:', url);
                setUploadedUrl(url);
                setUploadStatus(`✅ Upload completed! URL: ${url}`);
              } else {
                console.error('❌ [UPLOAD] No URL in response:', res);
                setUploadStatus('❌ Upload completed but no URL received');
              }
            }}
            onUploadError={(error: Error) => {
              console.error('❌ [UPLOAD] Avatar upload error:', error);
              console.error('❌ [UPLOAD] Error details:', error.message, error.stack);
              setUploading(false);
              setUploadStatus(`❌ Upload failed: ${error.message}`);
            }}
            appearance={{
              button: 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800',
              allowedContent: 'text-sm text-gray-600'
            }}
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h4 className="font-semibold">Debug Steps:</h4>
        <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
          <li>Make sure you're logged in</li>
          <li>Upload an image (should show URL and preview)</li>
          <li>Click "Save to Profile" to test the API</li>
          <li>Check browser console for detailed logs</li>
          <li>Check Network tab for API requests</li>
        </ol>
      </div>
    </div>
  );
}
