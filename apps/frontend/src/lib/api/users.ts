import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
}

export const usersApi = {
  async getUsers(): Promise<User[]> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getLawyers(): Promise<User[]> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.filter((user: User) => user.roles.includes('LAWYER'));
  },

  async getById(id: string): Promise<User> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_BASE_URL}/auth/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_BASE_URL}/auth/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    await axios.delete(`${API_BASE_URL}/auth/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async register(data: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  },

  async updateRoles(id: string, roles: string[]): Promise<User> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_BASE_URL}/auth/users/${id}/roles`, { roles }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
