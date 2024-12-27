import { useState } from 'react';
import { Task, TaskLocation, DragItem } from '@/types';

export function useTaskDrag() {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskLocation | null>(null);

  const handleDragStart = (task: Task, sourceLocation: TaskLocation) => {
    setDragItem({ task, sourceLocation });
  };

  const handleDragOver = (location: TaskLocation) => {
    setDropTarget(location);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setDropTarget(null);
  };

  return {
    dragItem,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
} 