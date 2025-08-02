'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

interface CliqManageModalProps {
  cliq: {
    id: string;
    name: string;
  };
  open: boolean;
  onClose: () => void;
  onDelete?: (cliqId: string) => void;
  onOpenMembers: () => void;
  isOwner: boolean;
}

export default function CliqManageModal({ 
  cliq, 
  open, 
  onClose, 
  onDelete, 
  onOpenMembers,
  isOwner 
}: CliqManageModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    // First click: show confirmation state
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    
    // Second click: proceed with deletion
    setConfirmDelete(false);
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
        onClose(); // Close modal
        if (onDelete) {
          onDelete(cliq.id); // Call parent delete handler
        }
      } else {
        console.error('Delete failed:', responseData);
        alert(`Failed to delete cliq: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting cliq');
    } finally {
      setDeleting(false);
    }
  };

  const handleMembersClick = () => {
    onClose(); // Close this modal
    onOpenMembers(); // Open members modal
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full p-0 rounded-lg bg-white">
        <DialogTitle className="sr-only">Manage {cliq.name}</DialogTitle>
        
        <div className="py-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{isOwner ? 'Manage' : 'View'} "{cliq.name}"</h3>
          </div>
          
          <div className="py-1">
            <button 
              onClick={handleMembersClick}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              {isOwner ? 'Manage Members' : 'View Members'}
            </button>
            
            {isOwner && (
              <>
                <Link 
                  href={`/cliqs/${cliq.id}/edit`}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  onClick={onClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Cliq Settings
                </Link>
                
                <hr className="my-1" />
                
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all duration-200 ${
                    confirmDelete 
                      ? 'bg-red-500 text-white font-bold shadow-md border-l-4 border-red-700' 
                      : 'text-red-600 hover:bg-red-50'
                  } ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  {deleting ? 'Deleting...' : confirmDelete ? 'Click again to confirm' : 'Delete Cliq'}
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
