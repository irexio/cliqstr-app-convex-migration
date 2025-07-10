'use client';

import React from 'react';
import { CalendarIcon, Gamepad2Icon, VideoIcon, BotIcon, AlertTriangleIcon } from 'lucide-react';

export default function CliqTools({ cliqId }: { cliqId: string }) {
  return (
    <div className="border-t pt-6 mt-10 flex justify-around items-center gap-4">
      {/* Feature icons - black icons except Red Alert */}

      <button title="Calendar" className="text-black hover:text-[#c032d1] flex flex-col items-center text-xs">
        <CalendarIcon className="w-6 h-6" />
        Calendar
      </button>

      <button title="Games" className="text-black hover:text-[#c032d1] flex flex-col items-center text-xs">
        <Gamepad2Icon className="w-6 h-6" />
        Games
      </button>

      <button title="Video Chat" className="text-black hover:text-[#c032d1] flex flex-col items-center text-xs">
        <VideoIcon className="w-6 h-6" />
        Video
      </button>

      <button title="Homework Help" className="text-black hover:text-[#c032d1] flex flex-col items-center text-xs">
        <BotIcon className="w-6 h-6" />
        Help
      </button>

      <button title="Red Alert" className="text-red-600 hover:text-red-800 flex flex-col items-center text-xs font-semibold">
        <AlertTriangleIcon className="w-6 h-6" />
        Alert
      </button>
    </div>
  );
}
