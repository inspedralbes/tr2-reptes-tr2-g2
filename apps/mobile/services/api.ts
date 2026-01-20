import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getBaseURL = () => {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  async (config) => {
    let token = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('token');
    } else {
      token = await SecureStore.getItemAsync('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (data: any) => api.post('/auth/login', data);

export const getMyAssignments = () => api.get('/professors/me/assignments');
export const getChecklist = (id: string) => api.get(`/assignacions/${id}/checklist`);
export const getAttendance = (idAssignacio: string) => api.get(`/assistencia/assignacio/${idAssignacio}`);
export const postAttendance = (data: any) => api.post('/assistencia', data);
export const postIncidencia = (data: any) => api.post('/assignacions/incidencies', data);
export const getFases = () => api.get('/fases');

export default api;