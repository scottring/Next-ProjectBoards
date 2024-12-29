'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface List {
  id: string;
  title: string;
  tasks: Task[];
}

interface BoardSidebarProps {
  lists: List[];
  unassignedTasks: Task[];
  onAddTask: (task: Partial<Task>, listId?: string) => void;
  onToggleTask: (taskId: string, listId?: string) => void;
}

export function BoardSidebar({ lists, unassignedTasks, onAddTask, onToggleTask }: BoardSidebarProps) {
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToList, setAddingToList] = useState<string | null>(null);

  const handleAddUnassignedTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      onAddTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
    }
  };

  const handleAddListTask = (listId: string) => {
    if (addingToList === listId && newTaskTitle.trim()) {
      onAddTask({ title: newTaskTitle.trim() }, listId);
      setNewTaskTitle('');
      setAddingToList(null);
    } else {
      setAddingToList(listId);
      setNewTaskTitle('');
    }
  };

  const toggleList = (listId: string) => {
    setExpandedLists(prev => ({
      ...prev,
      [listId]: !prev[listId]
    }));
  };

  return (
    <div className="w-64 border-r bg-background p-4 flex flex-col gap-6">
      <div>
        <h2 className="font-semibold mb-2">UNASSIGNED TASKS</h2>
        <Input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleAddUnassignedTask}
          placeholder="Type task and press Enter"
          className="mb-2"
        />
        {unassignedTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 py-1 px-2 hover:bg-accent rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleTask(task.id)}
              className="rounded border-gray-300"
            />
            <span className={cn(
              "text-sm",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </span>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">LISTS</h2>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {lists.map((list) => (
          <div key={list.id} className="mb-2">
            <div
              className="flex items-center justify-between py-1 px-2 hover:bg-accent rounded cursor-pointer"
              onClick={() => toggleList(list.id)}
            >
              <div className="flex items-center gap-2">
                {expandedLists[list.id] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>{list.title}</span>
                <span className="text-xs text-muted-foreground">
                  {list.tasks.filter(t => t.completed).length}/{list.tasks.length}
                </span>
              </div>
            </div>
            {expandedLists[list.id] && (
              <div className="ml-6 mt-1">
                {list.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 py-1 px-2 hover:bg-accent rounded"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id, list.id)}
                      className="rounded border-gray-300"
                    />
                    <span className={cn(
                      "text-sm",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {addingToList === list.id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddListTask(list.id);
                        } else if (e.key === 'Escape') {
                          setAddingToList(null);
                          setNewTaskTitle('');
                        }
                      }}
                      placeholder="New task"
                      className="h-8 text-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1 justify-start"
                    onClick={() => handleAddListTask(list.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 