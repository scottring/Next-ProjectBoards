import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Users,
  Clock,
  GripVertical,
  Plus,
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { ProjectBox } from './project-box';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  type: 'meeting' | 'deadline';
  attendees?: string[];
  project?: string;
}

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

interface ResizingState {
  event: CalendarEvent;
  position: 'top' | 'bottom';
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [dayColumns, setDayColumns] = useState(7);
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<ResizingState | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Project Alpha',
      tasks: [
        { id: '1', title: 'Research', completed: true },
        { id: '2', title: 'Design', completed: false },
        { id: '3', title: 'Implementation', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Project Beta',
      tasks: [
        { id: '4', title: 'Planning', completed: true },
        { id: '5', title: 'Development', completed: true },
        { id: '6', title: 'Testing', completed: false },
      ],
    },
  ]);

  // Sample data
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      startTime: '09:00',
      endTime: '10:00',
      date: '2024-01-25',
      type: 'meeting',
      attendees: ['Sarah', 'Mike', 'Alex'],
    },
    {
      id: '2',
      title: 'Project Deadline',
      startTime: '14:00',
      endTime: '15:00',
      date: '2024-01-25',
      type: 'deadline',
      project: 'UI Redesign',
    },
  ]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate time slots from 8 AM to 6 PM
  const timeSlots = Array.from({ length: 21 }).map((_, index) => {
    const hour = Math.floor(index / 2) + 8;
    const minutes = index % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (date: Date, time: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';

    if (!draggingEvent) return;

    const newEvent = {
      ...draggingEvent,
      date: format(date, 'yyyy-MM-dd'),
      startTime: time,
      endTime: format(parseISO(`2000-01-01T${time}`).setHours(
        parseISO(`2000-01-01T${time}`).getHours() + 1
      ), 'HH:mm')
    };

    // Check if the dragged item is a task from a project
    const sourceProjectId = draggingEvent.project;
    if (sourceProjectId) {
      // Move the task to the timeline
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === sourceProjectId
            ? { ...project, tasks: project.tasks.filter(task => task.id !== draggingEvent.id) }
            : project
        )
      );
    } else {
      // If it's an existing calendar event, update its position
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === draggingEvent.id ? newEvent : event
        )
      );
    }

    setDraggingEvent(null);
  };
