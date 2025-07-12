'use client';

import React from 'react';
import { CalendarIcon, Gamepad2Icon, VideoIcon, BotIcon, AlertTriangleIcon } from 'lucide-react';

export default function CliqTools({ cliqId }: { cliqId: string }) {
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

      <button
        title="Red Alert"
        className="flex flex-col items-center text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-red-400"
        style={{ boxShadow: '0 4px 16px rgba(220,38,38,0.15)' }}
      >
        <AlertTriangleIcon className="w-8 h-8 mb-1" />
        <span className="mt-1">Alert</span>
      </button>
    </div>
  );
}

