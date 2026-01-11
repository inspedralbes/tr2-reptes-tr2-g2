import api from "./api"; // Asegúrate de que esta ruta sea correcta

export interface Taller {
  _id: string;
  titol: string;
  sector: string;
  modalitat: string;
  trimestre: string;
  detalls_tecnics?: {
    descripcio: string;
    durada_hores: number;
    places_maximes: number;
    ubicacio_defecte: string;
  };
  referents_assignats?: string[];
  dies_execucio: string[];
}

const tallerService = {
  /**
   * Obtiene todos los talleres desde el backend.
   */
  getAll: async (): Promise<Taller[]> => {
    try {
      const response = await api.get<{ talleres: Taller[] }>("/api/talleres");
      
      console.log("📡 API Response:", JSON.stringify(response.data, null, 2));

      // El backend siempre devuelve un objeto `{ talleres: [...] }`
      return response.data.talleres;
    } catch (error) {
      console.error("Error en tallerService.getAll:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo taller en el backend.
   */
  create: async (tallerData: Omit<Taller, '_id'>): Promise<Taller> => {
    try {
      const response = await api.post<Taller>("/api/talleres", tallerData);
      return response.data;
    } catch (error: any) {
      console.error("Error en tallerService.create:", error);
      const errorMessage = error.response?.data?.message || "No se pudo crear el taller";
      throw new Error(errorMessage);
    }
  },
};

export default tallerService;