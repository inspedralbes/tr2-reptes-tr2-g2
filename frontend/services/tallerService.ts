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
};

export default tallerService;