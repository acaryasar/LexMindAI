import api from '../api';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  courtName?: string;
  courtCity?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseDto {
  caseNumber: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  courtName?: string;
  courtCity?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateCaseDto {
  caseNumber?: string;
  title?: string;
  description?: string;
  status?: string;
  type?: string;
  courtName?: string;
  courtCity?: string;
  startDate?: string;
  endDate?: string;
}

export interface CasesResponse {
  data: Case[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CaseLawyer {
  id: string;
  caseId: string;
  userId: string;
  role: string;
  isPrimary: boolean;
  assignedAt: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
  };
}

export enum CaseLawyerRole {
  LEAD_LAWYER = 'LEAD_LAWYER',
  ASSOCIATE = 'ASSOCIATE',
  OBSERVER = 'OBSERVER',
}

export interface AssignCaseLawyerDto {
  userId: string;
  role: CaseLawyerRole;
  isPrimary?: boolean;
  reason?: string;
}

export const casesApi = {
  getAll: async (page: number = 1, limit: number = 50, search?: string): Promise<CasesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await api.get(`/cases?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Case> => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  getByClient: async (clientId: string): Promise<Case[]> => {
    const response = await api.get(`/cases?clientId=${clientId}`);
    return response.data.data;
  },

  create: async (data: CreateCaseDto): Promise<Case> => {
    const response = await api.post('/cases', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCaseDto): Promise<Case> => {
    const response = await api.patch(`/cases/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cases/${id}`);
  },

  assignLawyer: async (caseId: string, data: AssignCaseLawyerDto): Promise<CaseLawyer> => {
    const response = await api.post(`/cases/${caseId}/lawyers`, data);
    return response.data;
  },

  removeLawyer: async (caseId: string, lawyerId: string, reason?: string): Promise<void> => {
    await api.delete(`/cases/${caseId}/lawyers/${lawyerId}`, { data: { reason } });
  },

  getLawyers: async (caseId: string): Promise<CaseLawyer[]> => {
    const response = await api.get(`/cases/${caseId}/lawyers`);
    return response.data;
  },
};
