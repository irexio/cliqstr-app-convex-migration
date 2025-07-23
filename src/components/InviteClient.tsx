'use client';

/**
 * 🔐 APA-HARDENED COMPONENT: InviteClient
 *
 * Used in: /cliqs/[id]/invite/page.tsx
 *
 * Purpose:
 *   - Renders the redesigned invite form with new field structure
 *   - Supports two invite types: 'child' and 'adult'
 *   - For child invites: collects friend's name and trusted adult contact
 *   - For adult invites: collects adult's email directly
 *   - Submits invite data to /api/invite/create with new branded codes
 *
 * New Form Fields:
 *   - friendFirstName: string (required for child invites)
 *   - trustedAdultContact: string (required email for child invites)
 *   - inviteType: 'child' | 'adult' (required radio selection)
 *   - inviteNote?: string (optional message)
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InviteClientProps {
  cliqId: string;
}

export default function InviteClient({ cliqId }: InviteClientProps) {
  // New simplified state for redesigned invite form
  const [friendFirstName, setFriendFirstName] = useState('');
  const [trustedAdultContact, setTrustedAdultContact] = useState('');
  const [inviteType, setInviteType] = useState<'child' | 'adult' | ''>(''); // Must be explicitly selected
  const [inviteNote, setInviteNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate required fields
      if (!inviteType) {
        throw new Error('Please select who this invite is for');
      }

      if (inviteType === 'child') {
        if (!friendFirstName.trim()) {
          throw new Error("Child's first name is required");
        }
        if (!trustedAdultContact.trim()) {
          throw new Error('Parent/guardian email is required');
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trustedAdultContact)) {
          throw new Error('Please enter a valid email address');
        }
      } else if (inviteType === 'adult') {
        if (!trustedAdultContact.trim()) {
          throw new Error('Adult email is required');
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trustedAdultContact)) {
          throw new Error('Please enter a valid email address');
        }
      }

      // Prepare the request payload based on invite type
      const payload: any = {
        cliqId,
        inviteType,
        inviteNote: inviteNote.trim() || undefined,
      };

      if (inviteType === 'child') {
        // Child invites need friendFirstName and trustedAdultContact
        payload.friendFirstName = friendFirstName.trim();
        payload.trustedAdultContact = trustedAdultContact.trim();
      } else {
        // Adult invites need inviteeEmail
        payload.inviteeEmail = trustedAdultContact.trim();
      }

      const response = await fetch('/api/invite/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setSuccess(true);
      // Reset form
      setFriendFirstName('');
      setTrustedAdultContact('');
      setInviteType('');
      setInviteNote('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Required Radio Input */}
      <div>
        <Label className="text-base font-medium">Who is this invite for? *</Label>
        <div className="flex gap-6 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="inviteType"
              value="adult"
              checked={inviteType === 'adult'}
              onChange={() => {
                setInviteType('adult');
                if (!inviteNote || inviteNote === 'Parent or Guardian approval is required. Please click the link to proceed.') {
                  setInviteNote('Join my Cliq on Cliqstr!');
                }
              }}
              className="w-4 h-4"
            />
            <span className="text-sm">Adult (18+)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="inviteType"
              value="child"
              checked={inviteType === 'child'}
              onChange={() => {
                setInviteType('child');
                if (!inviteNote || inviteNote === 'Join my Cliq on Cliqstr!') {
                  setInviteNote('Parent or Guardian approval is required. Please click the link to proceed.');
                }
              }}
              className="w-4 h-4"
            />
            <span className="text-sm">Child (Under 18)</span>
          </label>
        </div>
      </div>

      {/* Child Invite Notice */}
      {inviteType === 'child' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> Please enter the parent/guardian's email address. 
            They will receive the invitation and can approve their child's participation.
          </p>
        </div>
      )}

      {/* Dynamic Form Fields Based on Invite Type */}
      {inviteType === 'child' && (
        <div>
          <Label htmlFor="friendFirstName">Child's First Name *</Label>
          <Input
            id="friendFirstName"
            type="text"
            value={friendFirstName}
            onChange={(e) => setFriendFirstName(e.target.value)}
            placeholder="Enter child's first name"
            required
            className="mt-1"
          />
        </div>
      )}

      {/* Email Field - Label Changes Based on Invite Type */}
      <div>
        <Label htmlFor="trustedAdultContact">
          {inviteType === 'child' ? 'Parent/Guardian Email *' : 'Adult Email *'}
        </Label>
        <Input
          id="trustedAdultContact"
          type="email"
          value={trustedAdultContact}
          onChange={(e) => setTrustedAdultContact(e.target.value)}
          placeholder={inviteType === 'child' ? 'parent@example.com' : 'email@example.com'}
          required
          className="mt-1"
        />
        {inviteType === 'adult' && (
          <p className="text-xs text-gray-500 mt-1">
            Adults will need to verify their age during account creation
          </p>
        )}
      </div>

      {/* Optional Message */}
      <div>
        <Label htmlFor="inviteNote">Optional Message</Label>
        <Textarea
          id="inviteNote"
          value={inviteNote}
          onChange={(e) => setInviteNote(e.target.value)}
          placeholder={inviteType === 'child' 
            ? "Add a note to the parent/guardian" 
            : "Add a personal message"}
          className="mt-1 h-20"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-600 text-sm">
            {inviteType === 'child'
              ? 'Invite sent to parent/guardian for approval!'
              : 'Invite sent successfully!'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={loading || !inviteType}
        className="w-full"
      >
        {loading ? 'Sending...' : 'Send Invite'}
      </Button>
    </form>
  );
}
