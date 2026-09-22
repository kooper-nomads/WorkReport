export interface WorksectionResponse<T> {
  status: 'ok' | 'error';
  data: T;
  message?: string;
}

export interface WorksectionUser {
  id: number;
  email: string;
  name: string;
  [key: string]: unknown;
}

export type WorksectionTaskStatus = 'active' | 'done';

export interface WorksectionTask {
  id: number;
  name: string;
  status: WorksectionTaskStatus;
  page: string;
  priority: string;
  user_from: WorksectionUser;
  user_to: WorksectionUser;
  project: { id: number; name: string; page: string };
  date_added: string;
  date_closed?: string;
  tags?: Record<string, string>;
}
