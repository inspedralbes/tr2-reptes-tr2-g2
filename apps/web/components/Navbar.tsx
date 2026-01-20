'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import notificacioService, { Notificacio } from '@/services/notificacioService';
import { useEffect, useState } from 'react';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Iter' }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const list = await notificacioService.getAll();
          setUnreadCount(list.filter(n => !n.llegida).length);
        } catch (error) {
          console.error("Error fetching notifications for navbar", error);
        }
      };
      fetchUnread();
      
      // Refresh every 2 minutes
      const interval = setInterval(fetchUnread, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
    { label: 'Avisos', path: '/centro/avisos', show: isCoordinator || isAdmin, isAvisos: true },
    { label: 'Talleres', path: '/admin/talleres', show: isAdmin },
    { label: 'Centros', path: '/admin/centros', show: isAdmin },
    { label: 'Calendari', path: '/calendar', show: true },
    { label: 'Fases', path: '/admin/fases', show: isAdmin },
    { label: 'Perfil', path: '/perfil', show: true },
  ];

  return (
    <nav className="border-b sticky top-0 z-50 transition-all" style={{ backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Logo placeholder or icon */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/logo-invers.png" alt="Iter Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            </div>

            <nav className="ml-8 hidden xl:flex items-center space-x-2">
              {navLinks.filter(link => link.show).map((link) => (
                <Link 
                  key={link.path}
                  href={link.path} 
                  className={`relative text-white/70 hover:text-white font-bold text-sm transition-colors px-3 py-2 hover:bg-white/10 ${pathname === link.path ? 'text-white bg-white/10' : ''}`}
                >
                  {link.label}
                  {link.isAvisos && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-4 w-4 bg-red-500 text-[8px] font-black items-center justify-center text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </span>
                  )}
                </Link>
              ))}
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
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border border-white/20 backdrop-blur-sm active:scale-95"
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
