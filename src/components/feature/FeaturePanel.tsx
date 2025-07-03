'use client';

import { RedAlert } from './RedAlert';
import { HomeworkHelp } from './HomeworkHelper';
import { useRouter } from 'next/navigation';

interface FeaturePanelProps {
  user: {
    id: string;
    role: string;
    age?: number;
  };
  cliqId?: string;
}

export default function FeaturePanel({ user, cliqId }: FeaturePanelProps) {
  const router = useRouter();

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Features</h2>

      <div className="grid grid-cols-2 gap-4">
        <RedAlert user={user} cliqId={cliqId} />
        <HomeworkHelp user={user} cliqId={cliqId} />

        <button
          onClick={() => router.push('/calendar')}
          className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-2xl shadow hover:shadow-md transition"
        >
          <span className="text-2xl">🗓</span>
          <span className="text-sm mt-2">Calendar</span>
        </button>

        <button
          onClick={() => router.push('/games')}
          className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-2xl shadow hover:shadow-md transition"
        >
          <span className="text-2xl">🎮</span>
          <span className="text-sm mt-2">Games</span>
        </button>
      </div>
    </section>
  );
}
