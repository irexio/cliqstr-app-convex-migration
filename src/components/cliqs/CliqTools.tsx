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
    <>
      {/* Cliq Tools Section */}
      <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Cliq Tools</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <button className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:border-black hover:bg-gray-50">
            <div className="w-6 h-6 bg-black rounded mb-2"></div>
            <span className="text-xs text-gray-600 font-medium">Calendar</span>
          </button>
          
          <button className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:border-black hover:bg-gray-50">
            <div className="w-6 h-6 bg-black rounded mb-2"></div>
            <span className="text-xs text-gray-600 font-medium">Games</span>
          </button>
          
          <button className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:border-black hover:bg-gray-50">
            <div className="w-6 h-6 bg-black rounded mb-2"></div>
            <span className="text-xs text-gray-600 font-medium">Video Chat</span>
          </button>
          
          <button className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:border-black hover:bg-gray-50">
            <div className="w-6 h-6 bg-black rounded mb-2"></div>
            <span className="text-xs text-gray-600 font-medium">Photo Album</span>
          </button>
          
          <button className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:border-black hover:bg-gray-50">
            <div className="w-6 h-6 bg-black rounded mb-2"></div>
            <span className="text-xs text-gray-600 font-medium">Polls</span>
          </button>
          
          <button className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:border-black hover:bg-gray-50">
            <div className="w-6 h-6 bg-black rounded mb-2"></div>
            <span className="text-xs text-gray-600 font-medium">Events</span>
          </button>
        </div>
      </section>

      {/* Red Alert Section */}
      <section className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
        <div className="text-red-800 text-sm font-medium flex-1">
          🚨 Red Alert: New safety feature available - enable content filters for younger members
        </div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
          onClick={() => setDialogOpen(true)}
        >
          Send Alert
        </button>
      </section>

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
  );
}

