'use client';

import React, { useState } from 'react';
import { 
  CalendarIcon, 
  Gamepad2Icon, 
  VideoIcon, 
  GraduationCapIcon, 
  BotIcon, 
  AlertCircleIcon 
} from 'lucide-react';
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

  const tools = [
    {
      icon: CalendarIcon,
      label: 'Calendar',
      onClick: () => console.log('Calendar clicked'),
    },
    {
      icon: Gamepad2Icon,
      label: 'Games',
      onClick: () => console.log('Games clicked'),
    },
    {
      icon: VideoIcon,
      label: 'Video Chat',
      onClick: () => console.log('Video Chat clicked'),
    },
    {
      icon: GraduationCapIcon,
      label: 'Homework Help',
      onClick: () => console.log('Homework Help clicked'),
    },
    {
      icon: BotIcon,
      label: 'Help (Pip)',
      onClick: () => console.log('Help clicked'),
    },
  ];

  return (
    <>
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Cliq Tools</h2>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 justify-items-center mt-4">
        {/* Regular Tools */}
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <button
              key={tool.label}
              onClick={tool.onClick}
              className="p-4 rounded-2xl bg-white border border-gray-200 text-gray-800 flex flex-col items-center w-24 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <IconComponent className="h-6 w-6 mb-2 text-black" />
              <span className="text-sm font-medium text-center">{tool.label}</span>
            </button>
          );
        })}
        
        {/* Red Alert Tool */}
        <button
          onClick={() => setDialogOpen(true)}
          className="p-4 rounded-2xl bg-red-600 text-white flex flex-col items-center w-24 hover:bg-red-700 transition-colors"
        >
          <AlertCircleIcon className="h-6 w-6 mb-2" />
          <span className="text-sm font-semibold text-center">Red Alert</span>
        </button>
      </div>

      {/* Red Alert Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>🚨 Red Alert Confirmation</DialogTitle>
          <DialogDescription className="space-y-3">
            <p className="font-medium text-gray-900">
              Is this a real emergency that requires immediate help?
            </p>
            <p className="text-sm text-gray-600">
              Or did you click this accidentally?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Only confirm if this is a real emergency.</strong> This will immediately notify parents and log an emergency alert for this cliq.
              </p>
            </div>
          </DialogDescription>
          {error && <div className="text-red-600 text-sm mb-2 p-2 bg-red-50 rounded">{error}</div>}
          <div className="flex gap-3 justify-end mt-6">
            <button
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              I clicked accidentally
            </button>
            <button
              className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold shadow-lg transition-colors"
              onClick={handleRedAlert}
              disabled={loading}
            >
              {loading ? 'Sending Alert...' : 'Yes, this is a real emergency'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

