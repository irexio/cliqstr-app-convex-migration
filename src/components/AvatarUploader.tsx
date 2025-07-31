'use client';

import { useState } from 'react';
import { UploadButton } from '@/lib/uploadthing-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarUploaderProps {
  currentImage?: string | null;
  userName?: string;
  onImageChange?: (url: string | null) => void;
}

export default function AvatarUploader({ 
  currentImage, 
  userName = 'User',
  onImageChange 
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const displayImage = uploadedImage || currentImage;
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleUploadSuccess = async (res: any[]) => {
    try {
      const uploadedUrl = res[0]?.url;
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload');
      }

      setUploadedImage(uploadedUrl);
      setMessage({ type: 'success', text: 'Avatar uploaded! Save the form to apply changes.' });
      
      // Notify parent component of the new image URL
      onImageChange?.(uploadedUrl);
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload avatar' });
      
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
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg border">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Photo</h3>
        
        {/* Avatar Preview */}
        <div className="mb-4">
          <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
            <AvatarImage src={displayImage || undefined} alt="Profile photo" />
            <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <UploadButton
            endpoint="avatar"
            onClientUploadComplete={handleUploadSuccess}
            onUploadError={handleUploadError}
            onUploadBegin={() => {
              setIsUploading(true);
              setMessage(null);
            }}
            appearance={{
              button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors",
              allowedContent: "text-xs text-gray-500 mt-1"
            }}
          />
        </div>

        {/* Loading State */}
        {isUploading && (
          <div className="mt-3 text-sm text-blue-600 font-medium">
            Uploading avatar...
          </div>
        )}

        {/* Success/Error Messages */}
        {message && (
          <div className={`mt-3 p-2 rounded-md text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          JPG or PNG files only, max 1MB
        </p>
      </div>
    </div>
  );
}
