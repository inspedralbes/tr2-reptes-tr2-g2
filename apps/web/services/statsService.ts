import getApi from "./api";

export interface StatusStat {
  estat: string;
  total: number;
  last_update: string;
}

export interface PopularStat {
  _id: number;
  total_solicitudes: number;
  alumnes_totals: number;
}

export interface ActivityLog {
  _id: string;
  tipus_accio: string;
  centre_id: number;
  taller_id: number;
  timestamp: string;
  detalls: any;
}

const statsService = {
  getByStatus: async (): Promise<StatusStat[]> => {
    const api = getApi();
    const response = await api.get<StatusStat[]>("/stats/status");
    return response.data;
  },
  getPopular: async (): Promise<PopularStat[]> => {
    const api = getApi();
    const response = await api.get<PopularStat[]>("/stats/popular");
    return response.data;
  },
  getActivity: async (): Promise<ActivityLog[]> => {
    const api = getApi();
    const response = await api.get<ActivityLog[]>("/stats/activity");
    return response.data;
  },
  search: async (term: string, types?: string): Promise<any[]> => {
    const api = getApi();
    const response = await api.get<any[]>("/stats/search", { params: { term, types } });
    return response.data;
  },
  queryByStep: async (): Promise<any[]> => {
    const api = getApi();
    const response = await api.get<any[]>("/stats/query-step");
    return response.data;
  },
  addChecklistStep: async (id: number, pas_nom: string): Promise<{ success: boolean; modified: number }> => {
    const api = getApi();
    const response = await api.patch<{ success: boolean; modified: number }>(`/stats/checklist/${id}/step`, { pas_nom });
    return response.data;
  },
  cleanupLogs: async (): Promise<{ success: boolean; deletedCount: number; message: string }> => {
    const api = getApi();
    const response = await api.delete<{ success: boolean; deletedCount: number; message: string }>("/stats/logs/cleanup");
    return response.data;
  }
};

export default statsService;
