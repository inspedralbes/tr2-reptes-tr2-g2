import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // <--- IMPORTANTE: Importar Platform
import { login as apiLogin, register as apiRegister } from '../services/authService';

interface AuthState {
  token: string | null;
  authenticated: boolean;
  user: any | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nombre: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  // Función helper para leer el token según la plataforma
  const getToken = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('token');
    }
    return await SecureStore.getItemAsync('token');
  };

  // Función helper para guardar el token
  const saveToken = async (token: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
  };

  // Función helper para borrar el token
  const removeToken = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
    } else {
      await SecureStore.deleteItemAsync('token');
    }
  };

  const decodeToken = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await getToken(); // Usamos la función segura
        
        if (storedToken) {
          const decoded = decodeToken(storedToken);
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded && decoded.exp && decoded.exp < currentTime) {
            await removeToken();
            setAuthState({
              token: null,
              authenticated: false,
              user: null,
            });
          } else {
            setAuthState({
              token: storedToken,
              authenticated: true,
              user: decoded?.profesor || null, 
            });
          }
        }
      } catch (error) {
        console.log("Error cargando token:", error);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response.token) {
        await saveToken(response.token); // Usamos la función segura
        
        setAuthState({
          token: response.token,
          authenticated: true,
          user: response.user, 
        });
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (nombre: string, email: string, password: string) => {
    try {
      const response = await apiRegister(nombre, email, password);
      if (response.token) {
        await saveToken(response.token); 
        
        setAuthState({
          token: response.token,
          authenticated: true,
          user: response.user, 
        });
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await removeToken(); // Usamos la función segura
    setAuthState({
      token: null,
      authenticated: false,
      user: null,
    });
  };

  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};