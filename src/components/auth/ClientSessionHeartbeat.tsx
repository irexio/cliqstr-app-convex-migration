'use client';

import { useEffect } from 'react';

export default function ClientSessionHeartbeat() {
  useEffect(() => {
    const secs = Number(process.env.NEXT_PUBLIC_HEARTBEAT_SECONDS ?? 60);
    const beat = () => {
      try {
        navigator.sendBeacon('/api/heartbeat');
      } catch {}
    };
    const id = window.setInterval(beat, secs * 1000);

    const handleUnload = () => {
      try {
        navigator.sendBeacon('/api/sign-out');
      } catch {}
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return null;
}


