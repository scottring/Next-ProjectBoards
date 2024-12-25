import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{task.title}</h3>
            <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
              {task.priority}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(task.startDate), 'MMM d')}
              </div>
            )}
            {task.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {task.duration} min
              </div>
            )}
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {task.assignees.length}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 