"use client";

import { useState, useEffect } from "react";

interface BirthdayVisibilityProps {
  isMinor: boolean;
  initialShowMonthDay: boolean;
  initialShowYear: boolean;
  onSave: (settings: { showMonthDay: boolean; showYear: boolean }) => void;
}

export default function BirthdayVisibilitySettings({
  isMinor,
  initialShowMonthDay,
  initialShowYear,
  onSave,
}: BirthdayVisibilityProps) {
  const [showMonthDay, setShowMonthDay] = useState(initialShowMonthDay);
  const [showYear, setShowYear] = useState(initialShowYear);

  // Enforce rule: minors can never show year
  useEffect(() => {
    if (isMinor) {
      setShowYear(false);
    }
  }, [isMinor]);

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-3">Birthday Settings</h2>

      {/* Show month/day toggle */}
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium">Show my birthday to cliq members</label>
        <input
          type="checkbox"
          checked={showMonthDay}
          onChange={(e) => setShowMonthDay(e.target.checked)}
          className="h-4 w-4"
        />
      </div>

      {/* Show year toggle (adults only) */}
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium">
          Show my birth year
          {isMinor && (
            <span className="ml-2 text-xs text-gray-500">(Disabled for minors)</span>
          )}
        </label>
        <input
          type="checkbox"
          checked={showYear}
          disabled={isMinor}
          onChange={(e) => setShowYear(e.target.checked)}
          className="h-4 w-4 disabled:opacity-50"
        />
      </div>

      <button
        onClick={() => onSave({ showMonthDay, showYear })}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Save Settings
      </button>
    </div>
  );
}
