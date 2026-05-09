import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', new URLSearchParams(credentials)),
  signup: (userData) => api.post('/auth/signup', userData),
  me: () => api.get('/auth/me'),
};

export const projectApi = {
  getProjects: () => api.get('/projects/'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects/', data),
  addMember: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),
};

export const taskApi = {
  getProjectTasks: (projectId) => api.get(`/tasks/project/${projectId}`),
  createTask: (data) => api.post('/tasks/', data),
  updateTask: (taskId, data) => api.patch(`/tasks/${taskId}`, data),
  getMyTasks: () => api.get('/tasks/my-tasks'),
};

export const dashboardApi = {
  getStats: (projectId) => api.get(`/dashboard/stats/${projectId}`),
};

export default api;
