import api from '../api';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  duration?: number;
  location?: string;
  notes?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventDto {
  title: string;
  date: string;
  time?: string;
  duration?: number;
  location?: string;
  notes?: string;
  type: string;
}

export interface UpdateCalendarEventDto {
  title?: string;
  date?: string;
  time?: string;
  duration?: number;
  location?: string;
  notes?: string;
  type?: string;
}

export interface CalendarEventsResponse {
  data: CalendarEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const calendarApi = {
  getAll: async (page: number = 1, limit: number = 50, search?: string): Promise<CalendarEventsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await api.get(`/calendar?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get(`/calendar/${id}`);
    return response.data;
  },

  create: async (data: CreateCalendarEventDto): Promise<CalendarEvent> => {
    const response = await api.post('/calendar', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> => {
    const response = await api.patch(`/calendar/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/calendar/${id}`);
  },
};
