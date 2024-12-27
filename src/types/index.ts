export interface TaskLocation {
  type: 'timeline' | 'project' | 'unassigned';
  projectId?: string;
  day?: string;
  startTime?: string;
}

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  duration: number;
  completed?: boolean;
  userId: string;
  // Location properties
  projectId?: string;
  day?: string;
  startTime?: string;
  column?: number; // For timeline view positioning
}

export interface DragItem {
  task: Task;
  sourceLocation: TaskLocation;
}

export interface Project {
  id: string;
  title: string;
  tasks: Task[];
  progress: number;
  userId: string;
} 