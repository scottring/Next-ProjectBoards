import { useState } from 'react';
import { Task } from '@/types';
import { format, addDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './task-card';

interface TimelineProps {
  tasks: Task[];
  onTaskMove: (result: any) => void;
}

export function Timeline({ tasks, onTaskMove }: TimelineProps) {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const daysToShow = 3;

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Button 
          variant="ghost" 
          onClick={() => setStartDate(date => addDays(date, -daysToShow))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-8">
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

          <div className="flex-1 grid grid-cols-3">
            {Array.from({ length: daysToShow }).map((_, dayIndex) => (
              <div key={dayIndex} className="border-r">
                {generateTimeSlots().map(slot => {
                  const tasksInSlot = getTasksForSlot(dayIndex, slot.time);
                  return (
                    <div
                      key={`${dayIndex}-${slot.time}`}
                      className="h-8 border-b border-gray-100 relative"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-50');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-blue-50');
                      }}
                      onDrop={(e) => {
                        e.currentTarget.classList.remove('bg-blue-50');
                        // Handle drop
                      }}
                    >
                      {tasksInSlot.map(task => (
                        <div
                          key={task.id}
                          className="absolute left-0 right-0 px-2 py-1"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('taskId', task.id);
                          }}
                        >
                          <div className="bg-white shadow-sm rounded-md p-2 text-xs">
                            {task.title}
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