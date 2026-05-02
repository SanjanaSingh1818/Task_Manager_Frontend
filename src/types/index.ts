export type UserRole = 'admin' | 'member';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AppUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  task_count?: number;
  completed_count?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string | null;
  project_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  project?: Project;
}

export interface DashboardStats {
  total: number;
  completed: number;
  overdue: number;
  in_progress: number;
}
