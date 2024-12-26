export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  startTime?: string;
  duration: number;
  day?: string;
  completed?: boolean;
  projectId?: string;
  userId: string;
}

export interface Project {
  id: string;
  title: string;
  tasks: Task[];
  progress: number;
  userId: string;
} 