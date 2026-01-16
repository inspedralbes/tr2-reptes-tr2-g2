import axios, { AxiosInstance } from 'axios';

let apiInstance: AxiosInstance | null = null;

const getApi = (): AxiosInstance => {
  if (!apiInstance) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      throw new Error('La variable de entorno NEXT_PUBLIC_API_URL no está definida.');
    }
    apiInstance = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    apiInstance.interceptors.request.use(
      async (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }
  return apiInstance;
};

export default getApi;