'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Search, ChevronLeft, ChevronRight, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { getProjects, getTasks, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask } from '@/lib/firestore';
import { Project, Task, TaskLocation } from '@/types';
import dynamic from 'next/dynamic';
import { useTaskDrag } from '@/hooks/use-task-drag';
import toast from 'react-hot-toast';

const TaskDialog = dynamic(() => import('./task-dialog').then(mod => mod.TaskDialog), {
  ssr: false,
  loading: () => null
});

export function CollectionBoard() {
  const { user } = useAuth();
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [resizingTask, setResizingTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [collections, setCollections] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dayColumns, setDayColumns] = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingCollection, setEditingCollection] = useState<Project | null>(null);
  const [collapsedLists, setCollapsedLists] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [boardName, setBoardName] = useState('Collection Board');
  const [editingListId, setEditingListId] = useState<string | null>(null);

  const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const {
    dragItem,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useTaskDrag();

  // Add this helper to determine if a drop is valid
  const isValidDrop = (location: TaskLocation) => {
    if (!dragItem) return false;
    
    // Prevent dropping on same location
    const source = dragItem.sourceLocation;
    if (source.type === location.type && 
        source.projectId === location.projectId && 
        source.day === location.day) {
      return false;
    }

    return true;
  };

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
        setCollections(projectsData);
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

  const handleAddCollection = async () => {
    if (!user) return;

    try {
      const newList = {
        title: 'New List',
        tasks: [],
        progress: 0,
        userId: user.uid,
      };
      
      const docRef = await addProject(user.uid, newList);
      setCollections([...collections, { ...newList, id: docRef.id }]);
    } catch (err) {
      setError('Failed to create list');
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
          setCollections(collections.map(collection => {
            if (collection.id === editingTask.projectId) {
              return {
                ...collection,
                tasks: collection.tasks.map(task => 
                  task.id === editingTask.id ? { ...task, ...fullTaskData } : task
                ),
              };
            }
            return collection;
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
          setCollections(collections.map(collection => {
            if (collection.id === fullTaskData.projectId) {
              return {
                ...collection,
                tasks: [...collection.tasks, newTask],
              };
            }
            return collection;
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
        setCollections(collections.map(collection => {
          if (collection.id === projectId) {
            return {
              ...collection,
              tasks: collection.tasks.map(task => {
                if (task.id === taskId) {
                  return { ...task, ...updates };
                }
                return task;
              }),
            };
          }
          return collection;
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
      setCollections(prev => prev.map(collection => ({
        ...collection,
        tasks: collection.tasks.filter(t => t.id !== taskId),
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

  const handleResizeStart = (task: Task, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dragging the entire event
    e.stopPropagation();
    
    const element = e.currentTarget.parentElement;
    if (!element) return;
    
    setResizingTask(task);
    resizeRef.current = {
      startY: e.clientY,
      startHeight: element.getBoundingClientRect().height
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current || !resizingTask) return;
      
      const deltaY = e.clientY - resizeRef.current.startY;
      // Round to nearest 15-minute increment (16px = 15 minutes)
      const roundedDelta = Math.round(deltaY / 16) * 16;
      const newHeight = Math.max(16, resizeRef.current.startHeight + roundedDelta); // Minimum 1 time slot
      
      const element = document.querySelector(`[data-task-id="${task.id}"]`);
      if (element) {
        element.setAttribute('style', element.getAttribute('style')?.replace(/height:[^;]+;?/, '') + `height: ${newHeight}px;`);
      }
    };

    const handleMouseUp = async (e: MouseEvent) => {
      e.stopPropagation(); // Prevent click event from bubbling up
      
      if (!resizeRef.current || !resizingTask) return;
      
      const element = document.querySelector(`[data-task-id="${task.id}"]`);
      if (!element) return;
      
      const height = element.getBoundingClientRect().height;
      // Round to nearest 15-minute increment
      const roundedHeight = Math.round(height / 16) * 16;
      const newDuration = Math.round((roundedHeight / 16) * 15); // Convert to minutes
      
      try {
        await updateTask(task.id, { duration: newDuration });
        // Update local state
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, duration: newDuration } : t
        ));
        setCollections(prev => prev.map(collection => ({
          ...collection,
          tasks: collection.tasks.map(t => 
            t.id === task.id ? { ...t, duration: newDuration } : t
          )
        })));
        toast.success('Task duration updated');
      } catch (err) {
        console.error('Failed to update task duration:', err);
        toast.error('Failed to update task duration');
      }
      
      setResizingTask(null);
      resizeRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Prevent the click event from firing
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        const preventClick = (e: Event) => {
          e.stopPropagation();
          taskElement.removeEventListener('click', preventClick);
        };
        taskElement.addEventListener('click', preventClick);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
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

  const toggleListCollapse = (listId: string) => {
    setCollapsedLists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
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
      setCollections(collections.map(collection => {
        if (collection.id === projectId) {
          return {
            ...collection,
            tasks: [...collection.tasks, { ...updates, id: draggingTask.id }],
          };
        }
        return collection;
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
      setCollections(collections.map(collection => ({
        ...collection,
        tasks: collection.tasks.filter(t => t.id !== draggingTask.id),
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

  const handleDrop = async (location: TaskLocation) => {
    if (!dragItem || !isValidDrop(location)) {
      handleDragEnd();
      return;
    }

    try {
      // Create base task data
      const baseTask = {
        title: dragItem.task.title,
        priority: dragItem.task.priority,
        duration: dragItem.task.duration,
        userId: dragItem.task.userId,
        completed: dragItem.task.completed || false
      };

      // Format the day to match the expected format
      const formattedDay = location.day ? format(new Date(location.day), 'EEE, MMM d') : undefined;

      // Add location-specific fields only if they have values
      const updatedTask = {
        ...baseTask,
        ...(location.projectId && { projectId: location.projectId }),
        ...(formattedDay && { day: formattedDay }),
        ...(location.startTime && { startTime: location.startTime })
      };

      // Update task with both task ID and the cleaned fields
      await updateTask(dragItem.task.id, updatedTask);
      
      // Update UI state based on the task's new location
      const taskWithId = { ...updatedTask, id: dragItem.task.id };

      if (location.type === 'project') {
        // Remove from previous project if it was in one
        if (dragItem.sourceLocation.type === 'project') {
          setCollections(prev => prev.map(collection => {
            if (collection.id === dragItem.sourceLocation.projectId) {
              return {
                ...collection,
                tasks: collection.tasks.filter(t => t.id !== dragItem.task.id)
              };
            }
            return collection;
          }));
        }
        // Remove from unassigned tasks if it was there
        setTasks(prev => prev.filter(t => t.id !== dragItem.task.id));
        
        // Add to new project
        setCollections(prev => prev.map(collection => {
          if (collection.id === location.projectId) {
            return {
              ...collection,
              tasks: [...collection.tasks, taskWithId]
            };
          }
          return collection;
        }));
      } else if (location.type === 'unassigned') {
        // Remove from projects if it was in one
        setCollections(prev => prev.map(collection => ({
          ...collection,
          tasks: collection.tasks.filter(t => t.id !== dragItem.task.id)
        })));
        
        // Add to unassigned tasks
        setTasks(prev => {
          const exists = prev.some(t => t.id === dragItem.task.id);
          if (exists) {
            return prev.map(t => t.id === dragItem.task.id ? taskWithId : t);
          }
          return [...prev, taskWithId];
        });
      } else if (location.type === 'timeline') {
        if (dragItem.sourceLocation.type === 'project') {
          // Update in the project's tasks array and remove from original project
          setCollections(prev => prev.map(collection => {
            if (collection.id === dragItem.sourceLocation.projectId) {
              return {
                ...collection,
                tasks: collection.tasks.map(t => 
                  t.id === dragItem.task.id ? taskWithId : t
                ).filter(t => t.id !== dragItem.task.id) // Remove the task from its original location
              };
            }
            return collection;
          }));

          // Add to unassigned tasks if not already there
          setTasks(prev => {
            const exists = prev.some(t => t.id === dragItem.task.id);
            if (exists) {
              return prev.map(t => t.id === dragItem.task.id ? taskWithId : t);
            }
            return [...prev, taskWithId];
          });
        } else {
          // Update in unassigned tasks
          const taskExists = tasks.some(t => t.id === dragItem.task.id);
          if (taskExists) {
            setTasks(prev => prev.map(t => 
              t.id === dragItem.task.id ? taskWithId : t
            ));
          } else {
            setTasks(prev => [...prev, taskWithId]);
          }
        }
      }

      toast.success('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    } finally {
      handleDragEnd();
    }
  };

  const handleListNameUpdate = async (collectionId: string, newName: string) => {
    if (!user) return;

    try {
      await updateProject(collectionId, { title: newName });
      setCollections(prev => prev.map(collection => 
        collection.id === collectionId 
          ? { ...collection, title: newName }
          : collection
      ));
    } catch (err) {
      setError('Failed to update list name');
      console.error(err);
    }
    setEditingListId(null);
  };

  const handleListDelete = async (collectionId: string) => {
    if (!user) return;

    try {
      await deleteProject(collectionId);
      setCollections(prev => prev.filter(collection => collection.id !== collectionId));
      toast.success('List deleted successfully');
    } catch (err) {
      console.error('Failed to delete list:', err);
      toast.error('Failed to delete list');
    }
  };

  const getEventPosition = (task: Task, allTasks: Task[]) => {
    if (!task.startTime || !task.day) return null;

    const overlappingTasks = allTasks.filter(t => 
      t.day === task.day &&
      t.startTime &&
      t.id !== task.id &&
      doesOverlap(task, t)
    );

    if (overlappingTasks.length === 0) {
      return { left: '0%', width: '100%' };
    }

    // Sort tasks by start time to ensure consistent ordering
    const sortedTasks = [task, ...overlappingTasks].sort((a, b) => {
      const aMinutes = timeToMinutes(a.startTime!);
      const bMinutes = timeToMinutes(b.startTime!);
      return aMinutes - bMinutes;
    });

    const index = sortedTasks.findIndex(t => t.id === task.id);
    const totalOverlapping = sortedTasks.length;
    const width = 100 / totalOverlapping;

    return {
      left: `${index * width}%`,
      width: `${width}%`
    };
  };

  const doesOverlap = (task1: Task, task2: Task) => {
    if (!task1.startTime || !task2.startTime) return false;
    
    const start1 = timeToMinutes(task1.startTime);
    const end1 = start1 + (task1.duration || 30);
    const start2 = timeToMinutes(task2.startTime);
    const end2 = start2 + (task2.duration || 30);

    return start1 < end2 && end1 > start2;
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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
            {isEditingBoardName ? (
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onBlur={() => setIsEditingBoardName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingBoardName(false);
                  }
                }}
                className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-bold cursor-pointer hover:bg-gray-100 rounded px-1" 
                onClick={() => setIsEditingBoardName(true)}
              >
                {boardName}
              </h1>
            )}
            <p className="text-gray-600 mt-2">Started: {format(currentDate, 'MM/dd/yyyy')}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Day view selector */}
            <div className="flex items-center gap-2">
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
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collections Sidebar */}
        <div className="w-72 border-r bg-white overflow-y-auto">
          <div className="p-4">
            {/* Unassigned Tasks */}
            <div className="mb-6"
              onDragOver={(e) => {
                e.preventDefault();
                const location: TaskLocation = {
                  type: 'unassigned'
                };
                handleDragOver(location);
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const location: TaskLocation = {
                  type: 'unassigned'
                };
                handleDrop(location);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500">UNASSIGNED TASKS</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTask({
                      id: '',
                      title: '',
                      priority: 'medium',
                      duration: 30,
                      userId: user?.uid || '',
                    });
                    setIsTaskDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tasks.filter(t => !t.startTime).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    const sourceLocation: TaskLocation = {
                      type: task.projectId ? 'project' : 'unassigned',
                      projectId: task.projectId,
                      day: task.day,
                      startTime: task.startTime
                    };
                    handleDragStart(task, sourceLocation);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const location: TaskLocation = {
                      type: task.projectId ? 'project' : 'unassigned',
                      projectId: task.projectId,
                      day: task.day,
                      startTime: task.startTime
                    };
                    handleDragOver(location);
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const location: TaskLocation = {
                      type: task.projectId ? 'project' : 'unassigned',
                      projectId: task.projectId,
                      day: task.day,
                      startTime: task.startTime
                    };
                    handleDrop(location);
                  }}
                  className="cursor-move group"
                >
                  <Alert className="mb-2">
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{task.title}</span>
                        <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            onClick={() => handleTaskDelete(task.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </div>

            {/* Collections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500">LISTS</h2>
                <Button variant="ghost" size="sm" onClick={handleAddCollection}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {collections.map(collection => (
                <div key={collection.id} 
                  className="border rounded-lg p-3"
                  onDragOver={(e) => {
                    e.preventDefault();
                    const location: TaskLocation = {
                      type: 'project',
                      projectId: collection.id
                    };
                    handleDragOver(location);
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const location: TaskLocation = {
                      type: 'project',
                      projectId: collection.id
                    };
                    handleDrop(location);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    {editingListId === collection.id ? (
                      <input
                        type="text"
                        value={collection.title}
                        onChange={(e) => {
                          setCollections(prev => prev.map(c => 
                            c.id === collection.id 
                              ? { ...c, title: e.target.value }
                              : c
                          ));
                        }}
                        onBlur={() => handleListNameUpdate(collection.id, collection.title)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleListNameUpdate(collection.id, collection.title);
                          }
                        }}
                        className="font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                        autoFocus
                      />
                    ) : (
                      <h3 
                        className="font-medium cursor-pointer hover:bg-gray-100 rounded px-1"
                        onClick={() => setEditingListId(collection.id)}
                      >
                        {collection.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {collection.tasks.filter(t => t.completed).length}/{collection.tasks.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleListCollapse(collection.id)}
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            collapsedLists.has(collection.id) ? '' : 'rotate-90'
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => handleListDelete(collection.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={collection.tasks.length > 0 
                      ? (collection.tasks.filter(t => t.completed).length / collection.tasks.length) * 100
                      : 0
                    } 
                    className="h-1 mb-3" 
                  />
                  {!collapsedLists.has(collection.id) && (
                    <div className="space-y-2">
                      {collection.tasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            const sourceLocation: TaskLocation = {
                              type: task.projectId ? 'project' : 'unassigned',
                              projectId: task.projectId,
                              day: task.day,
                              startTime: task.startTime
                            };
                            handleDragStart(task, sourceLocation);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            const location: TaskLocation = {
                              type: task.projectId ? 'project' : 'unassigned',
                              projectId: task.projectId,
                              day: task.day,
                              startTime: task.startTime
                            };
                            handleDragOver(location);
                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const location: TaskLocation = {
                              type: task.projectId ? 'project' : 'unassigned',
                              projectId: task.projectId,
                              day: task.day,
                              startTime: task.startTime
                            };
                            handleDrop(location);
                          }}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-move group"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => handleTaskUpdate(collection.id, task.id, { completed: e.target.checked })}
                            className="h-4 w-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className={task.completed ? 'line-through text-gray-400' : ''}>
                            {task.title}
                          </span>
                          <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTask({ ...task, projectId: collection.id });
                                setIsTaskDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              onClick={() => handleTaskDelete(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
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
                            projectId: collection.id,
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
            <div className="flex items-center justify-between mb-4 px-16">
              <Button
                variant="ghost"
                onClick={() => setCurrentDate(date => addDays(date, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${dayColumns}, 1fr)` }}>
                {getDaysArray().map(date => (
                  <div key={date.toString()} className="text-sm font-medium text-center">
                    {format(date, 'EEEE, MMMM d')}
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={() => setCurrentDate(date => addDays(date, 1))}
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
                    {/* 15-minute drop zones */}
                    <div className="relative">
                      {generateTimeSlots().map((slot) => (
                        <div
                          key={slot.time}
                          className="h-4 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                          onDragOver={(e) => {
                            e.preventDefault();
                            const location: TaskLocation = {
                              type: 'timeline',
                              day: date.toISOString(),
                              startTime: slot.time
                            };
                            handleDragOver(location);
                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const location: TaskLocation = {
                              type: 'timeline',
                              day: date.toISOString(),
                              startTime: slot.time
                            };
                            handleDrop(location);
                          }}
                          onClick={() => handleTimeSlotClick(slot.time, format(date, 'yyyy-MM-dd'))}
                        />
                      ))}

                      {/* Render all tasks */}
                      {[...tasks, ...collections.flatMap(p => p.tasks)]
                        .filter((task, index, self) => {
                          // Remove duplicates by ID
                          const firstIndex = self.findIndex(t => t.id === task.id);
                          if (index !== firstIndex) return false;

                          // Only show tasks that have a day and startTime
                          if (!task.day || !task.startTime) return false;
                          
                          // Check if this task's day matches the current column's date
                          const taskDay = task.day;
                          const columnDay = format(date, 'EEE, MMM d');
                          return taskDay === columnDay;
                        })
                        .map(task => {
                          const startMinutes = parseInt(task.startTime!.split(':')[0]) * 60 + 
                                           parseInt(task.startTime!.split(':')[1]);
                          const top = ((startMinutes - 8 * 60) / 15) * 16;
                          const height = (task.duration / 15) * 16;
                          const position = getEventPosition(task, [...tasks, ...collections.flatMap(p => p.tasks)]);
                          
                          return (
                            <div
                              key={task.id}
                              data-task-id={task.id}
                              draggable
                              onDragStart={(e) => {
                                const sourceLocation: TaskLocation = {
                                  type: 'timeline',
                                  day: task.day,
                                  startTime: task.startTime
                                };
                                handleDragStart(task, sourceLocation);
                              }}
                              className="absolute bg-blue-100 border border-blue-300 rounded px-2 text-xs cursor-move group transition-[height]"
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                left: position?.left || '0%',
                                width: position?.width || '100%',
                                zIndex: 10
                              }}
                              onClick={() => {
                                setEditingTask(task);
                                setIsTaskDialogOpen(true);
                              }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 flex-1 overflow-hidden">
                                  <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                  <span className="font-medium truncate">{task.title}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskDelete(task.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              {/* Resize handle */}
                              <div
                                className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-blue-200 group-hover:opacity-100 opacity-0 transition-opacity"
                                onMouseDown={(e) => handleResizeStart(task, e)}
                                draggable={false} // Prevent dragging of the resize handle
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
