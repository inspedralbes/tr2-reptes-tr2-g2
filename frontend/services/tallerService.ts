import api from "./api";

export interface Taller {
  _id: string;
  titol: string;
  sector: string;
  modalitat: string;
  trimestre: string;
  detalls_tecnics: {
    descripcio: string;
    durada_hores: number;
    places_maximes: number;
    ubicacio_defecte: string;
  };
  referents_assignats: string[];
  dies_execucio: string[];
}

// 2. Objeto de servicio con métodos para interactuar con la API
const tallerService = {
  /**
   * Obtiene todos los talleres desde el backend.
   * @returns Una promesa que se resuelve con un array de Talleres.
   */
  getAll: async (): Promise<Taller[]> => {
    try {
      const response = await api.get<Taller[]>("/api/talleres");
      console.log("Talleres recibidos:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener los talleres:", error);
      throw error;
    }
  },

  // --- Aquí podrías añadir más métodos en el futuro ---
  // getById: async (id: string): Promise<Taller> => { ... },
  // create: async (newTaller: Omit<Taller, '_id'>): Promise<Taller> => { ... },
  // update: async (id: string, taller: Partial<Taller>): Promise<Taller> => { ... },
  // delete: async (id: string): Promise<void> => { ... },
};

export default tallerService;
