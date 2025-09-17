'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * 🔍 DEBUG TOOL: Invite Flow Tracer
 * 
 * This tool helps debug invite flow issues by:
 * 1. Testing invite code validation
 * 2. Checking user auth status
 * 3. Simulating the invite flow
 */

export default function InviteFlowDebugPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (step: string, data: any) => {
    setResults(prev => [...prev, { step, data, timestamp: new Date().toISOString() }]);
  };

  const testInviteFlow = async () => {
    if (!inviteCode) return;
    
    setLoading(true);
    setResults([]);

    try {
      // Step 1: Test auth status
      addResult('1. Auth Status Check', 'Starting...');
      const authRes = await fetch('/api/auth/status', { credentials: 'include' });
      const authData = await authRes.json();
      addResult('1. Auth Status Check', { status: authRes.status, user: authData.user });

      // Step 2: Test invite validation
      addResult('2. Invite Validation', 'Starting...');
      const inviteRes = await fetch(`/api/invites/validate?code=${inviteCode}`);
      const inviteData = await inviteRes.json();
      addResult('2. Invite Validation', { status: inviteRes.status, data: inviteData });

      // Step 3: Test what would happen in invite/parent page
      addResult('3. Invite Parent Logic', 'Simulating...');
      if (authData.user) {
        if (authData.user.role === 'Parent') {
          addResult('3. Invite Parent Logic', 'Would redirect to Parent HQ');
        } else if (authData.user.role === 'Adult') {
          addResult('3. Invite Parent Logic', 'Would redirect to Parent HQ (auto-upgrade)');
        } else {
          addResult('3. Invite Parent Logic', 'Would show error (child account)');
        }
      } else {
        addResult('3. Invite Parent Logic', 'Would redirect to dedicated signup');
      }

    } catch (error) {
      addResult('ERROR', error);
    } finally {
      setLoading(false);
    }
  };

  const testSessionPing = async () => {
    setLoading(true);
    addResult('Session Ping Test', 'Testing session-ping with invite code...');
    
    try {
      // This would normally be a redirect, but we can't test that directly
      // Instead, let's check what the auth status would return
      const authRes = await fetch('/api/auth/status', { credentials: 'include' });
      const authData = await authRes.json();
      
      if (authData.user?.approved || authData.user?.account?.isApproved) {
        if (inviteCode) {
          addResult('Session Ping Test', 'Would redirect to /invite/accept (GOOD)');
        } else {
          addResult('Session Ping Test', 'Would redirect to /my-cliqs-dashboard (NORMAL)');
        }
      } else {
        addResult('Session Ping Test', 'Would redirect to plan selection');
      }
    } catch (error) {
      addResult('Session Ping Test', { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Invite Flow Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Invite Code:</label>
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code to test"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testInviteFlow} disabled={loading || !inviteCode}>
              Test Full Invite Flow
            </Button>
            <Button onClick={testSessionPing} disabled={loading} variant="outline">
              Test Session Ping Logic
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Debug Results:</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-sm text-blue-600">{result.step}</div>
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                    <pre className="text-sm mt-1 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
