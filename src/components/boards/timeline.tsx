'use client';

import { useState, useEffect } from 'react';
import { Task } from '../../types';
import { format, addDays, startOfDay, isSameDay, addMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { TaskCard } from './task-card';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/select';

interface TimelineProps {
  tasks: Task[];
  onTaskMove: (result: any) => void;
  onDropFromSource: (task: any, date: Date, time: string) => void;
}

export function Timeline({ tasks, onTaskMove, onDropFromSource }: TimelineProps) {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [timelineColumns, setTimelineColumns] = useState(3);
  const [resizing, setResizing] = useState<{ taskId: string; startY: number } | null>(null);
  const [dragging, setDragging] = useState<{ taskId: string; startX: number; startY: number } | null>(null);
  const daysToShow = timelineColumns;

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

  const getTasksForSlot = (dayIndex: number, timeSlot: string) => {
    return tasks.filter(task => {
      if (!task.startDate) return false;
      const taskDate = new Date(task.startDate);
      const slotDate = addDays(startDate, dayIndex);
      const [hour, minute] = timeSlot.split(':').map(Number);
      return (
        isSameDay(taskDate, slotDate) &&
        taskDate.getHours() === hour &&
        Math.floor(taskDate.getMinutes() / 15) * 15 === minute
      );
    });
  };

  const handleResizeStart = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setResizing({ taskId, startY: e.clientY });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;

    const task = tasks.find(t => t.id === resizing.taskId);
    if (!task || !task.startDate) return;

    const deltaY = e.clientY - resizing.startY;
    const deltaMinutes = Math.round(deltaY / 8) * 15; // 8px per 15 minutes
    const newDuration = Math.max(15, (task.duration || 15) + deltaMinutes);

    onTaskMove({
      id: task.id,
      duration: newDuration
    });
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  const handleDragStart = (e: React.MouseEvent, taskId: string) => {
    if (resizing) return;
    e.stopPropagation();
    setDragging({ taskId, startX: e.clientX, startY: e.clientY });
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragging) return;

    const task = tasks.find(t => t.id === dragging.taskId);
    if (!task || !task.startDate) return;

    const deltaX = Math.round((e.clientX - dragging.startX) / (32 * 4)) * 24 * 60; // One column is 24 hours
    const deltaY = Math.round((e.clientY - dragging.startY) / 32) * 15; // 32px per 15 minutes
    const currentDate = new Date(task.startDate);
    const newDate = new Date(currentDate.getTime() + (deltaX + deltaY) * 60000);

    onTaskMove({
      id: task.id,
      startDate: newDate.toISOString()
    });
  };

  const handleDragEnd = (e: MouseEvent) => {
    if (!dragging) return;
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const timeSlot = elements.find(el => el.getAttribute('data-timeslot'));
    
    if (timeSlot) {
      const [dayIndex, time] = timeSlot.getAttribute('data-timeslot')!.split('|');
      const [hour, minute] = time.split(':').map(Number);
      const newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() + parseInt(dayIndex));
      newDate.setHours(hour);
      newDate.setMinutes(minute);
      
      onTaskMove({
        id: dragging.taskId,
        startDate: newDate.toISOString()
      });
    }
    
    setDragging(null);
    document.querySelectorAll('.opacity-50').forEach(el => el.classList.remove('opacity-50'));
  };

  // Add event listeners
  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [dragging]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Button 
          variant="ghost" 
          onClick={() => setStartDate(date => addDays(date, -daysToShow))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <Select
            value={timelineColumns.toString()}
            onValueChange={(value) => setTimelineColumns(parseInt(value))}
          >
            <SelectTrigger className="sm:w-[180px]">
              <span className="hidden sm:inline-block">Day View:</span> {timelineColumns} Columns
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Column</SelectItem>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="7">7 Columns</SelectItem>
            </SelectContent>
          </Select>
          {Array.from({ length: daysToShow }).map((_, i) => (
            <div key={i} className="text-sm font-medium">
              {format(addDays(startDate, i), 'EEE, MMM d')}
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => setStartDate(date => addDays(date, daysToShow))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex">
          <div className="w-16 flex-shrink-0 border-r">
            {generateTimeSlots().map(slot => (
              <div key={slot.time} className="h-8 flex items-center justify-end pr-2 text-xs text-gray-500">
                {slot.time}
              </div>
            ))}
          </div>
          <div className={`flex-1 grid ${
            timelineColumns === 1 ? 'grid-cols-1' :
            timelineColumns === 2 ? 'grid-cols-2' :
            timelineColumns === 7 ? 'grid-cols-7' :
            'grid-cols-3'
          }`}>
            {Array.from({ length: daysToShow }).map((_, dayIndex) => (
              <div key={dayIndex} className="border-r">
                {generateTimeSlots().map(slot => {
                  const tasksInSlot = getTasksForSlot(dayIndex, slot.time);
                  return (
                    <div
                      key={`${dayIndex}-${slot.time}`}
                      className="h-8 border-b border-gray-100 relative"
                      data-timeslot={`${dayIndex}|${slot.time}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-50');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-blue-50');
                      }}
                      onDrop={(e) => {
                        e.currentTarget.classList.remove('bg-blue-50');
                        const taskId = e.dataTransfer.getData('taskId');
                        const [hour, minute] = slot.time.split(':').map(Number);
                        const newDate = new Date(startDate);
                        newDate.setDate(newDate.getDate() + dayIndex);
                        newDate.setHours(hour);
                        newDate.setMinutes(minute);
                        onTaskMove({ id: taskId, startDate: newDate.toISOString() });
                      }}
                    >
                      {tasksInSlot.map(task => (
                        <div
                          key={task.id}
                          className="absolute left-0 right-0 px-2 cursor-move"
                          style={{
                            height: `${((task.duration || 15) / 15) * 32}px`,
                            minHeight: '32px'
                          }}
                          onMouseDown={(e) => handleDragStart(e, task.id)}
                        >
                          <div className="bg-white shadow-sm rounded-md p-2 text-xs h-full relative group">
                            {task.title}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100"
                              onMouseDown={(e) => handleResizeStart(e, task.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
