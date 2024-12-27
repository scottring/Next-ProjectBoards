import { Task } from './index';

export enum TaskState {
  Unassigned = 'UNASSIGNED',
  Timeline = 'TIMELINE',
  Project = 'PROJECT'
}

export interface TaskStateContext {
  time?: string;
  day?: string;
  projectId?: string;
}

export const getTaskState = (task: Task): TaskState => {
  if (task.projectId) return TaskState.Project;
  if (task.startTime && task.day) return TaskState.Timeline;
  return TaskState.Unassigned;
};

export const transitionTask = (
  task: Task,
  toState: TaskState,
  context: TaskStateContext
): Partial<Task> => {
  const fromState = getTaskState(task);
  const updates: Partial<Task> = {};

  // First clear the old state
  switch (fromState) {
    case TaskState.Timeline:
      updates.startTime = undefined;
      updates.day = undefined;
      break;
    case TaskState.Project:
      updates.projectId = undefined;
      break;
  }

  // Then set the new state
  switch (toState) {
    case TaskState.Timeline:
      if (!context.time || !context.day) {
        throw new Error('Time and day are required for Timeline state');
      }
      updates.startTime = context.time;
      updates.day = context.day;
      break;
    case TaskState.Project:
      if (!context.projectId) {
        throw new Error('Project ID is required for Project state');
      }
      updates.projectId = context.projectId;
      break;
    case TaskState.Unassigned:
      // No additional fields needed for unassigned state
      break;
  }

  return updates;
};
