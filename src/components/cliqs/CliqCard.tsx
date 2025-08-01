'use client';

// 🔐 APA-HARDENED — Cliq Card for Dashboard View
import Link from 'next/link';
import Image from 'next/image';
import BaseCard from './BaseCard';
import { CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/Button';
import InviteModal from '@/components/cliqs/InviteModal';
import MembersModal from '@/components/cliqs/MembersModal';
import { useState, useEffect, useRef } from 'react';

interface CliqCardProps {
  cliq: {
    id: string;
    name: string;
    description?: string | null;
    privacy: string;
    coverImage?: string | null;
    ownerId?: string;
  };
  currentUserId?: string;
  onDelete?: (cliqId: string) => void;
}

export default function CliqCard({ cliq, currentUserId, onDelete }: CliqCardProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if current user is the owner
  const isOwner = currentUserId && cliq.ownerId === currentUserId;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setManageDropdownOpen(false);
      }
    }

    if (manageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [manageDropdownOpen]);

  const handleDelete = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${cliq.name}"?\n\nThis action cannot be undone. All posts and data in this cliq will be permanently removed.`
    );
    
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      console.log('Deleting cliq:', cliq.id);
      const response = await fetch(`/api/cliqs/${cliq.id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      const responseData = await response.json();
      console.log('Delete response data:', responseData);

      if (response.ok && responseData.success) {
        console.log('Cliq deleted successfully');
        // Close dropdown immediately
        setManageDropdownOpen(false);
        // Call the onDelete callback to remove from parent state
        if (onDelete) {
          onDelete(cliq.id);
        } else {
          // Fallback to page refresh if no callback provided
          window.location.reload();
        }
      } else {
        console.error('Delete failed:', responseData);
        alert(`Failed to delete cliq: ${responseData.error || 'Unknown error'}`);
        setManageDropdownOpen(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting cliq');
      setManageDropdownOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BaseCard className="p-0 group hover:shadow-lg transition-shadow relative">
      {/* Card Clickable Area */}
      <Link href={`/cliqs/${cliq.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary">
        {/* Cover Image or Gradient */}
        {cliq.coverImage ? (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={cliq.coverImage}
              alt={`${cliq.name} banner image`}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300" />
        )}
        <div className="p-6">
          <CardTitle className="text-xl font-bold mb-1">{cliq.name}</CardTitle>
          <p className="text-sm text-gray-500 mb-3 capitalize">{cliq.privacy} Cliq</p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {cliq.description || 'I like to socialize in private. You? If so, welcome to Cliqstr.com'}
          </p>
        </div>
      </Link>
      {/* Action Buttons */}
      <div className="flex items-center justify-between px-6 pb-6">
        {/* View Button */}
        <Link href={`/cliqs/${cliq.id}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span className="text-sm font-medium">View</span>
        </Link>
        
        {/* Invite Button */}
        <button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="text-sm font-medium">Invite</span>
        </button>
        
        {/* Manage Dropdown (Owner Only) OR Members Button (Non-Owner) */}
        {isOwner ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51 1.51 1.65 1.65 0 0 0-.33 1.82l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82"></path>
              </svg>
              <span className="text-sm font-medium">Manage</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${manageDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {manageDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setMembersModalOpen(true);
                      setManageDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Manage Members
                  </button>
                  
                  <Link 
                    href={`/cliqs/${cliq.id}/edit`}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setManageDropdownOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Cliq Settings
                  </Link>
                  
                  <hr className="my-1" />
                  
                  <button 
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors text-red-600 hover:bg-red-50 ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    {deleting ? 'Deleting...' : 'Delete Cliq'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Members Button for Non-Owners */
          <button onClick={() => setMembersModalOpen(true)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="text-sm font-medium">Members</span>
          </button>
        )}
      </div>
      <InviteModal cliqId={cliq.id} open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
      <MembersModal cliqId={cliq.id} open={membersModalOpen} onClose={() => setMembersModalOpen(false)} />
    </BaseCard>
  );
}
