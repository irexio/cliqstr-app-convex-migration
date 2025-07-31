'use client';

import { useState } from 'react';
import { UploadButton } from '@/lib/uploadthing-client';

interface BannerUploaderProps {
  currentBanner?: string | null;
  onBannerChange?: (url: string | null) => void;
}

export default function BannerUploader({ 
  currentBanner, 
  onBannerChange 
}: BannerUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedBanner, setUploadedBanner] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  const displayBanner = uploadedBanner || currentBanner;

  const handleUploadSuccess = async (res: any[]) => {
    try {
      const uploadedUrl = res[0]?.url;
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload');
      }

      setUploadedBanner(uploadedUrl);
      setMessage({ type: 'success', text: 'Banner uploaded! Save the form to apply changes.' });
      
      // Notify parent component of the new banner URL
      onBannerChange?.(uploadedUrl);
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Banner upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload banner' });
      
      // Clear error message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };



  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    setIsUploading(false);
    
    // Clear error message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="flex flex-col space-y-4 p-6 bg-gray-50 rounded-lg border">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Banner Image</h3>
        
        {/* Banner Preview */}
        <div className="mb-4">
          <div className="w-full max-w-md mx-auto aspect-[3/1] bg-gray-200 rounded-lg border-4 border-white shadow-lg overflow-hidden">
            {displayBanner ? (
              <img 
                src={displayBanner} 
                alt="Profile banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-2xl mb-1">🖼️</div>
                  <div className="text-sm">No banner image</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center mb-3">
          <UploadButton
            endpoint="banner"
            onClientUploadComplete={handleUploadSuccess}
            onUploadError={handleUploadError}
            onUploadBegin={() => {
              setIsUploading(true);
              setMessage(null);
            }}
            appearance={{
              button: "bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors",
              allowedContent: "text-xs text-gray-500 mt-1"
            }}
          />
        </div>



        {/* Loading State */}
        {isUploading && (
          <div className="mb-3 text-sm text-blue-600 font-medium">
            Uploading banner...
          </div>
        )}

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-3 p-2 rounded-md text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <p className="text-xs text-gray-500">
          JPG or PNG files only, max 4MB. Recommended size: 900x300px
        </p>
      </div>
    </div>
  );
}
