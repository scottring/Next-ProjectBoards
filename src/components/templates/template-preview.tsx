import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout, Calendar, List } from 'lucide-react';

// Sample template structure for preview
const sampleTasks = [
  { id: '1', title: 'Project Setup', status: 'todo', date: '2024-01-01' },
  { id: '2', title: 'Requirements Gathering', status: 'todo', date: '2024-01-02' },
  { id: '3', title: 'Design Phase', status: 'todo', date: '2024-01-03' },
];

interface TemplatePreviewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    description: string;
    tasks: any[];
  };
}

export function TemplatePreview({ isOpen, onOpenChange, template }: TemplatePreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="layout" className="h-full">
          <TabsList>
            <TabsTrigger value="layout" className="gap-2">
              <Layout className="h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <List className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="h-full">
            <div className="grid grid-cols-4 gap-4 h-full">
              <Card className="col-span-1 h-full">
                <CardHeader>
                  <h3 className="text-sm font-medium">Project Structure</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-2 bg-gray-100 rounded text-sm">Planning</div>
                    <div className="p-2 bg-gray-100 rounded text-sm">Design</div>
                    <div className="p-2 bg-gray-100 rounded text-sm">Development</div>
                    <div className="p-2 bg-gray-100 rounded text-sm">Testing</div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="col-span-3 bg-gray-50 rounded-lg p-4">
                <div className="h-full border rounded-lg bg-white p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {['To Do', 'In Progress', 'Done'].map((column) => (
                      <div key={column} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-4">{column}</h4>
                        {sampleTasks.map((task) => (
                          <Card key={task.id} className="mb-2">
                            <CardContent className="p-3">
                              <div className="text-sm">{task.title}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="h-full">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sampleTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="h-full">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Default Tasks</h3>
                    <Button variant="outline" size="sm">
                      Add Task
                    </Button>
                  </div>
                  {sampleTasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-500">
                              {task.status} · Due {task.date}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 