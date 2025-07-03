'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface RedAlertProps {
  user: {
    id: string;
    role: string;
    age?: number;
  };
  cliqId?: string;
}

export function RedAlert({ user, cliqId }: RedAlertProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleAlert = async () => {
    try {
      // Simulated alert trigger (replace with real API later)
      console.log('🚨 RED ALERT TRIGGERED:', {
        userId: user.id,
        role: user.role,
        age: user.age,
        cliqId,
        timestamp: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Red alert failed', error);
    }
  };

  return (
    <button
      onClick={handleAlert}
      className="flex flex-col items-center justify-center p-4 border border-red-300 rounded-2xl shadow hover:shadow-md transition bg-red-50 text-red-700"
    >
      <AlertTriangle className="w-6 h-6 mb-2" />
      <span className="text-sm font-semibold">
        {submitted ? 'Alert Sent' : 'Red Alert'}
      </span>
    </button>
  );
}
