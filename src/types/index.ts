export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  duration?: number;
  assignees?: User[];
}

export interface Board {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  settings: {
    layout: {
      showSidebar: boolean;
      showTimeline: boolean;
    };
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  tasks: Task[];
  settings: {
    layout: {
      showSidebar: boolean;
      showTimeline: boolean;
    };
  };
} 