import api from '../api';

export interface Hearing {
  id: string;
  caseId: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHearingDto {
  caseId: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
}

export interface UpdateHearingDto {
  date?: string;
  time?: string;
  location?: string;
  notes?: string;
}

export interface HearingsResponse {
  data: Hearing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const hearingsApi = {
  getAll: async (page: number = 1, limit: number = 50, search?: string): Promise<HearingsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await api.get(`/hearings?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Hearing> => {
    const response = await api.get(`/hearings/${id}`);
    return response.data;
  },

  getByCase: async (caseId: string): Promise<Hearing[]> => {
    const response = await api.get(`/hearings?caseId=${caseId}`);
    return response.data.data;
  },

  create: async (data: CreateHearingDto): Promise<Hearing> => {
    const response = await api.post('/hearings', data);
    return response.data;
  },

  update: async (id: string, data: UpdateHearingDto): Promise<Hearing> => {
    const response = await api.patch(`/hearings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/hearings/${id}`);
  },
};
