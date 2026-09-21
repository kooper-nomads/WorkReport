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
}
