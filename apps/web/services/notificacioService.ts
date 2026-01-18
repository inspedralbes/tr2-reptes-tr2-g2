import api from './api';

export interface Notificacio {
  id_notificacio: number;
  titol: string;
  missatge: string;
  llegida: boolean;
  data_creacio: string;
  tipus: 'PETICIO' | 'FASE' | 'SISTEMA';
  importancia: 'INFO' | 'WARNING' | 'URGENT';
}

const notificacioService = {
  getAll: async (): Promise<Notificacio[]> => {
    const response = await api().get('/notificacions');
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notificacio> => {
    const response = await api().patch(`/notificacions/${id}/read`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api().delete(`/notificacions/${id}`);
  }
};

export default notificacioService;
