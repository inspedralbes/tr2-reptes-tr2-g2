import getApi from "./api";

export interface Assignacio {
  id_assignacio: number;
  id_peticio: number | null;
  id_centre: number;
  id_taller: number;
  data_inici: string | null;
  data_fi: string | null;
  estat: string;
  taller?: { titol: string };
  centre?: { nom: string };
  checklist?: any[];
}

const assignacioService = {
  /**
   * Obtiene las asignaciones de un centro.
   */
  getByCentre: async (idCentre: number): Promise<Assignacio[]> => {
    const api = getApi();
    try {
      const response = await api.get<Assignacio[]>(`/assignacions/centre/${idCentre}`);
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.getByCentre:", error);
      throw error;
    }
  },

  /**
   * Crea una asignación a partir de una petición.
   */
  createFromPeticio: async (idPeticio: number): Promise<Assignacio> => {
    const api = getApi();
    try {
      const response = await api.post<Assignacio>("/assignacions", { idPeticio });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.createFromPeticio:", error);
      throw error;
    }
  },

  /**
   * Actualiza un ítem del checklist.
   */
  updateChecklistItem: async (idItem: number, completat: boolean, url_evidencia?: string): Promise<any> => {
    const api = getApi();
    try {
      const response = await api.patch(`/assignacions/checklist/${idItem}`, { completat, url_evidencia });
      return response.data;
    } catch (error) {
      console.error("Error en assignacioService.updateChecklistItem:", error);
      throw error;
    }
  }
};

export default assignacioService;
