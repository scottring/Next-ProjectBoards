'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Users, Bell } from 'lucide-react';

interface BoardMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
}

interface BoardSettings {
  id: string;
  title: string;
  description: string;
  visibility: 'private' | 'public';
  notifications: boolean;
  members: BoardMember[];
}

interface BoardSettingsProps {
  settings: BoardSettings;
  onUpdate: (settings: BoardSettings) => void;
}

export function BoardSettings({ settings, onUpdate }: BoardSettingsProps) {
  const [currentSettings, setCurrentSettings] = useState(settings);

  const handleChange = (key: keyof BoardSettings, value: any) => {
    const updated = { ...currentSettings, [key]: value };
    setCurrentSettings(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Settings className="h-5 w-5" />
          General Settings
        </h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Board Title</Label>
            <Input
              id="title"
              value={currentSettings.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={currentSettings.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Board Visibility</Label>
              <div className="text-sm text-gray-500">
                {currentSettings.visibility === 'private' ? 'Only members can access' : 'Anyone can access'}
              </div>
            </div>
            <Switch
              checked={currentSettings.visibility === 'public'}
              onCheckedChange={(checked) => handleChange('visibility', checked ? 'public' : 'private')}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members
        </h2>
        <div className="mt-4 space-y-4">
          {currentSettings.members.map(member => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {member.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
              <select
                value={member.role}
                onChange={(e) => {
                  const updatedMembers = currentSettings.members.map(m =>
                    m.id === member.id ? { ...m, role: e.target.value as BoardMember['role'] } : m
                  );
                  handleChange('members', updatedMembers);
                }}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            Add Member
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </h2>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <div className="text-sm text-gray-500">
                Receive updates about board activity
              </div>
            </div>
            <Switch
              checked={currentSettings.notifications}
              onCheckedChange={(checked) => handleChange('notifications', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 