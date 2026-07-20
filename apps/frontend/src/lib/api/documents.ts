import api from '../api';

export interface Document {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  hash?: string;
  bucket: string;
  category?: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  hash?: string;
  bucket: string;
  category?: string;
  categoryId?: string;
}

export interface UpdateDocumentDto {
  name?: string;
  category?: string;
  categoryId?: string;
}

export interface DocumentsResponse {
  data: Document[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const documentsApi = {
  getAll: async (page: number = 1, limit: number = 50, search?: string): Promise<DocumentsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await api.get(`/documents?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  getByClient: async (clientId: string): Promise<Document[]> => {
    const response = await api.get(`/documents?clientId=${clientId}`);
    return response.data.data;
  },

  upload: async (file: File, onProgress?: (progress: number) => void): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  update: async (id: string, data: UpdateDocumentDto): Promise<Document> => {
    const response = await api.patch(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};
