import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // <--- IMPORTANTE: Importar Platform
import { login as apiLogin } from '../services/authService';

interface AuthState {
  token: string | null;
  authenticated: boolean;
  user: any | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await getToken(); // Usamos la función segura
        
        if (storedToken) {
          setAuthState({
            token: storedToken,
            authenticated: true,
            user: null, 
          });
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
          user: null, 
        });
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
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
    <AuthContext.Provider value={{ authState, login, logout }}>
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