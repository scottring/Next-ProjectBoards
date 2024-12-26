'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Search, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaskDialog } from './task-dialog';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  startTime?: string;
  duration: number;
  day?: string;
  completed?: boolean;
  projectId?: string;
}

interface Project {
  id: string;
  title: string;
  tasks: Task[];
  progress: number;
}

export function ProjectBoard() {
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [resizingTask, setResizingTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dayColumns, setDayColumns] = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

  useEffect(() => {
    // Initialize with sample data on client-side only
    setProjects([
      {
        id: '1',
        title: 'Project Alpha',
        tasks: [
          { id: '1', title: 'Research', priority: 'high', duration: 60, completed: true },
          { id: '2', title: 'Design', priority: 'medium', duration: 120, completed: false },
          { id: '3', title: 'Implementation', priority: 'high', duration: 180, completed: false },
        ],
        progress: 33,
      },
      {
        id: '2',
        title: 'Project Beta',
        tasks: [
          { id: '4', title: 'Planning', priority: 'medium', duration: 45, completed: true },
          { id: '5', title: 'Development', priority: 'high', duration: 90, completed: true },
          { id: '6', title: 'Testing', priority: 'low', duration: 60, completed: false },
        ],
        progress: 66,
      },
    ]);

    setTasks([
      { 
        id: 'unassigned-1', 
        title: 'Add project board', 
        priority: 'high',
        startTime: '10:00',
        duration: 45,
        day: format(new Date(), 'EEE, MMM d'),
      }
    ]);
  }, []);

  const getDaysArray = () => {
    const days = [];
    for (let i = 0; i < dayColumns; i++) {
      days.push(addDays(currentDate, i));
    }
    return days;
  };

  // Generate 15-minute time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          height: 'h-4'
        });
      }
    }
    return slots;
  };

  const handleDragStart = (task: Task, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingTask(task);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (time: string, day: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggingTask) return;

    // If it's a project task, move it to the timeline
    if (draggingTask.projectId) {
      setProjects(projects.map(project => {
        if (project.id === draggingTask.projectId) {
          return {
            ...project,
            tasks: project.tasks.filter(task => task.id !== draggingTask.id),
          };
        }
        return project;
      }));
    } else {
      // If it's an unassigned task, remove it from unassigned tasks
      setTasks(prev => prev.filter(t => t.id !== draggingTask.id));
    }

    // Add the task to the timeline tasks
    setTasks(prev => [...prev, {
      ...draggingTask,
      startTime: time,
      day,
      projectId: undefined, // Remove project association
    }]);
    
    setDraggingTask(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleResizeStart = (task: Task, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const element = e.currentTarget.parentElement;
    if (!element) return;

    setResizingTask(task);
    resizeRef.current = {
      startY: e.clientY,
      startHeight: element.getBoundingClientRect().height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingTask || !resizeRef.current) return;

      const diff = e.clientY - resizeRef.current.startY;
      const newHeight = Math.max(48, resizeRef.current.startHeight + diff); // Minimum height of 48px (30 minutes)
      const newDuration = Math.round((newHeight / 16) * 15); // 16px = 15 minutes

      // Update the element's height directly for immediate visual feedback
      const element = document.querySelector(`[data-task-id="${resizingTask.id}"]`) as HTMLElement;
      if (element) {
        element.style.height = `${newHeight}px`;
      }

      // Update the task data
      if (resizingTask.projectId) {
        setProjects(projects.map(project => {
          if (project.id === resizingTask.projectId) {
            return {
              ...project,
              tasks: project.tasks.map(task => {
                if (task.id === resizingTask.id) {
                  return {
                    ...task,
                    duration: newDuration,
                  };
                }
                return task;
              }),
            };
          }
          return project;
        }));
      } else {
        setTasks(tasks.map(task => {
          if (task.id === resizingTask.id) {
            return {
              ...task,
              duration: newDuration,
            };
          }
          return task;
        }));
      }
    };

    const handleMouseUp = () => {
      setResizingTask(null);
      resizeRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleAddTask = (projectId: string | undefined, task: Omit<Task, 'duration'> & { duration?: number }) => {
    const newTask: Task = {
      ...task,
      duration: task.duration || 30, // Default duration of 30 minutes
    };

    if (projectId) {
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: [...project.tasks, { ...newTask, projectId }],
          };
        }
        return project;
      }));
    } else {
      setTasks([...tasks, newTask]);
    }
  };

  const handleTaskUpdate = (projectId: string | undefined, taskId: string, updates: Partial<Task>) => {
    if (projectId) {
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: project.tasks.map(task => {
              if (task.id === taskId) {
                return { ...task, ...updates };
              }
              return task;
            }),
          };
        }
        return project;
      }));
    } else {
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        return task;
      }));
    }
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: generateId(),
      title: 'New Project',
      tasks: [],
      progress: 0,
    };
    setProjects([...projects, newProject]);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleTaskSave = (updatedTask: Task) => {
    if (editingTask) {
      if (editingTask.projectId) {
        setProjects(projects.map(project => {
          if (project.id === editingTask.projectId) {
            return {
              ...project,
              tasks: project.tasks.map(task => 
                task.id === editingTask.id ? { ...updatedTask, projectId: editingTask.projectId } : task
              ),
            };
          }
          return project;
        }));
      } else {
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
      }
    } else {
      const newTask = {
        ...updatedTask,
        id: generateId(),
      };
      handleAddTask(undefined, newTask);
    }
    setEditingTask(null);
    setIsTaskDialogOpen(false);
  };

  const handleProjectSave = (updatedProject: Project) => {
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
    setEditingProject(null);
  };

  const handleProjectDrop = (projectId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggingTask) return;

    // Remove from timeline tasks
    setTasks(prev => prev.filter(t => t.id !== draggingTask.id));

    // Add to project
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: [...project.tasks, { ...draggingTask, projectId, startTime: undefined, day: undefined }],
        };
      }
      return project;
    }));
    
    setDraggingTask(null);
  };

  const handleUnassignedDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggingTask) return;

    // Remove from timeline tasks if it's there
    setTasks(prev => {
      const timelineTasks = prev.filter(t => t.id !== draggingTask.id);
      return [...timelineTasks, { ...draggingTask, projectId: undefined, startTime: undefined, day: undefined }];
    });

    // If it's in a project, remove it
    if (draggingTask.projectId) {
      setProjects(projects.map(project => {
        if (project.id === draggingTask.projectId) {
          return {
            ...project,
            tasks: project.tasks.filter(task => task.id !== draggingTask.id),
          };
        }
        return project;
      }));
    }
    
    setDraggingTask(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Project Board</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">Started: {format(currentDate, 'MM/dd/yyyy')}</p>
              <Progress value={35} className="w-32" />
              <span className="text-sm text-gray-600">35% Complete</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTaskDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white"></div>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 w-full border rounded-md"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-medium">Day View:</span>
          <div className="flex gap-2">
            {[1, 2, 3, 7].map(num => (
              <Button
                key={num}
                variant={dayColumns === num ? "default" : "outline"}
                size="sm"
                onClick={() => setDayColumns(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with Projects and Tasks */}
        <div className="w-72 border-r bg-white overflow-y-auto">
          <div className="p-4">
            {/* Unassigned Tasks */}
            <div 
              className="mb-6"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleUnassignedDrop}
            >
              <h2 className="text-sm font-semibold text-gray-500 mb-2">UNASSIGNED TASKS</h2>
              {tasks.filter(t => !t.startTime).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(task, e)}
                  className="cursor-move group"
                >
                  <Alert className="bg-red-50 border-red-200 mb-2">
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-1 h-4 bg-red-500 rounded"></div>
                        <span>{task.title}</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">{task.priority}</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </div>

            {/* Project Groups */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500">PROJECTS</h2>
                <Button variant="ghost" size="sm" onClick={handleAddProject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="border rounded-lg p-3"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleProjectDrop(project.id, e)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {project.tasks.filter(t => t.completed).length}/{project.tasks.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleProjectEdit(project)}
                      >
                        <ChevronRight size={16} className="cursor-pointer" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={project.progress} className="h-1 mb-3" />
                  <div className="space-y-2">
                    {project.tasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart({ ...task, projectId: project.id }, e)}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-move group"
                        onDoubleClick={() => handleTaskEdit({ ...task, projectId: project.id })}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => handleTaskUpdate(project.id, task.id, { completed: e.target.checked })}
                          className="h-4 w-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className={task.completed ? 'line-through text-gray-400' : ''}>
                          {task.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskEdit({ ...task, projectId: project.id });
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline View with Drop Zones */}
        <div className="flex-1 overflow-x-auto">
          <div className="p-4">
            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentDate(date => addDays(date, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <h3 className="font-medium">
                  {format(currentDate, 'EEE, MMM d')}
                </h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => setCurrentDate(date => addDays(date, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Timeline Grid with 15-minute intervals */}
            <div className="relative">
              {/* Time markers */}
              <div className="absolute top-0 left-0 w-16 h-full border-r">
                {generateTimeSlots().map((slot, i) => (
                  i % 4 === 0 && (
                    <div key={slot.time} className="h-16 text-xs text-gray-500 flex items-center justify-end pr-2">
                      {slot.time}
                    </div>
                  )
                ))}
              </div>
              
              {/* Timeline content */}
              <div className="ml-16 grid" style={{ gridTemplateColumns: `repeat(${dayColumns}, 1fr)` }}>
                {getDaysArray().map(date => (
                  <div key={date.toString()} className="border-l relative min-h-[720px]">
                    <div className="h-12 border-b px-4 flex items-center">
                      <span className="text-sm font-medium">
                        {format(date, 'EEEE, MMMM d')}
                      </span>
                    </div>
                    
                    {/* 15-minute drop zones */}
                    <div className="relative">
                      {generateTimeSlots().map((slot) => (
                        <div
                          key={slot.time}
                          className="h-4 border-b border-gray-100"
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(slot.time, format(date, 'EEE, MMM d'), e)}
                        />
                      ))}

                      {/* Render all tasks */}
                      {[...tasks, ...projects.flatMap(p => p.tasks)].filter(task => 
                        task.day === format(date, 'EEE, MMM d') && task.startTime
                      ).map(task => {
                        const startMinutes = parseInt(task.startTime!.split(':')[0]) * 60 + 
                                         parseInt(task.startTime!.split(':')[1]);
                        const top = ((startMinutes - 8 * 60) / 15) * 16; // 16px per 15min
                        const height = (task.duration / 15) * 16;
                        
                        return (
                          <div
                            key={task.id}
                            data-task-id={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(task, e)}
                            className="absolute left-0 right-0 bg-blue-100 border border-blue-300 rounded px-2 text-xs cursor-move group transition-[height]"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              zIndex: 10
                            }}
                            onDoubleClick={() => handleTaskEdit(task)}
                          >
                            <div className="flex items-center gap-1">
                              <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="font-medium">{task.title}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskEdit(task);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                            {/* Resize handle */}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-500 group-hover:opacity-100 opacity-0 transition-opacity"
                              onMouseDown={(e) => handleResizeStart(task, e)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={editingTask}
        onSubmit={handleTaskSave}
        boardId={editingTask?.projectId || "unassigned"}
      />
    </div>
  );
}
