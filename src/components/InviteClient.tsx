'use client';

// Force fresh deployment - child button fix
/**
 * 🔐 APA-HARDENED COMPONENT: InviteClient
 *
 * Used in: /cliqs/[id]/invite/page.tsx
 *
 * Purpose:
 *   - Renders the redesigned invite form for the new invite flow
 *   - Supports inviting adults directly and children via trusted adults
 *   - Submits invite data to /api/invite/create
 *   - Displays success or error messages
 *
 * Notes:
 *   - Requires a valid `cliqId` prop (string)
 *   - Uses fetch POST with JSON payload
 *   - No direct use of inviterId (auth handled server-side)
 *   - Collects different information based on inviteType (child vs adult)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InviteClientProps {
  cliqId: string;
}

export default function InviteClient({ cliqId }: InviteClientProps) {
  const router = useRouter();

  // New state variables for redesigned invite form
  const [inviteType, setInviteType] = useState<'child' | 'adult'>('adult');
  const [friendFirstName, setFriendFirstName] = useState('');
  const [trustedAdultContact, setTrustedAdultContact] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [adultEmail, setAdultEmail] = useState('');
  const [error, setError] = useState('');
  const [successType, setSuccessType] = useState<'invite' | 'request' | ''>('');
  const [loading, setLoading] = useState(false);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [canInviteChildren, setCanInviteChildren] = useState(false);

  // Fetch user's age and permissions on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            // Calculate age from birthdate
            const birthdate = new Date(data.profile.birthdate);
            const today = new Date();
            const age = today.getFullYear() - birthdate.getFullYear();
            setUserAge(age);
            
            // Check if user can invite children (for teens 13+)
            if (data.profile.childSettings) {
              setCanInviteChildren(data.profile.childSettings.canInviteChildren || false);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessType('');

    try {
      // Determine which email to use based on invite type
      const targetEmail = inviteType === 'child' ? trustedAdultContact : adultEmail;
      
      // Validate required fields based on invite type
      if (inviteType === 'child') {
        if (!friendFirstName) {
          throw new Error("Child's first name is required");
        }
        if (!trustedAdultContact) {
          throw new Error("Parent/guardian email is required");
        }
      } else if (!adultEmail) {
        throw new Error("Email address is required");
      }
      
      const response = await fetch('/api/invite/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliqId,
          inviteeEmail: targetEmail,  // For backward compatibility
          inviteType,
          friendFirstName: inviteType === 'child' ? friendFirstName : undefined,
          trustedAdultContact: inviteType === 'child' ? trustedAdultContact : undefined,
          inviteNote: inviteNote || undefined,
        }),
      });

      const data = await response.json();
      console.log('Invite response:', data);

      // Handle different response status codes with user-friendly messages
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.error || 'Please check the form fields');
        } else if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error('You don\'t have permission to invite to this cliq.');
        } else if (response.status === 404) {
          throw new Error('This cliq could not be found. It may have been deleted.');
        } else if (response.status === 409) {
          // This is actually a success case - the invite already exists
          setSuccessType(data.type || 'invite');
          resetForm();
          return;
        } else {
          throw new Error(data.error || 'Unexpected error. Please try again later.');
        }
      }

      // Handle success responses
      if (data.message === 'Invite already exists') {
        setSuccessType(data.type);
        resetForm();
        setError('This person has already been invited to this cliq.');
      } else if (data.type === 'request' || data.type === 'invite') {
        setSuccessType(data.type);
        resetForm();
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err: any) {
      console.error('Invite error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to reset form fields
  const resetForm = () => {
    if (inviteType === 'child') {
      setFriendFirstName('');
      setTrustedAdultContact('');
    } else {
      setAdultEmail('');
    }
    setInviteNote('');
  };

  // Determine if user can invite children based on age
  const canShowChildInviteOption = userAge === null || userAge >= 18;
  const canActuallyInviteChildren = userAge === null || userAge >= 18; // Allow adults to invite children
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Who are you inviting?</Label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="inviteType"
              value="adult"
              checked={inviteType === 'adult'}
              onChange={() => setInviteType('adult')}
            />
            Adult
          </label>
          <label className={`flex items-center gap-2 ${!canShowChildInviteOption ? 'opacity-50' : ''}`}>
            <input
              type="radio"
              name="inviteType"
              value="child"
              checked={inviteType === 'child'}
              onChange={() => setInviteType('child')}
              disabled={!canActuallyInviteChildren}
            />
            Child
          </label>
        </div>
        {userAge !== null && userAge < 18 && (
          <p className="text-amber-600 text-xs mt-1">Only adults (18+) can invite children</p>
        )}
      </div>

      {inviteType === 'child' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> Please enter the parent/guardian's email address. 
            They will receive the invitation and can approve their child's participation.
          </p>
        </div>
      )}

      {inviteType === 'adult' ? (
        <div>
          <Label htmlFor="adultEmail">Adult's Email</Label>
          <Input
            id="adultEmail"
            type="email"
            value={adultEmail}
            onChange={(e) => setAdultEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Adults will need to verify their age during account creation
          </p>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="friendFirstName">Child's First Name</Label>
            <Input
              id="friendFirstName"
              type="text"
              value={friendFirstName}
              onChange={(e) => setFriendFirstName(e.target.value)}
              placeholder="First name only"
              required
            />
          </div>
          <div>
            <Label htmlFor="trustedAdultContact">Parent/Guardian Email</Label>
            <Input
              id="trustedAdultContact"
              type="email"
              value={trustedAdultContact}
              onChange={(e) => setTrustedAdultContact(e.target.value)}
              placeholder="parent@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send the invite to their parent/guardian for approval
            </p>
          </div>
        </>
      )}
      
      <div>
        <Label htmlFor="inviteNote">Optional Message</Label>
        <Textarea
          id="inviteNote"
          value={inviteNote}
          onChange={(e) => setInviteNote(e.target.value)}
          placeholder={inviteType === 'child' 
            ? "Add a note to the parent/guardian" 
            : "Add a personal message"}
          className="h-20"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {successType && (
        <p className="text-green-600 text-sm">
          {successType === 'invite' 
            ? 'Invite sent!' 
            : inviteType === 'child'
              ? 'Invite sent to parent for approval!'
              : 'Invite sent successfully!'}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Invite'}
      </Button>
    </form>
  );
}
