import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),

  getCurrentUser: () =>
    api.get('/api/v1/auth/me'),
};

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/v1/users', { params }),

  getById: (id: number) =>
    api.get(`/api/v1/users/${id}`),

  update: (id: number, data: any) =>
    api.put(`/api/v1/users/${id}`, data),

  block: (id: number) =>
    api.post(`/api/v1/users/${id}/block`),

  unblock: (id: number) =>
    api.post(`/api/v1/users/${id}/unblock`),
};

export const partnersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/v1/partner', { params }),

  getById: (id: number) =>
    api.get(`/api/v1/partner/${id}`),

  update: (id: number, data: any) =>
    api.put(`/api/v1/partner/${id}`, data),

  verify: (id: number) =>
    api.post(`/api/v1/partner/${id}/verify`),
};

export const transactionsApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; status?: string }) =>
    api.get('/api/v1/transactions', { params }),

  getById: (id: number) =>
    api.get(`/api/v1/transactions/${id}`),
};

export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/api/v1/order', { params }),

  getById: (id: number) =>
    api.get(`/api/v1/order/${id}`),
};

export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/api/v1/notifications', { params }),

  send: (data: any) =>
    api.post('/api/v1/notifications/send', data),

  sendBulk: (data: any) =>
    api.post('/api/v1/notifications/bulk', data),
};

export const achievementsApi = {
  getAll: () =>
    api.get('/api/v1/achievements'),

  create: (data: any) =>
    api.post('/api/v1/achievements', data),

  update: (id: number, data: any) =>
    api.put(`/api/v1/achievements/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/v1/achievements/${id}`),
};

export const promotionsApi = {
  getAll: () =>
    api.get('/api/v1/promotions'),

  create: (data: any) =>
    api.post('/api/v1/promotions', data),

  update: (id: number, data: any) =>
    api.put(`/api/v1/promotions/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/v1/promotions/${id}`),
};

export const analyticsApi = {
  getDashboardStats: () =>
    api.get('/api/v1/analytics/dashboard'),

  getUsersGrowth: (period: string) =>
    api.get('/api/v1/analytics/users/growth', { params: { period } }),

  getRevenue: (period: string) =>
    api.get('/api/v1/analytics/revenue', { params: { period } }),

  getTopPartners: (limit: number = 10) =>
    api.get('/api/v1/analytics/partners/top', { params: { limit } }),
};
