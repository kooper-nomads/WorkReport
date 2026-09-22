import type { WorksectionTaskStatus } from '../worksection/worksection.types.js';

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
  project: AssignedTaskProject;
  assignee: AssignedTaskUser;
  tags: AssignedTaskTag[];
}