foregroundView
```
This modification checks if the `draggingEvent` has a `project` property. If it does, it means the event originated from a `ProjectBox`. In this case, the task is added to the `events` state and removed from the corresponding project's `tasks` array. If the `project` property is not present, it's treated as an existing calendar event, and its position is updated.
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Users,
  Clock,
  GripVertical,
  Plus,
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { ProjectBox } from './project-box';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  type: 'meeting' | 'deadline';
  attendees?: string[];
  project?: string;
}

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

interface ResizingState {
  event: CalendarEvent;
  position: 'top' | 'bottom';
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<ResizingState | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Project Alpha',
      tasks: [
        { id: '1', title: 'Research', completed: true },
        { id: '2', title: 'Design', completed: false },
        { id: '3', title: 'Implementation', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Project Beta',
      tasks: [
        { id: '4', title: 'Planning', completed: true },
        { id: '5', title: 'Development', completed: true },
        { id: '6', title: 'Testing', completed: false },
      ],
    },
  ]);

  // Sample data
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      startTime: '09:00',
      endTime: '10:00',
      date: '2024-01-25',
      type: 'meeting',
      attendees: ['Sarah', 'Mike', 'Alex'],
    },
    {
      id: '2',
      title: 'Project Deadline',
      startTime: '14:00',
      endTime: '15:00',
      date: '2024-01-25',
      type: 'deadline',
      project: 'UI Redesign',
    },
  ]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate time slots from 8 AM to 6 PM
  const timeSlots = Array.from({ length: 21 }).map((_, index) => {
    const hour = Math.floor(index / 2) + 8;
    const minutes = index % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (date: Date, time: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggingEvent) return;

    const updatedEvents = events.map(event => {
      if (event.id === draggingEvent.id) {
        return {
          ...event,
          date: format(date, 'yyyy-MM-dd'),
          startTime: time,
          endTime: format(parseISO(`2000-01-01T${time}`).setHours(
            parseISO(`2000-01-01T${time}`).getHours() + 1
          ), 'HH:mm')
        };
      }
      return event;
    });

    // If it's a new event from a task
    if (!events.find(e => e.id === draggingEvent.id)) {
      updatedEvents.push({
        ...draggingEvent,
        date: format(date, 'yyyy-MM-dd'),
        startTime: time,
        endTime: format(parseISO(`2000-01-01T${time}`).setHours(
          parseISO(`2000-01-01T${time}`).getHours() + 1
        ), 'HH:mm')
      });
    }

    setEvents(updatedEvents);
    setDraggingEvent(null);
  };

  const handleResizeStart = (event: CalendarEvent, position: 'top' | 'bottom', e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingEvent({ event, position });
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizingEvent) return;

    const { event, position } = resizingEvent;
    const timeSlotHeight = 48; // Height of each 30-minute slot
    const newHeight = Math.max(timeSlotHeight, Math.round(e.clientY / timeSlotHeight) * timeSlotHeight);

    if (position === 'bottom') {
      const updatedEvents = events.map(evt => {
        if (evt.id === event.id) {
          const startMinutes = parseInt(evt.startTime.split(':')[0]) * 60 + parseInt(evt.startTime.split(':')[1]);
          const newDurationMinutes = Math.round((newHeight / timeSlotHeight) * 30);
          const endMinutes = startMinutes + newDurationMinutes;
          
          return {
            ...evt,
            endTime: `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`
          };
        }
        return evt;
      });

      setEvents(updatedEvents);
    }
  };

  const handleResizeEnd = () => {
    setResizingEvent(null);
  };

  const handleTaskDragStart = (task: Task) => {
    setDraggingEvent({
      id: task.id,
      title: task.title,
      startTime: task.startTime || '09:00',
      endTime: task.endTime || '10:00',
      date: task.date || format(new Date(), 'yyyy-MM-dd'),
      type: 'meeting',
    });
  };

  const handleAddTask = (projectId: string, task: Task) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: [...project.tasks, task],
        };
      }
      return project;
    }));
  };

  const handleTaskUpdate = (projectId: string, taskId: string, updates: Partial<Task>) => {
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
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: 'New Project',
      tasks: [],
    };
    setProjects([...projects, newProject]);
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Select
            defaultValue={view}
            onValueChange={(value) => setView(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          {/* Calendar Navigation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(date => addDays(date, -1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-lg">
                    {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(date => addDays(date, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-4">
                {/* Time labels */}
                <div className="space-y-6">
                  <div className="h-12" /> {/* Header spacer */}
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-12 text-sm text-muted-foreground text-right pr-4"
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* Days */}
                {daysInWeek.map((date) => (
                  <div key={date.toString()} className="space-y-2">
                    {/* Day header */}
                    <div className="text-center h-12 flex flex-col justify-center">
                      <div className="text-sm font-medium">
                        {format(date, 'EEE')}
                      </div>
                      <div className={`text-2xl ${
                        format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                          ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                          : ''
                      }`}>
                        {format(date, 'd')}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="relative">
                      {timeSlots.map((time) => (
                        <div
                          key={time}
                          className="h-12 border-t border-gray-100 relative"
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(date, time, e)}
                        />
                      ))}

                      {/* Events */}
                      {events
                        .filter(event => event.date === format(date, 'yyyy-MM-dd'))
                        .map((event) => {
                          const startMinutes = parseInt(event.startTime.split(':')[0]) * 60 +
                            parseInt(event.startTime.split(':')[1]);
                          const endMinutes = parseInt(event.endTime.split(':')[0]) * 60 +
                            parseInt(event.endTime.split(':')[1]);
                          const startFromTop = ((startMinutes - 8 * 60) / 30) * 48; // 48px per 30 minutes
                          const height = ((endMinutes - startMinutes) / 30) * 48;

                          return (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={(e) => handleDragStart(event, e)}
                              className="absolute left-1 right-1 rounded-md p-2 text-sm cursor-move group"
                              style={{
                                top: `${startFromTop}px`,
                                height: `${height}px`,
                                backgroundColor: event.type === 'meeting' ? 'rgb(219 234 254)' : 'rgb(254 226 226)',
                                borderLeft: `3px solid ${event.type === 'meeting' ? 'rgb(59 130 246)' : 'rgb(239 68 68)'}`,
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="font-medium truncate">{event.title}</div>
                              </div>
                              {event.attendees && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {event.attendees.length}
                                </div>
                              )}
                              {/* Resize handles */}
                              <div
                                className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize bg-transparent hover:bg-blue-500"
                                onMouseDown={(e) => handleResizeStart(event, 'bottom', e)}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Button variant="outline" size="sm" onClick={handleAddProject}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {projects.map(project => (
            <ProjectBox
              key={project.id}
              project={project}
              onTaskDragStart={handleTaskDragStart}
              onAddTask={handleAddTask}
              onTaskUpdate={handleTaskUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
