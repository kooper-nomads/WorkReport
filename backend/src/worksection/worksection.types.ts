export interface WorksectionResponse<T> {
  status: 'ok' | 'error';
  data: T;
}

export interface WorksectionUser {
  id: number;
  email: string;
  name: string;
  [key: string]: unknown;
}

export interface WorksectionEventObject {
  type: string;
  id: number;
  page: string;
}

export interface WorksectionEvent {
  action: string;
  object: WorksectionEventObject;
  date_added: string;
  user_from: WorksectionUser;
  user_to?: WorksectionUser;
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
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
  tags: Record<string, string>;
}
