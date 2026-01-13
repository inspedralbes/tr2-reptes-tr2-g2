import api from './api';

export const login = async (email: string, password:string) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data; // Should contain the token
  } catch (error: any) {
    console.error('Error during login API call:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (nombre: string, email: string, password:string) => {
  try {
    const response = await api.post('/api/auth/register', {
      nombre,
      email,
      password,
    });
    return response.data; // Should contain the token
  } catch (error: any) {
    console.error('Error during register API call:', error.response?.data || error.message);
    throw error;
  }
};
