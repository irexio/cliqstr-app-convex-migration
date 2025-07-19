'use client';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with customizable size and color
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className = ''
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Color mapping
  const colorMap = {
    primary: 'text-purple-600',
    white: 'text-white'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeMap[size]} ${colorMap[color]}`}></div>
    </div>
  );
}
