'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Search, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { getProjects, getTasks, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask } from '@/lib/firestore';
import { Project, Task } from '@/types';
import dynamic from 'next/dynamic';

const TaskDialog = dynamic(() => import('./task-dialog').then(mod => mod.TaskDialog), {
  ssr: false,
  loading: () => null
});

export function ProjectBoard() {
  const { user } = useAuth();
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [resizingTask, setResizingTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dayColumns, setDayColumns] = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [projectsData, tasksData] = await Promise.all([
          getProjects(user.uid),
          getTasks(user.uid)
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleAddProject = async () => {
    if (!user) return;

    const newProject: Omit<Project, 'id'> = {
      title: 'New Project',
      tasks: [],
      progress: 0,
      userId: user.uid
    };

    try {
      const project = await addProject(user.uid, newProject);
      setProjects(prev => [...prev, project]);
    } catch (err) {
      setError('Failed to add project');
      console.error(err);
    }
  };

  const handleTaskSave = async (updatedTask: Task) => {
    if (!user) return;

    try {
      // Create a base task object with required fields
      const taskData = {
        title: updatedTask.title,
        priority: updatedTask.priority,
        duration: updatedTask.duration,
        userId: user.uid,
        completed: updatedTask.completed || false
      } as const;

      // Add optional fields if they exist
      const fullTaskData = {
        ...taskData,
        ...(updatedTask.startTime && { startTime: updatedTask.startTime }),
        ...(updatedTask.day && { day: updatedTask.day }),
        ...(updatedTask.projectId && { projectId: updatedTask.projectId })
      };

      if (editingTask?.id) {
        // Update existing task
        await updateTask(editingTask.id, fullTaskData);
        if (editingTask.projectId) {
          setProjects(projects.map(project => {
            if (project.id === editingTask.projectId) {
              return {
                ...project,
                tasks: project.tasks.map(task => 
                  task.id === editingTask.id ? { ...task, ...fullTaskData } : task
                ),
              };
            }
            return project;
          }));
        } else {
          setTasks(tasks.map(task => 
            task.id === editingTask.id ? { ...task, ...fullTaskData } : task
          ));
        }
      } else {
        // Create new task
        const newTask = await addTask(user.uid, fullTaskData);
        
        if (fullTaskData.projectId) {
          setProjects(projects.map(project => {
            if (project.id === fullTaskData.projectId) {
              return {
                ...project,
                tasks: [...project.tasks, newTask],
              };
            }
            return project;
          }));
        } else {
          setTasks(prev => [...prev, newTask]);
        }
      }
    } catch (err) {
      setError('Failed to save task');
      console.error(err);
    }

    setEditingTask(null);
    setIsTaskDialogOpen(false);
  };

  const handleTaskUpdate = async (projectId: string | undefined, taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      await updateTask(taskId, updates);
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
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!user) return;

    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setProjects(prev => prev.map(project => ({
        ...project,
        tasks: project.tasks.filter(t => t.id !== taskId),
      })));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const getDaysArray = () => {
    const days = [];
    for (let i = 0; i < dayColumns; i++) {
      days.push(addDays(currentDate, i));
    }
    return days;
  };

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

  const handleDrop = async (time: string, day: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggingTask || !user) return;

    try {
      // Create a new task object without projectId
      const { projectId, ...taskWithoutProject } = draggingTask;
      const updates = {
        ...taskWithoutProject,
        startTime: time,
        day,
      };

      await updateTask(draggingTask.id, updates);

      // If it's a project task, remove it from the project
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

      // Update the task in the unassigned tasks list
      setTasks(prev => {
        const exists = prev.some(t => t.id === draggingTask.id);
        if (exists) {
          return prev.map(t => t.id === draggingTask.id ? updates : t);
        } else {
          return [...prev, updates];
        }
      });
    } catch (err) {
      setError('Failed to move task');
      console.error(err);
    }
    
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

    const handleMouseMove = async (e: MouseEvent) => {
      if (!resizingTask || !resizeRef.current || !user) return;

      const diff = e.clientY - resizeRef.current.startY;
      const newHeight = Math.max(16, resizeRef.current.startHeight + diff);
      const newDuration = Math.round((newHeight / 16) * 15); // 16px = 15 minutes

      try {
        await updateTask(resizingTask.id, { duration: newDuration });

        // Update UI
        if (resizingTask.projectId) {
          setProjects(projects.map(project => {
            if (project.id === resizingTask.projectId) {
              return {
                ...project,
                tasks: project.tasks.map(task => {
                  if (task.id === resizingTask.id) {
                    return { ...task, duration: newDuration };
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
              return { ...task, duration: newDuration };
            }
            return task;
          }));
        }
      } catch (err) {
        setError('Failed to resize task');
        console.error(err);
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

  const handleTimeSlotClick = (time: string, date: string) => {
    setEditingTask({
      id: '', // Will be generated by Firestore
      title: '',
      priority: 'medium',
      duration: 30,
      startTime: time,
      day: format(new Date(date), 'EEE, MMM d'),
      userId: user?.uid || '',
    });
    setIsTaskDialogOpen(true);
  };

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleProjectDrop = async (projectId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggingTask || !user) return;

    try {
      // Remove startTime and day fields, add projectId
      const { startTime, day, ...taskWithoutTimeData } = draggingTask;
      const updates = {
        ...taskWithoutTimeData,
        projectId,
      };

      await updateTask(draggingTask.id, updates);

      // Remove from timeline/unassigned tasks
      setTasks(prev => prev.filter(t => t.id !== draggingTask.id));

      // Add to project
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: [...project.tasks, { ...updates, id: draggingTask.id }],
          };
        }
        return project;
      }));
    } catch (err) {
      setError('Failed to move task to project');
      console.error(err);
    }
    
    setDraggingTask(null);
  };

  const handleUnassignedDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggingTask || !user) return;

    try {
      // Remove startTime, day, and projectId fields
      const { startTime, day, projectId, ...taskWithoutTimeAndProject } = draggingTask;
      const updates = {
        ...taskWithoutTimeAndProject,
      };

      await updateTask(draggingTask.id, updates);

      // Remove from timeline and projects
      setProjects(projects.map(project => ({
        ...project,
        tasks: project.tasks.filter(t => t.id !== draggingTask.id),
      })));

      // Add to unassigned tasks if not already there
      setTasks(prev => {
        if (prev.some(t => t.id === draggingTask.id)) {
          return prev.map(t => t.id === draggingTask.id ? updates : t);
        }
        return [...prev, { ...updates, id: draggingTask.id }];
      });
    } catch (err) {
      setError('Failed to move task to unassigned');
      console.error(err);
    }
    
    setDraggingTask(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Project Board</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">Started: {format(currentDate, 'MM/dd/yyyy')}</p>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setIsTaskDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Day view selector */}
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
        {/* Projects Sidebar */}
        <div className="w-72 border-r bg-white overflow-y-auto">
          <div className="p-4">
            {/* Unassigned Tasks */}
            <div className="mb-6"
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
                  <Alert className="mb-2">
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{task.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            setEditingTask(task);
                            setIsTaskDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500">PROJECTS</h2>
                <Button variant="ghost" size="sm" onClick={handleAddProject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {projects.map(project => (
                <div key={project.id} 
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
                        onClick={() => toggleProjectCollapse(project.id)}
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            collapsedProjects.has(project.id) ? '' : 'rotate-90'
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={project.tasks.length > 0 
                      ? (project.tasks.filter(t => t.completed).length / project.tasks.length) * 100
                      : 0
                    } 
                    className="h-1 mb-3" 
                  />
                  {!collapsedProjects.has(project.id) && (
                    <div className="space-y-2">
                      {project.tasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart({ ...task, projectId: project.id }, e)}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-move group"
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
                            onClick={() => {
                              setEditingTask({ ...task, projectId: project.id });
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
                          setEditingTask({
                            id: '',
                            title: '',
                            priority: 'medium',
                            duration: 30,
                            projectId: project.id,
                            userId: user?.uid || '',
                          });
                          setIsTaskDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="flex-1 overflow-x-auto">
          <div className="p-4">
            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentDate(date => addDays(date, -dayColumns))}
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
              </div>
              <Button
                variant="ghost"
                onClick={() => setCurrentDate(date => addDays(date, dayColumns))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Timeline Grid */}
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
                          className="h-4 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(slot.time, format(date, 'EEE, MMM d'), e)}
                          onClick={() => handleTimeSlotClick(slot.time, format(date, 'yyyy-MM-dd'))}
                        />
                      ))}

                      {/* Render all tasks */}
                      {[...tasks, ...projects.flatMap(p => p.tasks)]
                        .filter(task => task.day === format(date, 'EEE, MMM d') && task.startTime)
                        .map(task => {
                          const startMinutes = parseInt(task.startTime!.split(':')[0]) * 60 + 
                                           parseInt(task.startTime!.split(':')[1]);
                          const top = ((startMinutes - 8 * 60) / 15) * 16;
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
                              onClick={() => {
                                setEditingTask(task);
                                setIsTaskDialogOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="font-medium">{task.title}</span>
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
      />
    </div>
  );
}
