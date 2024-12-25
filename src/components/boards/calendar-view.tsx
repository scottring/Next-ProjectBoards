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
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');

  // Sample data
  const [events] = useState([
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

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(date => addDays(date, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(date => addDays(date, 7))}
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
                          className="absolute left-1 right-1 rounded-md p-2 text-sm"
                          style={{
                            top: `${startFromTop}px`,
                            height: `${height}px`,
                            backgroundColor: event.type === 'meeting' ? 'rgb(219 234 254)' : 'rgb(254 226 226)',
                            borderLeft: `3px solid ${event.type === 'meeting' ? 'rgb(59 130 246)' : 'rgb(239 68 68)'}`,
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {event.attendees && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {event.attendees.length}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.date} at {event.startTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">My Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Sarah Chen', 'Mike Ross', 'Alex Kim'].map((member) => (
                <div key={member} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.split(' ')[0][0]}
                    </div>
                    <span>{member}</span>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" /> Available
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .filter(event => event.type === 'deadline')
                .map((event) => (
                  <div key={event.id} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.project}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 