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
