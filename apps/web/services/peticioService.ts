import getApi from "./api";

export interface Peticio {
  id_peticio: number;
  id_centre: number;
  id_taller: number;
  alumnes_aprox: number | null;
  comentaris: string | null;
  data_peticio: string;
  estat: string;
  modalitat?: string;
  prof1_nom?: string;
  prof1_contacte?: string;
  prof2_nom?: string;
  prof2_contacte?: string;
  taller?: {
    titol: string;
  };
  centre?: {
    nom: string;
  };
}

const peticioService = {
  /**
   * Obtiene las peticiones.
   */
  getAll: async (): Promise<Peticio[]> => {
    const api = getApi();
    try {
      const response = await api.get<Peticio[]>("/peticions");
      return response.data;
    } catch (error) {
      console.error("Error en peticioService.getAll:", error);
      throw error;
    }
  },

  /**
   * Crea una nueva petición.
   */
  create: async (data: { 
    id_taller: number; 
    alumnes_aprox?: number; 
    comentaris?: string;
    prof1_nom?: string;
    prof1_contacte?: string;
    prof2_nom?: string;
    prof2_contacte?: string;
    modalitat?: string;
  }): Promise<Peticio> => {
    const api = getApi();
    try {
      const response = await api.post<Peticio>("/peticions", data);
      return response.data;
    } catch (error: any) {
      console.error("Error en peticioService.create:", error);
      const errorMessage = error.response?.data?.error || "No se pudo crear la solicitud";
      throw new Error(errorMessage);
    }
  }
};

export default peticioService;
