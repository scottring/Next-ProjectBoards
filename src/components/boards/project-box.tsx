import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { TaskDialog } from './task-dialog';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  startTime?: string;
  endTime?: string;
  date?: string;
}

interface Project {
  id: string;
  title: string;
  tasks: Task[];
}

interface ProjectBoxProps {
  project: Project;
  onTaskDragStart: (task: Task) => void;
  onAddTask: (projectId: string, task: Task) => void;
  onTaskUpdate: (projectId: string, taskId: string, updates: Partial<Task>) => void;
}

export function ProjectBox({ project, onTaskDragStart, onAddTask, onTaskUpdate }: ProjectBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const completedTasks = project.tasks.filter(task => task.completed).length;
  const progress = (completedTasks / project.tasks.length) * 100;

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{project.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {completedTasks}/{project.tasks.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Progress value={progress} className="h-1" />
            
            {isExpanded && (
              <div className="pt-2 space-y-2">
                {project.tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-move"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                      onTaskDragStart(task);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => onTaskUpdate(project.id, task.id, { completed: e.target.checked })}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsTaskDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        boardId={project.id}
        onSubmit={(task) => {
          onAddTask(project.id, task);
          setIsTaskDialogOpen(false);
        }}
      />
    </>
  );
} 