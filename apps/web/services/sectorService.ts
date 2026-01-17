import getApi from "./api";

export interface Sector {
  id_sector: number;
  nom: string;
}

const sectorService = {
  /**
   * Obtiene todos los sectores desde el backend.
   */
  getAll: async (): Promise<Sector[]> => {
    const api = getApi();
    try {
      const response = await api.get<Sector[]>("/sectors");
      return response.data;
    } catch (error) {
      console.error("Error en sectorService.getAll:", error);
      throw error;
    }
  },
};

export default sectorService;
