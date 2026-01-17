'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@enginy/shared';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Programa Enginy' }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.rol.nom_rol === 'ADMIN';
  const isCoordinator = user.rol.nom_rol === 'COORDINADOR';

  const getInicioPath = () => {
    if (isAdmin) return '/admin';
    if (isCoordinator) return '/centro';
    return '/';
  };

  const navLinks = [
    { label: 'Inicio', path: getInicioPath(), show: true },
    { label: 'Talleres', path: '/admin/talleres', show: isAdmin },
    { label: 'Centros', path: '/admin/centros', show: isAdmin },
    { label: 'Calendari', path: '/calendar', show: true },
    { label: 'Fases', path: '/admin/fases', show: isAdmin },
    { label: 'Perfil', path: '/perfil', show: true },
  ];

  return (
    <nav className="shadow-sm border-b sticky top-0 z-50 transition-all" style={{ backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Logo placeholder or icon */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-black text-xs">E</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            </div>

            <nav className="ml-8 hidden md:flex items-center space-x-4">
              <Link 
                href={isAdmin ? '/admin' : '/centro'} 
                className={`text-white/70 hover:text-white font-bold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10 ${pathname === '/admin' || pathname === '/centro' ? 'text-white bg-white/10' : ''}`}
              >
                Inicio
              </Link>
              <Link 
                href="/calendar" 
                className={`text-white/70 hover:text-white font-bold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10 ${pathname === '/calendar' ? 'text-white bg-white/10' : ''}`}
              >
                Calendari
              </Link>
              <Link 
                href="/perfil" 
                className={`text-white/70 hover:text-white font-bold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10 ${pathname === '/perfil' ? 'text-white bg-white/10' : ''}`}
              >
                Perfil
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-white font-semibold text-sm leading-none mb-1">{user.nom_complet}</span>
              <span className="text-white opacity-70 text-[10px] uppercase font-bold tracking-widest leading-none">
                {user.rol.nom_rol} {user.centre?.nom ? `• ${user.centre.nom}` : ''}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/20 backdrop-blur-sm active:scale-95"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
