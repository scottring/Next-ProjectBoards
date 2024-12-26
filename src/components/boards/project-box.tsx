'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Plus } from 'lucide-react';
import { TaskDialog } from './task-dialog';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  duration: number;
  completed?: boolean;
  projectId?: string;
}

interface Project {
  id: string;
  title: string;
  tasks: Task[];
  progress: number;
}

interface ProjectBoxProps {
  project: Project;
  onTaskDragStart: (task: Task) => void;
  onAddTask: (projectId: string, task: Task) => void;
  onTaskUpdate: (projectId: string, taskId: string, updates: Partial<Task>) => void;
}

export function ProjectBox({ project, onTaskDragStart, onAddTask, onTaskUpdate }: ProjectBoxProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskSave = (task: Task) => {
    if (editingTask) {
      onTaskUpdate(project.id, editingTask.id, task);
    } else {
      onAddTask(project.id, task);
    }
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{project.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {project.tasks.filter(t => t.completed).length}/{project.tasks.length}
          </span>
          <ChevronRight className="h-4 w-4 cursor-pointer" />
        </div>
      </div>
      <Progress value={project.progress} className="h-1 mb-4" />
      <div className="space-y-2">
        {project.tasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={() => onTaskDragStart(task)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-move"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => onTaskUpdate(project.id, task.id, { completed: e.target.checked })}
              className="h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <span className={task.completed ? 'line-through text-gray-400' : ''}>
              {task.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => {
                setEditingTask(task);
                setIsTaskDialogOpen(true);
              }}
            >
              Edit
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => {
            setEditingTask(null);
            setIsTaskDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={editingTask}
        boardId={project.id}
        onSubmit={handleTaskSave}
      />
    </div>
  );
} 