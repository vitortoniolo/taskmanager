import { api } from './client';
import type { LoginResponse, Project, Task, User } from '../types';

// --- Auth ---
export const register = (name: string, email: string, password: string) =>
  api<User>('/auth/register', { method: 'POST', body: { name, email, password }, auth: false });

export const login = (email: string, password: string) =>
  api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false });

// --- Projects ---
export const listProjects = () => api<Project[]>('/projects');

export const getProject = (id: string) => api<Project>(`/projects/${id}`);

export const createProject = (name: string, description?: string) =>
  api<Project>('/projects', { method: 'POST', body: { name, description } });

// --- Tasks ---
export const listProjectTasks = (projectId: string) =>
  api<Task[]>(`/tasks?projectId=${projectId}`);

export const listMyTasks = () => api<Task[]>('/tasks');
