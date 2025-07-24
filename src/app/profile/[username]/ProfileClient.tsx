'use client';

import { useState, useCallback } from 'react';
import NewProfileClient from '@/components/NewProfileClient';

interface ProfileClientWrapperProps {
  initialProfile: any;
  initialScrapbookItems: any[];
}

export default function ProfileClientWrapper({ 
  initialProfile, 
  initialScrapbookItems 
}: ProfileClientWrapperProps) {
  const [scrapbookItems, setScrapbookItems] = useState(initialScrapbookItems);

  const handleRefresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/scrapbook/${initialProfile.id}`);
      if (response.ok) {
        const data = await response.json();
        setScrapbookItems(data.items);
      }
    } catch (error) {
      console.error('Error refreshing scrapbook:', error);
    }
  }, [initialProfile.id]);

  return (
    <NewProfileClient
      profile={initialProfile}
      scrapbookItems={scrapbookItems}
      onRefresh={handleRefresh}
    />
  );
}