import { api } from './client';
import type { LoginResponse, Project, Task, TaskStatus, User } from '../types';

// auth
export const register = (name: string, email: string, password: string) =>
  api<User>('/auth/register', { method: 'POST', body: { name, email, password }, auth: false });

export const login = (email: string, password: string) =>
  api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false });

// usuários
export const listUsers = () => api<User[]>('/users');

export const updateUser = (id: string, input: { name?: string; password?: string }) =>
  api<User>(`/users/${id}`, { method: 'PATCH', body: input });

export const deleteUser = (id: string) => api<void>(`/users/${id}`, { method: 'DELETE' });

// projetos
export const listProjects = () => api<Project[]>('/projects');

export const getProject = (id: string) => api<Project>(`/projects/${id}`);

export const createProject = (name: string, description?: string) =>
  api<Project>('/projects', { method: 'POST', body: { name, description } });

export const updateProject = (id: string, input: { name?: string; description?: string }) =>
  api<Project>(`/projects/${id}`, { method: 'PATCH', body: input });

export const deleteProject = (id: string) => api<void>(`/projects/${id}`, { method: 'DELETE' });

export const addProjectMember = (projectId: string, userId: string) =>
  api<Project>(`/projects/${projectId}/users/${userId}`, { method: 'POST' });

export const removeProjectMember = (projectId: string, userId: string) =>
  api<void>(`/projects/${projectId}/users/${userId}`, { method: 'DELETE' });

// tarefas
interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  // null remove o responsável da tarefa
  assigneeId?: string | null;
}

export const listProjectTasks = (projectId: string) =>
  api<Task[]>(`/tasks?projectId=${projectId}`);

export const listMyTasks = () => api<Task[]>('/tasks');

export const createTask = (input: CreateTaskInput) =>
  api<Task>('/tasks', { method: 'POST', body: input });

export const updateTask = (id: string, input: UpdateTaskInput) =>
  api<Task>(`/tasks/${id}`, { method: 'PATCH', body: input });

export const deleteTask = (id: string) => api<void>(`/tasks/${id}`, { method: 'DELETE' });
