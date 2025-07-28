'use client';

import React, { useState } from 'react';

export default function SimpleUploadTest() {
  const [status, setStatus] = useState('Ready');

  const testUploadThingConnection = async () => {
    try {
      setStatus('Testing UploadThing connection...');
      
      const response = await fetch('/api/uploadthing', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.text();
        setStatus(`✅ UploadThing API is working! Response: ${data.substring(0, 100)}...`);
      } else {
        setStatus(`❌ UploadThing API failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(`❌ Connection error: ${(error as Error).message}`);
    }
  };

  const testAuthentication = async () => {
    try {
      setStatus('Testing authentication...');
      
      const response = await fetch('/api/auth/status');
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setStatus(`✅ Authenticated as: ${data.user.email} (Profile: ${data.user.myProfile?.username || 'None'})`);
        } else {
          setStatus('❌ Not authenticated');
        }
      } else {
        setStatus(`❌ Auth check failed: ${response.status}`);
      }
    } catch (error) {
      setStatus(`❌ Auth error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Simple Upload Diagnostics</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Status:</strong> {status}
      </div>

      <div className="space-y-4">
        <button
          onClick={testAuthentication}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          1. Test Authentication
        </button>
        
        <button
          onClick={testUploadThingConnection}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          2. Test UploadThing API
        </button>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h4 className="font-semibold">Environment Check:</h4>
        <ul className="text-sm mt-2 space-y-1">
          <li>• Node ENV: {process.env.NODE_ENV}</li>
          <li>• Has UPLOADTHING_SECRET: {process.env.UPLOADTHING_SECRET ? '✅ Yes' : '❌ No'}</li>
          <li>• Has UPLOADTHING_APP_ID: {process.env.UPLOADTHING_APP_ID ? '✅ Yes' : '❌ No'}</li>
        </ul>
      </div>
    </div>
  );
}
