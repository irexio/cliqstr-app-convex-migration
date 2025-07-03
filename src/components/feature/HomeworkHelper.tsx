'use client';

import { BookOpen } from 'lucide-react';

interface HomeworkHelpProps {
  user: {
    id: string;
    role: string;
    age?: number;
  };
  cliqId?: string;
}

export function HomeworkHelp({ user, cliqId }: HomeworkHelpProps) {
  const handleClick = () => {
    console.log('Homework help requested by:', {
      userId: user.id,
      role: user.role,
      age: user.age,
      cliqId,
    });
    // Future implementation: Open a homework help modal or navigate to homework page
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-4 border border-blue-300 rounded-2xl shadow hover:shadow-md transition bg-blue-50 text-blue-700"
    >
      <BookOpen className="w-6 h-6 mb-2" />
      <span className="text-sm font-semibold">Homework Help</span>
    </button>
  );
}
