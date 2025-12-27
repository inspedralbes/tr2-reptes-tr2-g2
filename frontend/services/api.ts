import axios from 'axios';

// Accedemos a la variable de entorno
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTORES (La clave de la escalabilidad)
// Esto se ejecuta antes de cada petición. Ideal para inyectar Tokens.
api.interceptors.request.use(
  async (config) => {
    // Ejemplo: const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`Petición saliendo hacia: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;