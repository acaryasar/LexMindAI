import api from '../api';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  clientId: string;
  amount: number;
  status: string;
  dueDate: string;
}

export interface UpdateInvoiceDto {
  invoiceNumber?: string;
  amount?: number;
  status?: string;
  dueDate?: string;
  paidDate?: string;
}

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  method: string;
  date: string;
  notes?: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const invoicesApi = {
  getAll: async (page: number = 1, limit: number = 50, search?: string): Promise<InvoicesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  getByClient: async (clientId: string): Promise<Invoice[]> => {
    const response = await api.get(`/invoices?clientId=${clientId}`);
    return response.data.data;
  },

  create: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  update: async (id: string, data: UpdateInvoiceDto): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  getPayments: async (invoiceId: string): Promise<Payment[]> => {
    const response = await api.get(`/invoices/${invoiceId}/payments`);
    return response.data;
  },

  createPayment: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await api.post('/payments', data);
    return response.data;
  },
};
