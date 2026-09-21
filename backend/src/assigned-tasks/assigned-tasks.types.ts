import type { WorksectionTaskStatus } from '../worksection/worksection.types.js';
import type { ReportTaskTag, ReportTaskUser } from '../report/report.types.js';

export interface AssignedTaskProject {
  id: number;
  name: string;
}

export interface AssignedTask {
  id: number;
  name: string;
  status: WorksectionTaskStatus;
  project: AssignedTaskProject;
  assignee: ReportTaskUser;
  tags: ReportTaskTag[];
  // Absent when the task was already assigned to this user before our fetched event
  // history begins — we know they held it, just not since exactly when.
  assignedAt?: string;
}
