
export interface User {
  id: number;
  email: string;
  nom_complet: string;
  id_centre?: number;
  centre?: {
    id_centre: number;
    nom: string;
  };
  rol: {
    nom_rol: 'ADMIN' | 'COORDINADOR' | 'PROFESSOR';
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al iniciar sesión');
  }

  const data = await res.json();
  
  // Store token in localStorage for simplicity in this MVP
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user data", e);
        return null;
      }
    }
  }
  return null;
}
