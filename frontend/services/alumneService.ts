import api from "./api";

export interface Alumne {
  _id: string;
  nombre: string;
  apellido: string;
  centro: string;
  email: string;
  telefono: string;
  imagen: string;
  estado: string;
}

const alumneService = {
  getAll: async (): Promise<Alumne[]> => {
    try {
      const response = await api.get<{ alumnes: Alumne[] }>("/api/alumnes");
      return response.data.alumnes;
    } catch (error) {
      console.error("Error en alumneService.getAll:", error);
      throw error;
    }
  },
};

export default alumneService;
