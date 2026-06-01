import { api } from './client';

export interface Professional {
  id: string;
  name: string;
  bio: string | null;
  profession_type: string;
  specializations: string[];
  delivery_method: 'online' | 'in_person' | 'both';
  location: string | null;
  nhs_funded: boolean;
  languages: string[];
  accepting_clients: boolean;
  booking_url: string | null;
  is_saved: boolean;
}

export interface ListProfessionalsParams {
  specialization?: string;
  delivery_method?: string;
  location?: string;
  nhs_funded?: boolean;
  accepting_only?: boolean;
  limit?: number;
  offset?: number;
}

export const professionalsApi = {
  list: (params: ListProfessionalsParams = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, String(v));
    });
    const qs = q.toString();
    return api.get<{ professionals: Professional[]; total: number }>(
      `/professionals${qs ? `?${qs}` : ''}`
    );
  },

  get: (id: string) => api.get<Professional>(`/professionals/${id}`),

  save: (id: string) => api.post<{ message: string }>(`/professionals/${id}/save`, {}),

  unsave: (id: string) => api.delete<void>(`/professionals/${id}/save`),

  saved: () => api.get<{ professionals: Professional[] }>('/professionals/saved'),
};
