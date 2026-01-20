'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfessorLink, setShowProfessorLink] = useState(false);
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.rol.nom_rol === 'ADMIN') {
        router.push('/admin');
      } else if (user.rol.nom_rol === 'COORDINADOR') {
        router.push('/centro');
      }
    }
  }, [user, authLoading, router]);

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
      } else {
        login(user, token);
        if (user.rol.nom_rol === 'ADMIN') {
          router.push('/admin');
        } else if (user.rol.nom_rol === 'COORDINADOR') {
          router.push('/centro');
        }
      }
    } catch (err: any) {
      // Improved error messaging based on backend response or common errors
      if (err.message.includes('401') || err.message.toLowerCase().includes('inválidas')) {
        setError('Correu o contrasenya incorrectes. Torna-ho a provar.');
      } else if (err.message.includes('fetch') || err.message.includes('network')) {
        setError('Error de conexió. Comprova que el servidor estigui actiu.');
      } else {
        setError(err.message || 'S\'ha produït un error inesperat.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: THEME.colors.background }}>
      <div className="w-full max-w-md bg-white p-8 border border-gray-300">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
             <span className="text-consorci-darkBlue font-bold text-2xl">E</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: THEME.colors.primary, fontFamily: THEME.fonts.primary }}>Iter</h2>
          <p className="text-gray-400 font-medium mt-2">Gestió de tallers i centres</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-8 text-sm font-bold flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {showProfessorLink ? (
          <div className="bg-blue-50 border border-blue-200 p-8 text-center animate-in slide-in-from-bottom duration-500">
            <h3 className="text-xl font-bold text-consorci-darkBlue mb-2">Accés via App Mòbil</h3>
            <p className="text-sm text-gray-600 font-medium mb-8 leading-relaxed">
              Com a professor, has d'utilitzar l'aplicació mòbil d'Iter per gestionar les teves sessions d'aprenentatge.
            </p>
            <a 
              href="#" 
              className="group relative flex items-center justify-center w-full py-4 bg-consorci-darkBlue text-white font-bold transition-colors hover:bg-consorci-lightBlue"
              onClick={(e) => { e.preventDefault(); alert('Enllaç de descàrrega próximament (Expo)'); }}
            >
              <span className="mr-2">Descarregar App Iter</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <button 
              onClick={() => setShowProfessorLink(false)}
              className="mt-6 text-xs font-bold text-consorci-lightBlue hover:text-consorci-darkBlue tracking-widest uppercase transition-colors"
            >
              ← Tornar al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Correu Electrònic</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-consorci-darkBlue transition-all font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                  placeholder="coordinador@centre.cat"
                  required
                />
                <div className="absolute left-0 -translate-x-full pr-4 top-1/2 -translate-y-1/2 hidden lg:block">
                   {/* Decorative icon or similar if needed */}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Contrasenya</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-consorci-darkBlue transition-all font-bold text-gray-900 placeholder:text-gray-300 pr-12 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26a4 4 0 015.493 5.493l-5.493-5.493z" clipRule="evenodd" />
                      <path d="M12.454 15.697A9.75 9.75 0 0110 16c-4.478 0-8.268-2.943-9.542-7a10.018 10.018 0 012.182-3.159L5.43 8.632A4 4 0 0010 13.5l2.454 2.197z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-bold transition-all duration-200 disabled:opacity-50"
              style={{ backgroundColor: THEME.colors.primary }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Accedint...</span>
                </div>
              ) : 'Entrar al Programa'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
