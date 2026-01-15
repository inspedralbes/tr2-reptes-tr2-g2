'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@enginy/shared';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfessorLink, setShowProfessorLink] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowProfessorLink(false);
    setLoading(true);

    try {
      const response = await apiLogin(email, password);
      const { user, token } = response;

      if (user.rol.nom_rol === 'PROFESSOR') {
        setShowProfessorLink(true);
        // No redirigimos, mostramos el link de descarga
      } else {
        login(user, token);
        if (user.rol.nom_rol === 'ADMIN') {
          router.push('/admin');
        } else if (user.rol.nom_rol === 'COORDINADOR') {
          router.push('/centro');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: THEME.colors.background }}>
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold" style={{ color: THEME.colors.primary }}>Programa Enginy</h2>
          <p className="text-gray-500 mt-2">Inicia sessió per gestionar els tallers</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {showProfessorLink ? (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Accés via App Mòbil</h3>
            <p className="text-sm text-blue-700 mb-6">
              Com a professor, has d'utilitzar l'aplicació mòbil d'Enginy per gestionar les teves sessions.
            </p>
            <a 
              href="#" 
              className="inline-block w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              onClick={(e) => { e.preventDefault(); alert('Enllaç de descàrrega (Placeholder)'); }}
            >
              Descarregar App Enginy (Expo)
            </a>
            <button 
              onClick={() => setShowProfessorLink(false)}
              className="mt-4 text-xs text-blue-500 hover:underline"
            >
              Tornar al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Correu Electrònic</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="coordinador@centre.cat"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Contrasenya</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-bold transition duration-200 disabled:opacity-50 shadow-md"
              style={{ backgroundColor: THEME.colors.primary }}
            >
              {loading ? 'Accedint...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
