'use client';

// 🔐 APA-HARDENED — Parent approval form component
// This is part of the APA compliance flow for underage users

import { useState, FormEvent } from 'react';

export default function ParentApprovalForm() {
  const [parentEmail, setParentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate email before submission
    if (!validateEmail(parentEmail)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Send request to your API endpoint for parent verification
      const response = await fetch('/api/parent-approval/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send parent approval request');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Parent approval request error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ...rest of the component JSX
}
