import getApi from "./api";

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
    const api = getApi();
    try {
      // Backend returns an array directly: [...]
      const response = await api.get<any[]>("/api/tallers");

      // Adapt backend data to frontend Taller interface
      return response.data.map((t: any) => ({
        _id: t.id.toString(),
        titol: t.titol,
        sector: t.sector?.nom || "General", // Fallback if sector name is missing
        modalitat: t.modalitat,
        trimestre: "1r", // Default value as backend might not have it
        detalls_tecnics: {
          descripcio: t.descripcio_curta || t.descripcio || "",
          durada_hores: t.durada_h || 0,
          places_maximes: t.places_maximes || 0,
          ubicacio_defecte: "Ca n'Olivella", // Default
        },
        referents_assignats: [],
        dies_execucio: [],
      }));
    } catch (error) {
      console.error("Error en tallerService.getAll:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo taller en el backend.
   */
  create: async (tallerData: Omit<Taller, '_id'>): Promise<Taller> => {
    const api = getApi();
    try {
      // Adapt frontend data to backend expectations
      // Backend expects: { titol, descripcio, durada_h, places_maximes, modalitat, id_sector }
      const payload = {
        titol: tallerData.titol,
        descripcio: tallerData.detalls_tecnics?.descripcio,
        durada_h: tallerData.detalls_tecnics?.durada_hores,
        places_maximes: tallerData.detalls_tecnics?.places_maximes,
        modalitat: tallerData.modalitat,
        id_sector: 1, // Hardcoded for now as we don't have sector management
      };

      const response = await api.post("/api/tallers", payload);
      const t = response.data;

      // Return adapted created object
      return {
        _id: t.id.toString(),
        titol: t.titol,
        sector: "General",
        modalitat: t.modalitat,
        trimestre: "1r",
        detalls_tecnics: {
          descripcio: t.descripcio_curta || t.descripcio || "",
          durada_hores: t.durada_h || 0,
          places_maximes: t.places_maximes || 0,
          ubicacio_defecte: "Ca n'Olivella",
        },
        referents_assignats: [],
        dies_execucio: [],
      };
    } catch (error: any) {
      console.error("Error en tallerService.create:", error);
      const errorMessage = error.response?.data?.message || "No se pudo crear el taller";
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza un taller existente.
   */
  update: async (id: string, tallerData: Partial<Taller>): Promise<Taller> => {
    const api = getApi();
    try {
      const payload: any = {};
      if (tallerData.titol) payload.titol = tallerData.titol;
      if (tallerData.modalitat) payload.modalitat = tallerData.modalitat;
      if (tallerData.detalls_tecnics) {
        if (tallerData.detalls_tecnics.descripcio) payload.descripcio = tallerData.detalls_tecnics.descripcio;
        if (tallerData.detalls_tecnics.durada_hores) payload.durada_h = tallerData.detalls_tecnics.durada_hores;
        if (tallerData.detalls_tecnics.places_maximes) payload.places_maximes = tallerData.detalls_tecnics.places_maximes;
      }

      const response = await api.put(`/api/tallers/${id}`, payload);
      const t = response.data;

      // Return adapted object
      return {
        _id: t.id.toString(),
        titol: t.titol,
        sector: "General",
        modalitat: t.modalitat,
        trimestre: "1r",
        detalls_tecnics: {
          descripcio: t.descripcio_curta || t.descripcio || "",
          durada_hores: t.durada_h || 0,
          places_maximes: t.places_maximes || 0,
          ubicacio_defecte: "Ca n'Olivella",
        },
        referents_assignats: [],
        dies_execucio: [],
      };
    } catch (error: any) {
      console.error("Error en tallerService.update:", error);
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el taller";
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un taller existente.
   */
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    try {
      await api.delete(`/api/tallers/${id}`);
    } catch (error: any) {
      console.error("Error en tallerService.delete:", error);
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el taller";
      throw new Error(errorMessage);
    }
  },
};

export default tallerService;