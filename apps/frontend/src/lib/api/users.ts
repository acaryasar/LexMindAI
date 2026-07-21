import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
};
