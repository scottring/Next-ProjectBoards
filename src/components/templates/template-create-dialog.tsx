import { useState } from 'react';
import { useTemplateStore } from '@/lib/store/template-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

type TimeUnit = 'days' | 'weeks' | 'months';

export function TemplateCreateDialog() {
  const [open, setOpen] = useState(false);
  const { createTemplate } = useTemplateStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'project',
    isPublic: false,
    structure: {
      timeline: {
        duration: 7,
        unit: 'days' as TimeUnit,
      },
      defaultColumns: ['To Do', 'In Progress', 'Done'],
      defaultTasks: [],
      layout: {
        showSidebar: true,
        showTimeline: true,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTemplate({
      name: formData.name,
      description: formData.description,
      thumbnail: '/templates/default.png',
      tasks: [],
      settings: {
        layout: {
          showSidebar: formData.structure.layout.showSidebar,
          showTimeline: formData.structure.layout.showTimeline,
        },
      },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a reusable template for your projects.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Project Planning Template"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this template is for..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project Management</SelectItem>
                  <SelectItem value="schedule">Scheduling</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.structure.timeline.duration}
                  onChange={(e) => setFormData({
                    ...formData,
                    structure: {
                      ...formData.structure,
                      timeline: {
                        ...formData.structure.timeline,
                        duration: parseInt(e.target.value),
                      },
                    },
                  })}
                  min="1"
                  className="w-20"
                />
                <Select
                  value={formData.structure.timeline.unit}
                  onValueChange={(value: TimeUnit) => setFormData({
                    ...formData,
                    structure: {
                      ...formData.structure,
                      timeline: {
                        ...formData.structure.timeline,
                        unit: value,
                      },
                    },
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 