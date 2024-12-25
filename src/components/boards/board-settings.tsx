import { useState } from 'react';
import { Board, BoardMember } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, Settings, Lock } from 'lucide-react';

interface BoardSettingsProps {
  board: Board;
}

export function BoardSettings({ board }: BoardSettingsProps) {
  const [formData, setFormData] = useState({
    name: board.name,
    description: board.description,
    settings: board.settings,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add board update logic here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Board Settings</CardTitle>
        <CardDescription>
          Configure board options and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Board Name</Label>
            <Input
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Layout Settings</h3>
            <div className="flex items-center justify-between">
              <Label>Show Sidebar</Label>
              <Switch
                checked={formData.settings.layout.showSidebar}
                onCheckedChange={(checked: boolean) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      layout: { ...formData.settings.layout, showSidebar: checked }
                    }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Timeline</Label>
              <Switch
                checked={formData.settings.layout.showTimeline}
                onCheckedChange={(checked: boolean) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      layout: { ...formData.settings.layout, showTimeline: checked }
                    }
                  })
                }
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
} 