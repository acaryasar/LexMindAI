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
  getAll: async (startDate?: string, endDate?: string, type?: string): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);

    const response = await api.get(`/calendar/events?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get(`/calendar/events/${id}`);
    return response.data;
  },

  create: async (data: CreateCalendarEventDto): Promise<CalendarEvent> => {
    const response = await api.post('/calendar/events', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> => {
    const response = await api.patch(`/calendar/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/calendar/events/${id}`);
  },

  getUpcoming: async (days: number = 7): Promise<CalendarEvent[]> => {
    const response = await api.get(`/calendar/upcoming?days=${days}`);
    return response.data;
  },
};
