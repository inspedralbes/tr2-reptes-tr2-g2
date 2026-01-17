import getApi from "./api";

export interface Professor {
  id_professor: number;
  nom: string;
  contacte: string;
  id_centre?: number;
}

const professorService = {
  getAll: async (): Promise<Professor[]> => {
    const api = getApi();
    const response = await api.get<Professor[]>("/professors");
    return response.data;
  },
  create: async (data: Omit<Professor, 'id_professor'>): Promise<Professor> => {
    const api = getApi();
    const response = await api.post<Professor>("/professors", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Professor>): Promise<Professor> => {
    const api = getApi();
    const response = await api.put<Professor>(`/professors/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    const api = getApi();
    await api.delete(`/professors/${id}`);
  }
};

export default professorService;
