import type { WorksectionTaskStatus } from '../worksection/worksection.types.js';
import type { TaskStatusGroup, TaskStatusTag } from './task-status-group.js';

export interface AssignedTaskProject {
  id: number;
  name: string;
}

export interface AssignedTaskUser {
  id: string;
  name: string;
}

export interface AssignedTaskTag {
  id: string;
  label: string;
}

export interface AssignedTask {
  id: number;
  name: string;
  status: WorksectionTaskStatus;
  statusTag: TaskStatusTag | null;
  project: AssignedTaskProject;
  author: AssignedTaskUser;
  assignee: AssignedTaskUser;
  tags: AssignedTaskTag[];
  createdAt: string;
  completedAt?: string | null;
}

export interface TasksGroupedByStatus {
  todo: AssignedTask[];
  in_progress: AssignedTask[];
  done: AssignedTask[];
}

export type { TaskStatusGroup };
