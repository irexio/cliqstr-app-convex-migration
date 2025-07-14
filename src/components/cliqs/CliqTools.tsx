'use client';

import React, { useState } from 'react';
import { CalendarIcon, Gamepad2Icon, VideoIcon, BotIcon, AlertTriangleIcon } from 'lucide-react';
import {
  AlertDialog as Dialog,
  AlertDialogContent as DialogContent,
  AlertDialogTitle as DialogTitle,
  AlertDialogDescription as DialogDescription
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

export default function CliqTools({ cliqId }: { cliqId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRedAlert() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/red-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliqId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send alert');
        return;
      }
      setDialogOpen(false);
      toast({
        title: 'Red Alert sent',
        description: data.notified ? 'Parents have been notified.' : 'No parents found. Alert escalated to moderation.',
      });
    } catch (e: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t pt-6 mt-10 flex justify-around items-center gap-4">
      {/* Feature icons - bold black, improved style, except Red Alert */}
      <button
        title="Calendar"
        className="flex flex-col items-center text-xs font-semibold text-black hover:bg-gray-100 transition rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c032d1]"
      >
        <CalendarIcon className="w-7 h-7 mb-1" />
        Calendar
      </button>

      <button
        title="Games"
        className="flex flex-col items-center text-xs font-semibold text-black hover:bg-gray-100 transition rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c032d1]"
      >
        <Gamepad2Icon className="w-7 h-7 mb-1" />
        Games
      </button>

      <button
        title="Video Chat"
        className="flex flex-col items-center text-xs font-semibold text-black hover:bg-gray-100 transition rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c032d1]"
      >
        <VideoIcon className="w-7 h-7 mb-1" />
        Video
      </button>

      <button
        title="Homework Help"
        className="flex flex-col items-center text-xs font-semibold text-black hover:bg-gray-100 transition rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c032d1]"
      >
        <BotIcon className="w-7 h-7 mb-1" />
        Help
      </button>

      {/* Red Alert Button with confirmation dialog */}
      <>
        <button
          title="Red Alert"
          className="flex flex-col items-center text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          style={{ boxShadow: '0 4px 16px rgba(220,38,38,0.15)' }}
          onClick={() => setDialogOpen(true)}
        >
          <AlertTriangleIcon className="w-8 h-8 mb-1" />
          <span className="mt-1">Alert</span>
        </button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogTitle>Trigger Red Alert?</DialogTitle>
            <DialogDescription>
              This will immediately notify parents and log an emergency alert for this cliq. Use only if you need urgent help or intervention.
            </DialogDescription>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex gap-4 justify-end mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-black hover:bg-gray-200"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-bold shadow"
                onClick={handleRedAlert}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Alert'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
}

