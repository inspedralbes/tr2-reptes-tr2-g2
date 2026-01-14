import api from './api';

export interface User {
  id: string;
  email: string;
  nombre: string;
  centro_id: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password:string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error during login API call:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (nombre: string, email: string, password:string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      nombre,
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error during register API call:', error.response?.data || error.message);
    throw error;
  }
};
