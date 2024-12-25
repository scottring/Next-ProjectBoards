import React, { useState } from 'react';
import { Calendar, Search, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface Task {
  id: number;
  title: string;
  priority: string;
  startTime: string;
  duration: number;
  day: string;
}

export function ProjectBoard() {
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 1, 
      title: 'Add project board', 
      priority: 'Must Have',
      startTime: '10:00',
      duration: 45, // in minutes
      day: 'Wed, Dec 25'
    }
  ]);

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

  const handleDragStart = (task: Task) => {
    setDraggingTask(task);
  };

  const handleDrop = (time: string, day: string) => {
    if (!draggingTask) return;
    
    setTasks(prev => {
      const updatedTasks = prev.filter(t => t.id !== draggingTask.id);
      return [...updatedTasks, {
        ...draggingTask,
        startTime: time,
        day: day
      }];
    });
    setDraggingTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Project Board Builder Board</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">Started: 6/30/2024</p>
              <Progress value={35} className="w-32" />
              <span className="text-sm text-gray-600">35% Complete</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md flex items-center gap-2">
              <Plus size={16} />
              Add Task
            </button>
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
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with Draggable Tasks */}
        <div className="w-72 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">UNASSIGNED TASKS</h2>
              {tasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="cursor-move"
                >
                  <Alert className="bg-red-50 border-red-200 mb-2">
                    <AlertDescription>
                      <div className="flex items-center gap-2">
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
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Easier task add ui</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">2/3</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
                <Progress value={66} className="h-1 mb-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline View with Drop Zones */}
        <div className="flex-1 overflow-x-auto">
          <div className="p-4">
            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-4">
              <button className="p-2 hover:bg-gray-100 rounded"><ChevronLeft /></button>
              <div className="flex items-center gap-4">
                <button className="px-3 py-1 text-sm bg-gray-100 rounded">Today</button>
                <h3 className="font-medium">Wed, Dec 25 - Fri, Dec 27</h3>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded"><ChevronRight /></button>
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
              <div className="ml-16 grid grid-cols-3 gap-4">
                {['Wed, Dec 25', 'Thu, Dec 26', 'Fri, Dec 27'].map((day) => (
                  <div key={day} className="border-l relative">
                    <div className="h-12 border-b px-4 flex items-center">
                      <span className="text-sm font-medium">{day}</span>
                    </div>
                    
                    {/* 15-minute drop zones */}
                    <div className="relative">
                      {generateTimeSlots().map((slot) => (
                        <div
                          key={`${day}-${slot.time}`}
                          className="h-4 border-b border-gray-100"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(slot.time, day)}
                        />
                      ))}

                      {/* Render scheduled tasks */}
                      {tasks
                        .filter(task => task.day === day)
                        .map(task => {
                          const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + 
                                            parseInt(task.startTime.split(':')[1]);
                          const top = ((startMinutes - 8 * 60) / 15) * 16; // 16px per 15min
                          const height = (task.duration / 15) * 16;
                          
                          return (
                            <div
                              key={task.id}
                              className="absolute left-0 right-0 bg-blue-100 border border-blue-300 rounded px-2 text-xs"
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                zIndex: 10
                              }}
                            >
                              {task.title}
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

      {/* Floating Action Button */}
      <button className="fixed right-6 bottom-6 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600">
        <Plus />
      </button>
    </div>
  );
} 