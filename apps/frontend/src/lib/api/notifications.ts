import api from '../api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  async getAll(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data;
  },

  async getUnread(): Promise<Notification[]> {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/mark-read/${id}`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
