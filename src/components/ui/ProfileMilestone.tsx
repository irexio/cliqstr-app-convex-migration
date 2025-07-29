'use client';

import { useEffect, useState } from 'react';
import { checkMilestone, PROFILE_MILESTONES } from '@/lib/utils/profileUtils';
import { X, Star } from 'lucide-react';

interface ProfileMilestoneProps {
  oldPercentage: number;
  newPercentage: number;
  onDismiss?: () => void;
}

export function ProfileMilestone({ oldPercentage, newPercentage, onDismiss }: ProfileMilestoneProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [milestone, setMilestone] = useState<typeof PROFILE_MILESTONES[0] | null>(null);

  useEffect(() => {
    const achievedMilestone = checkMilestone(oldPercentage, newPercentage);
    if (achievedMilestone) {
      setMilestone(achievedMilestone);
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [oldPercentage, newPercentage]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Wait for animation
  };

  if (!milestone || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
            <Star className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              {milestone.reward}
            </h3>
            <p className="text-sm opacity-90">
              {milestone.message}
            </p>
            <div className="mt-2 text-xs opacity-75">
              Profile {milestone.percentage}% complete
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing milestone celebrations
export function useMilestoneTracker() {
  const [milestones, setMilestones] = useState<Array<{
    id: string;
    oldPercentage: number;
    newPercentage: number;
  }>>([]);

  const celebrateMilestone = (oldPercentage: number, newPercentage: number) => {
    const milestone = checkMilestone(oldPercentage, newPercentage);
    if (milestone) {
      const id = `milestone-${Date.now()}`;
      setMilestones(prev => [...prev, { id, oldPercentage, newPercentage }]);
    }
  };

  const dismissMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  return {
    milestones,
    celebrateMilestone,
    dismissMilestone
  };
}
