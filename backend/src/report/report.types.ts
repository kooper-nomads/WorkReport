import type { WorksectionTaskStatus } from '../worksection/worksection.types.js';

export interface ReportTaskUser {
  id: string;
  name: string;
}

export interface ReportTaskTag {
  id: string;
  label: string;
}

export interface ReportTaskEvent {
  id: string;
  action: string;
  date: string;
  userFrom: string;
  summary: string;
}

export interface ReportTask {
  id: number;
  name: string;
  status: WorksectionTaskStatus;
  author: ReportTaskUser;
  assignee: ReportTaskUser;
  tags: ReportTaskTag[];
  events: ReportTaskEvent[];
}
