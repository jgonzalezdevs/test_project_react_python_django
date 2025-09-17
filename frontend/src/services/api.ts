import axios from 'axios';

// Axios instance configured for Django REST backend
// - Attaches JWT access tokens to requests
// - Transparently refreshes access tokens on 401 when possible
// - Centralizes baseURL configuration

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface Tokens {
  access: string;
  refresh: string;
}

let tokens: Tokens | null = null;

export const setTokens = (next: Tokens | null) => {
  tokens = next;
  if (next) {
    localStorage.setItem('tokens', JSON.stringify(next));
  } else {
    localStorage.removeItem('tokens');
  }
};

export const loadTokens = (): Tokens | null => {
  const raw = localStorage.getItem('tokens');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Tokens;
  } catch {
    return null;
  }
};

// Initialize on load
if (!tokens) {
  tokens = loadTokens();
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (tokens?.access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// Attempt token refresh on 401 responses
let isRefreshing = false;
let pending: Array<(t: string | null) => void> = [];

const processPending = (newAccess: string | null) => {
  pending.forEach((cb) => cb(newAccess));
  pending = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && tokens?.refresh && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pending.push((newAccess) => {
            if (!newAccess) return reject(error);
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const result = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: tokens.refresh,
        });
        const newAccess = result.data?.access as string;
        if (newAccess) {
          setTokens({ access: newAccess, refresh: tokens.refresh });
          processPending(newAccess);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch (e) {
        setTokens(null);
        processPending(null);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API helpers
export const authApi = {
  login: (payload: { username: string; password: string }) =>
    api.post('/auth/login/', payload),
  register: (payload: {
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    password: string;
    password2: string;
  }) => api.post('/auth/register/', payload),
  me: () => api.get('/auth/me/'),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
};

export const projectsApi = {
  list: () => api.get('/projects/projects/'),
  create: (data: any) => api.post('/projects/projects/', data),
  update: (id: number, data: any) => api.put(`/projects/projects/${id}/`, data),
  remove: (id: number) => api.delete(`/projects/projects/${id}/`),
  memberships: (projectId: number) => api.get(`/projects/projects/${projectId}/memberships/`),
  listMemberships: () => api.get('/projects/memberships/'),
  createMembership: (data: any) => api.post('/projects/memberships/', data),
  removeMembership: (id: number) => api.delete(`/projects/memberships/${id}/`),
};

export const tasksApi = {
  list: () => api.get('/tasks/tasks/'),
  create: (data: any) => api.post('/tasks/tasks/', data),
  update: (id: number, data: any) => api.put(`/tasks/tasks/${id}/`, data),
  remove: (id: number) => api.delete(`/tasks/tasks/${id}/`),
  comments: (taskId: number) => api.get(`/tasks/tasks/${taskId}/comments/`),
  addComment: (taskId: number, content: string) => api.post(`/tasks/tasks/${taskId}/comments/`, { content }),
};

export const notificationsApi = {
  list: () => api.get('/notifications/notifications/'),
  markRead: (id: number) => api.post(`/notifications/notifications/${id}/mark_read/`),
  markUnread: (id: number) => api.post(`/notifications/notifications/${id}/mark_unread/`),
};
