/**
 * ParentDashboard - Simple working version
 */

'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Child structure with profile and settings
interface Child {
  id: string;
  email: string;
  type: 'family' | 'invited'; // Relationship type
  inviteContext?: string; // Context for invited children
  myProfile: {
    username: string;
    firstName?: string;
    birthdate: string;
  } | null;
  childSettings?: {
    canSendInvites: boolean;
    canInviteChildren: boolean;
    canInviteAdults: boolean;
    childInviteRequiresApproval: boolean;
    adultInviteRequiresApproval: boolean;
    canCreatePrivateCliqs: boolean;
    canCreateSemiPrivateCliqs: boolean;
    canCreatePublicCliqs: boolean;
    isSilentlyMonitored: boolean;
  };
}

// Form data for creating new family children
interface CreateChildForm {
  firstName: string;
  birthdate: string;
  username: string;
  password: string;
}

interface PermissionToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PermissionToggle({ label, description, checked, onChange, disabled }: PermissionToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [redAlertAccepted, setRedAlertAccepted] = useState(false);
  const [childSettings, setChildSettings] = useState<Record<string, any>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateChildForm>({
    firstName: '',
    birthdate: '',
    username: '',
    password: ''
  });
  const [creating, setCreating] = useState(false);

  // Calculate age from birthdate
  const calculateAge = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch children and their settings
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        setLoading(true);
        const childrenData = await fetchJson('/api/parent/children');
        
        // Fetch detailed child data with settings
        const childrenWithSettings = await Promise.all(
          childrenData.map(async (child: any) => {
            try {
              // Get child profile and settings
              const profileResponse = await fetchJson(`/api/parent/child-profile?childId=${child.id}`);
              return {
                ...child,
                type: child.type || 'family', // Default to family if not specified
                inviteContext: child.inviteContext,
                myProfile: profileResponse.myProfile,
                childSettings: profileResponse.childSettings
              };
            } catch (err) {
              console.error(`Failed to fetch data for child ${child.id}:`, err);
              return {
                ...child,
                type: 'family',
                inviteContext: child.inviteContext
              };
            }
          })
        );
        
        setChildren(childrenWithSettings);
        
        // Initialize local settings state
        const initialSettings: Record<string, any> = {};
        childrenWithSettings.forEach((child) => {
          if (child.childSettings) {
            initialSettings[child.id] = { ...child.childSettings };
          } else {
            // Default settings for new children
            initialSettings[child.id] = {
              canSendInvites: false,
              canInviteChildren: false,
              canInviteAdults: false,
              childInviteRequiresApproval: true,
              adultInviteRequiresApproval: true,
              canCreatePrivateCliqs: false,
              canCreateSemiPrivateCliqs: false,
              canCreatePublicCliqs: false,
              isSilentlyMonitored: true,
            };
          }
        });
        setChildSettings(initialSettings);
      } catch (err) {
        console.error('Failed to fetch children:', err);
        toast({ title: 'Error', description: 'Failed to load children data' });
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  // Update setting for a specific child
  const updateChildSetting = (childId: string, field: string, value: boolean) => {
    setChildSettings(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [field]: value
      }
    }));
  };

  // Create new family child
  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.firstName || !createForm.birthdate || !createForm.username || !createForm.password) {
      toast({ title: 'Error', description: 'Please fill in all fields' });
      return;
    }

    try {
      setCreating(true);
      
      const response = await fetchJson('/api/parent/create-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      
      toast({ title: 'Success', description: `${createForm.firstName}'s account created successfully!` });
      
      // Reset form and close modal
      setCreateForm({ firstName: '', birthdate: '', username: '', password: '' });
      setShowCreateForm(false);
      
      // Refresh children list
      window.location.reload();
    } catch (err) {
      console.error('Failed to create child:', err);
      toast({ title: 'Error', description: 'Failed to create child account. Please try again.' });
    } finally {
      setCreating(false);
    }
  };

  // Save all settings
  const handleSaveSettings = async () => {
    if (!redAlertAccepted) {
      toast({ title: 'Error', description: 'Please accept Red Alert responsibility before saving.' });
      return;
    }

    try {
      setSaving(true);
      
      // Save settings for each child
      await Promise.all(
        children.map(async (child) => {
          const settings = childSettings[child.id];
          if (settings) {
            await fetchJson('/api/parent/settings/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                childId: child.id,
                settings
              })
            });
          }
        })
      );
      
      toast({ title: 'Success', description: 'Settings saved successfully. Your children\'s accounts are now approved.' });
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast({ title: 'Error', description: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading children data...</div>
      </div>
    );
  }

  // Separate family and invited children
  const familyChildren = children.filter(child => child.type === 'family');
  const invitedChildren = children.filter(child => child.type === 'invited');

  return (
    <div className="space-y-8">
      {/* My Family Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            👨‍👩‍👧‍👦 My Family ({familyChildren.length}/5)
          </h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={familyChildren.length >= 5}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Add Child
          </Button>
        </div>
        
        {familyChildren.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No family members added yet.</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Child Account
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {familyChildren.map((child) => {
              const settings = childSettings[child.id] || {};
              const age = child.myProfile?.birthdate ? calculateAge(child.myProfile.birthdate) : 0;
              const displayName = child.myProfile?.firstName || child.myProfile?.username || child.email;
              
              return (
                <Card key={child.id} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {displayName} {age > 0 && `(Age ${age})`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Permission controls will be added here</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Button */}
      <Button 
        onClick={handleSaveSettings}
        disabled={saving || !redAlertAccepted}
        className="w-full bg-black text-white hover:bg-gray-800 py-3 text-lg font-medium"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
        
        {familyChildren.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No family members added yet.</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Child Account
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {familyChildren.map((child) => {
              const settings = childSettings[child.id] || {};
              const age = child.myProfile?.birthdate ? calculateAge(child.myProfile.birthdate) : 0;
              const displayName = child.myProfile?.firstName || child.myProfile?.username || child.email;
              
              return (
                <Card key={child.id} className="w-full border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="text-blue-600">👶</span>
                      {displayName} {age > 0 && `(Age ${age})`}
                      <span className="text-sm font-normal text-gray-500">• Family Member</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Permission controls for family children */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Invite Permissions</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                        <PermissionToggle
                          label="Can Send Invites"
                          checked={settings.canSendInvites || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canSendInvites', checked)}
                        />
                        <PermissionToggle
                          label="Can Invite Other Children"
                          checked={settings.canInviteChildren || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canInviteChildren', checked)}
                        />
                        <PermissionToggle
                          label="Can Invite Adults"
                          checked={settings.canInviteAdults || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canInviteAdults', checked)}
                        />
                        <PermissionToggle
                          label="Require Approval for Child Invites"
                          description="You'll be notified when your child wants to invite another child"
                          checked={settings.childInviteRequiresApproval ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'childInviteRequiresApproval', checked)}
                        />
                        <PermissionToggle
                          label="Require Approval for Adult Invites"
                          description="You'll be notified when your child wants to invite an adult"
                          checked={settings.adultInviteRequiresApproval ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'adultInviteRequiresApproval', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Cliq Creation Permissions</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                        <PermissionToggle
                          label="Can Create Private Cliqs"
                          description="Only invited members can see and join"
                          checked={settings.canCreatePrivateCliqs || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canCreatePrivateCliqs', checked)}
                        />
                        <PermissionToggle
                          label="Can Create Semi-Private Cliqs"
                          description="Visible to others but requires approval to join"
                          checked={settings.canCreateSemiPrivateCliqs || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canCreateSemiPrivateCliqs', checked)}
                        />
                        <PermissionToggle
                          label="Can Create Public Cliqs"
                          description="Anyone can see and join"
                          checked={settings.canCreatePublicCliqs || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canCreatePublicCliqs', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Monitoring & Safety</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <PermissionToggle
                          label="Enable Silent Monitoring"
                          description="Allow parent to view child activity without being listed as a group member"
                          checked={settings.isSilentlyMonitored ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'isSilentlyMonitored', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Approvals & External Children Section */}
      {invitedChildren.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📨 Pending Approvals & External Children ({invitedChildren.length})
          </h2>
          <div className="space-y-4">
            {invitedChildren.map((child) => {
              const settings = childSettings[child.id] || {};
              const age = child.myProfile?.birthdate ? calculateAge(child.myProfile.birthdate) : 0;
              const displayName = child.myProfile?.firstName || child.myProfile?.username || child.email;

              return (
                <Card key={child.id} className="w-full border-orange-200">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="text-orange-600">👋</span>
                      {displayName} {age > 0 && `(Age ${age})`}
                      <span className="text-sm font-normal text-gray-500">• {child.inviteContext || 'External Child'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Limited permission controls for invited children */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Safety Settings</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                        <PermissionToggle
                          label="Silent Monitoring"
                          description="Monitor this child's activity for safety"
                          checked={settings.isSilentlyMonitored ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'isSilentlyMonitored', checked)}
                        />
                        <PermissionToggle
                          label="Require Approval for Invites"
                          description="Get notified when this child wants to invite others"
                          checked={settings.childInviteRequiresApproval ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'childInviteRequiresApproval', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Red Alert Responsibility Section */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-xl">🚨</div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Cliqstr includes a <strong>Red Alert</strong> button your child can use if they feel unsafe.
                  As their parent or guardian, you are the <strong>first line of defense</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="red-alert-acceptance"
                checked={redAlertAccepted}
                onChange={(e) => setRedAlertAccepted(e.target.checked)}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="red-alert-acceptance" 
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                I accept responsibility to monitor Red Alerts.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSaveSettings}
        disabled={saving || !redAlertAccepted}
        className="w-full bg-black text-white hover:bg-gray-800 py-3 text-lg font-medium"
      >
        {saving ? 'Saving...' : 'Save & Confirm Parent/Guardian Approval'}
      </Button>
    </div>
  );
                    {/* Full permission controls for family children */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Invite Permissions</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                        <PermissionToggle
                          label="Can Send Invites"
                          checked={settings.canSendInvites || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canSendInvites', checked)}
                        />
                        <PermissionToggle
                          label="Can Invite Other Children"
                          checked={settings.canInviteChildren || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canInviteChildren', checked)}
                        />
                        <PermissionToggle
                          label="Can Invite Adults"
                          checked={settings.canInviteAdults || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canInviteAdults', checked)}
                        />
                        <PermissionToggle
                          label="Require Approval for Child Invites"
                          description="You'll be notified when your child wants to invite another child"
                          checked={settings.childInviteRequiresApproval ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'childInviteRequiresApproval', checked)}
                        />
                        <PermissionToggle
                          label="Require Approval for Adult Invites"
                          description="You'll be notified when your child wants to invite an adult"
                          checked={settings.adultInviteRequiresApproval ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'adultInviteRequiresApproval', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Cliq Creation Permissions</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                        <PermissionToggle
                          label="Can Create Private Cliqs"
                          description="Only invited members can see and join"
                          checked={settings.canCreatePrivateCliqs || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canCreatePrivateCliqs', checked)}
                        />
                        <PermissionToggle
                          label="Can Create Semi-Private Cliqs"
                          description="Visible to others but requires approval to join"
                          checked={settings.canCreateSemiPrivateCliqs || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canCreateSemiPrivateCliqs', checked)}
                        />
                        <PermissionToggle
                          label="Can Create Public Cliqs"
                          description="Anyone can see and join"
                          checked={settings.canCreatePublicCliqs || false}
                          onChange={(checked) => updateChildSetting(child.id, 'canCreatePublicCliqs', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Monitoring & Safety</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <PermissionToggle
                          label="Enable Silent Monitoring"
                          description="Allow parent to view child activity without being listed as a group member"
                          checked={settings.isSilentlyMonitored ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'isSilentlyMonitored', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Approvals & External Children Section */}
      {invitedChildren.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📨 Pending Approvals & External Children ({invitedChildren.length})
          </h2>
          <div className="space-y-4">
            {invitedChildren.map((child) => {
              const settings = childSettings[child.id] || {};
              const age = child.myProfile?.birthdate ? calculateAge(child.myProfile.birthdate) : 0;
              const displayName = child.myProfile?.firstName || child.myProfile?.username || child.email;

              return (
                <Card key={child.id} className="w-full border-orange-200">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="text-orange-600">👋</span>
                      {displayName} {age > 0 && `(Age ${age})`}
                      <span className="text-sm font-normal text-gray-500">• {child.inviteContext || 'External Child'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Limited permission controls for invited children */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Safety Settings</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                        <PermissionToggle
                          label="Silent Monitoring"
                          description="Monitor this child's activity for safety"
                          checked={settings.isSilentlyMonitored ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'isSilentlyMonitored', checked)}
                        />
                        <PermissionToggle
                          label="Require Approval for Invites"
                          description="Get notified when this child wants to invite others"
                          checked={settings.childInviteRequiresApproval ?? true}
                          onChange={(checked) => updateChildSetting(child.id, 'childInviteRequiresApproval', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

              {/* Cliq Creation Permissions */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Cliq Creation Permissions</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <PermissionToggle
                    label="Can Create Private Cliqs"
                    description="Only invited members can see and join"
                    checked={settings.canCreatePrivateCliqs || false}
                    onChange={(checked) => updateChildSetting(child.id, 'canCreatePrivateCliqs', checked)}
                  />
                  <PermissionToggle
                    label="Can Create Semi-Private Cliqs"
                    description="Visible to others but requires approval to join"
                    checked={settings.canCreateSemiPrivateCliqs || false}
                    onChange={(checked) => updateChildSetting(child.id, 'canCreateSemiPrivateCliqs', checked)}
                  />
                  <PermissionToggle
                    label="Can Create Public Cliqs"
                    description="Anyone can see and join"
                    checked={settings.canCreatePublicCliqs || false}
                    onChange={(checked) => updateChildSetting(child.id, 'canCreatePublicCliqs', checked)}
                  />
                </div>
              </div>

              {/* Monitoring Settings */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Monitoring & Safety</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <PermissionToggle
                    label="Enable Silent Monitoring"
                    description="Allow parent to view child activity without being listed as a group member"
                    checked={settings.isSilentlyMonitored ?? true}
                    onChange={(checked) => updateChildSetting(child.id, 'isSilentlyMonitored', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Red Alert Responsibility Section */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-xl">🚨</div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Cliqstr includes a <strong>Red Alert</strong> button your child can use if they feel unsafe.
                  As their parent or guardian, you are the <strong>first line of defense</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="red-alert-acceptance"
                checked={redAlertAccepted}
                onChange={(e) => setRedAlertAccepted(e.target.checked)}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="red-alert-acceptance" 
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                I accept responsibility to monitor Red Alerts.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSaveSettings}
        disabled={saving || !redAlertAccepted}
        className="w-full bg-black text-white hover:bg-gray-800 py-3 text-lg font-medium"
      >
        {saving ? 'Saving...' : 'Save & Confirm Parent/Guardian Approval'}
      </Button>
    </div>
  );
}
