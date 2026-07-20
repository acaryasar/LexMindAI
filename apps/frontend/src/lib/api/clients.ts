import api from '../api';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  taxNumber?: string;
  address?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  taxNumber?: string;
  address?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  taxNumber?: string;
  address?: string;
  notes?: string;
  tags?: string[];
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const clientsApi = {
  getAll: async (page: number = 1, limit: number = 50, search?: string): Promise<ClientsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await api.get(`/clients?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientDto): Promise<Client> => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: UpdateClientDto): Promise<Client> => {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};
