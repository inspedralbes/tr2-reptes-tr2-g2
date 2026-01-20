import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';

const getBaseURL = () => {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseURL().endsWith('/') ? getBaseURL() : `${getBaseURL()}/`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

console.log('📡 [API] Base URL:', api.defaults.baseURL);

api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        // En iOS/Android, intentamos recuperar el token del almacenamiento seguro.
        // Añadimos un try/catch específico aquí porque SecureStore puede fallar
        // si el llavero (keychain) está bloqueado o en estados de transición.
        token = await SecureStore.getItemAsync('token');
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('⚠️ [API] No se pudo leer el token del almacenamiento seguro:', error);
      // No lanzamos el error para permitir que la petición se envíe (fallará con 401 si es necesaria la auth)
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('📡 [API] Sesión expirada o inválida (401). Redirigiendo a login...');
      await logout();
      // Pequeño delay para asegurar que el estado se limpie antes de redirigir
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    }
    return Promise.reject(error);
  }
);

export const logout = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } else {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

export const login = (data: any) => api.post('auth/login', data);

export const getMyAssignments = () => api.get('professors/me/assignments');
export const getChecklist = (id: string) => api.get(`assignacions/${id}/checklist`);
export const getAttendance = (idAssignacio: string) => api.get(`assistencia/assignacio/${idAssignacio}`);
export const postAttendance = (data: any) => api.post('assistencia', data);
export const postIncidencia = (data: any) => api.post('assignacions/incidencies', data);
export const getFases = () => api.get('fases');

export default api;