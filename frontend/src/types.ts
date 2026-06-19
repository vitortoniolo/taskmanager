// Modelos de dados espelhando a API REST (endpoints.md)

export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  users?: User[];
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  projectId: string;
  assigneeId?: string | null;
  assignee?: User | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
