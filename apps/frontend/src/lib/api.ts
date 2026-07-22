import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Reports API
export const reportsApi = {
  getHearingSchedule: (filter?: 'upcoming' | 'past' | 'all') =>
    api.get('/reports/hearing-schedule', { params: { filter } }),
  
  getAIAnalysis: () =>
    api.get('/reports/ai-analysis'),
  
  getCaseStatus: (filter?: 'active' | 'pending' | 'completed' | 'all') =>
    api.get('/reports/case-status', { params: { filter } }),
  
  getClient: () =>
    api.get('/reports/client'),
  
  getFinance: (filter?: 'income' | 'expense' | 'all') =>
    api.get('/reports/finance', { params: { filter } }),
  
  getTask: (filter?: 'pending' | 'in_progress' | 'completed' | 'all') =>
    api.get('/reports/task', { params: { filter } }),
  
  getActivity: (filter?: 'case' | 'document' | 'finance' | 'ai' | 'hearing' | 'task' | 'all') =>
    api.get('/reports/activity', { params: { filter } }),
  
  getPerformance: () =>
    api.get('/reports/performance'),
};

export default api;
