const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token: string) {
  console.log('[auth] storing JWT token:', Boolean(token));
  localStorage.setItem('token', token);
}

function clearToken() {
  console.log('[auth] clearing JWT token');
  localStorage.removeItem('token');
}

async function readJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeUser(user: any) {
  if (!user) return null;

  const id = user.id || user._id;
  const name = user.name || user.full_name || '';

  return {
    ...user,
    _id: user._id || id,
    id,
    name,
    email: user.email || '',
    role: user.role || 'member',
    full_name: user.full_name || name,
    created_at: user.created_at || user.createdAt || new Date().toISOString(),
  };
}

function normalizeProfile(user: any) {
  const normalized = normalizeUser(user);
  if (!normalized) return null;

  return {
    id: normalized.id,
    email: normalized.email,
    full_name: normalized.name,
    role: normalized.role,
    created_at: normalized.created_at,
  };
}

function normalizeProject(project: any) {
  if (!project) return project;

  const creator = normalizeProfile(project.creator || project.createdBy);

  return {
    ...project,
    id: project.id || project._id,
    name: project.name || project.title || '',
    created_by: project.created_by || project.createdBy?._id || project.createdBy || null,
    created_at: project.created_at || project.createdAt || new Date().toISOString(),
    updated_at: project.updated_at || project.updatedAt || project.createdAt || new Date().toISOString(),
    creator: creator || undefined,
  };
}

function normalizeTask(task: any) {
  if (!task) return task;

  const assignee = normalizeProfile(task.assignee || task.assignedTo);
  const creator = normalizeProfile(task.creator || task.createdBy);
  const project = normalizeProject(task.project || task.projectId);

  return {
    ...task,
    id: task.id || task._id,
    due_date: task.due_date || (task.dueDate ? String(task.dueDate).split('T')[0] : null),
    project_id: task.project_id || task.projectId?._id || task.projectId || null,
    assigned_to: task.assigned_to || task.assignedTo?._id || task.assignedTo || null,
    created_by: task.created_by || task.createdBy?._id || task.createdBy || null,
    created_at: task.created_at || task.createdAt || new Date().toISOString(),
    updated_at: task.updated_at || task.updatedAt || task.createdAt || new Date().toISOString(),
    assignee: assignee || undefined,
    creator: creator || undefined,
    project: project || undefined,
  };
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  console.log('[api] request:', endpoint, 'token exists:', Boolean(token));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error('[api] network error:', endpoint, err);
    throw new Error('Unable to connect to the server. Please try again.');
  }

  const data = await readJsonSafely(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }
    const message =
      typeof data === 'object' && data !== null
        ? data.error || data.message
        : data;

    console.error('[api] error:', endpoint, response.status, message);
    throw new Error(message || `HTTP ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    signup: (email: string, password: string, name: string, role: 'admin' | 'member') =>
      request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role }),
      }),
    login: (email: string, password: string) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getMe: () => request('/api/auth/me'),
  },
  users: {
    list: async () => {
      const users = await request('/api/users');
      console.log('[api] users response:', users);
      return Array.isArray(users) ? users.map(normalizeUser) : [];
    },
  },
  projects: {
    list: async () => {
      const projects = await request('/api/projects');
      return Array.isArray(projects) ? projects.map(normalizeProject) : [];
    },
    create: (title: string, description?: string) =>
      request('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      }).then(normalizeProject),
    get: async (id: string) => {
      const project = await request(`/api/projects/${id}`);
      return {
        ...normalizeProject(project),
        tasks: Array.isArray(project?.tasks) ? project.tasks.map(normalizeTask) : [],
      };
    },
    delete: (id: string) =>
      request(`/api/projects/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    list: async () => {
      const tasks = await request('/api/tasks');
      return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
    },
    create: (title: string, description: string, projectId: string, assignedTo?: string, dueDate?: string) =>
      request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description, projectId, assignedTo, dueDate }),
      }).then(normalizeTask),
    update: (id: string, updates: any) =>
      request(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }).then(normalizeTask),
    delete: (id: string) =>
      request(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
  getToken,
  setToken,
  clearToken,
};
