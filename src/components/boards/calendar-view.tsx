'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Search, ChevronLeft, ChevronRight, GripVertical, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaskDialog } from './task-dialog';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  type: 'task' | 'event';
  attendees?: string[];
  project?: string;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const resizeRef = useRef<{
    event: CalendarEvent;
    startY: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current || !isResizing) return;

      const { event, startY, startHeight } = resizeRef.current;
      const diff = e.clientY - startY;
      const newHeight = Math.max(48, startHeight + diff);
      const minutes = Math.round((newHeight / 16) * 15); // 16px = 15 minutes

      const [hours, mins] = event.startTime.split(':').map(Number);
      const endTime = new Date(2000, 0, 1, hours, mins + minutes);
      const endTimeString = format(endTime, 'HH:mm');

      setEvents(events.map(evt => 
        evt.id === event.id 
          ? { ...evt, endTime: endTimeString }
          : evt
      ));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, events]);

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent<HTMLDivElement>) => {
    if (isResizing) {
      e.preventDefault();
      return;
    }
    setDraggingEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.backgroundColor = '';
    }
  };

  const handleDrop = (time: string, date: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.backgroundColor = '';
    }
    
    if (!draggingEvent) return;

    const updatedEvent = {
      ...draggingEvent,
      startTime: time,
      date: date
    };

    setEvents(events.map(event => 
      event.id === draggingEvent.id ? updatedEvent : event
    ));
    
    setDraggingEvent(null);
  };

  const handleResizeStart = (event: CalendarEvent, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.currentTarget.parentElement;
    if (!element) return;

    setIsResizing(true);
    resizeRef.current = {
      event,
      startY: e.clientY,
      startHeight: element.getBoundingClientRect().height
    };
  };

  // Generate time slots from 8 AM to 8 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          height: 'h-4'
        });
      }
    }
    return slots;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          onClick={() => setCurrentDate(date => addDays(date, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-medium">
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
        <Button
          variant="ghost"
          onClick={() => setCurrentDate(date => addDays(date, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-[720px]">
          {/* Time markers */}
          <div className="absolute top-0 left-0 w-16 border-r">
            {generateTimeSlots().map((slot, i) => (
              i % 4 === 0 && (
                <div key={slot.time} className="h-16 -mt-2 text-xs text-gray-500 flex items-center justify-end pr-2">
                  {slot.time}
                </div>
              )
            ))}
          </div>

          {/* Events grid */}
          <div className="ml-16">
            {generateTimeSlots().map(slot => (
              <div
                key={slot.time}
                className="h-4 border-b border-gray-100"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(slot.time, format(currentDate, 'yyyy-MM-dd'), e)}
              />
            ))}

            {/* Render events */}
            {events.map(event => {
              const startMinutes = parseInt(event.startTime.split(':')[0]) * 60 + 
                               parseInt(event.startTime.split(':')[1]);
              const top = ((startMinutes - 8 * 60) / 15) * 16;
              
              const endMinutes = parseInt(event.endTime.split(':')[0]) * 60 + 
                             parseInt(event.endTime.split(':')[1]);
              const height = ((endMinutes - startMinutes) / 15) * 16;

              return (
                <div
                  key={event.id}
                  draggable={!isResizing}
                  onDragStart={(e) => handleDragStart(event, e)}
                  className={`absolute left-0 right-0 bg-blue-100 border border-blue-300 rounded px-2 text-xs ${isResizing && resizeRef.current?.event.id === event.id ? 'pointer-events-none' : 'cursor-move'}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    zIndex: 10
                  }}
                >
                  <div className="flex items-center gap-1">
                    <GripVertical className="h-3 w-3" />
                    <span>{event.title}</span>
                  </div>
                  {/* Resize handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
                    style={{ height: '10px', marginBottom: '-5px', cursor: 'ns-resize' }}
                    onMouseDown={(e) => handleResizeStart(event, e)}
                  >
                    <div className="w-8 h-1 bg-blue-300 rounded hover:bg-blue-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={editingEvent ? {
          id: editingEvent.id,
          title: editingEvent.title,
          priority: 'medium',
          duration: 30,
          startDate: new Date(),
        } : null}
        onSubmit={() => {}}
        boardId="calendar"
      />
    </div>
  );
}
