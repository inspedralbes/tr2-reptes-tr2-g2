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
    <div className="sticky top-0 z-50">
      {/* Main Bar - Logo, Primary Nav and User Info */}
      <nav className="bg-[#00426B] border-b border-[#00426B] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-8">
              {/* Logo section */}
              <Link href={getInicioPath()} className="flex items-center gap-3">
                <div className="w-8 h-8 border border-white/20 p-1 flex items-center justify-center">
                  <img src="/logo-invers.png" alt="Iter Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-lg font-black leading-none tracking-tighter">{title}</span>
                  <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-0.5">Iteració d'Aprenentatge</span>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden xl:flex items-center h-full">
                {navLinks.filter(link => link.show).map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`h-full flex items-center px-4 text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-white/10 ${pathname === link.path ? 'bg-white/10 text-white border-b-2 border-white' : 'text-white/80 hover:text-white'}`}
                  >
                    <span className="relative">
                      {link.label}
                      {link.isAvisos && unreadCount > 0 && (
                        <span className="absolute -top-3 -right-3 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-4 w-4 bg-red-500 text-[8px] font-black items-center justify-center text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest hidden md:block">
                {user.nom_complet} {user.centre?.nom ? `• ${user.centre.nom}` : ''}
              </span>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/20 transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
