'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import notificacioService, { Notificacio } from '@/services/notificacioService';
import { useEffect, useState, useRef } from 'react';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Iter' }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [user]);

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  const navLinks = [
    { label: 'Inicio', path: getInicioPath(), show: true },
    { label: 'Avisos', path: '/centro/avisos', show: isCoordinator || isAdmin, isAvisos: true },
    { label: 'Calendari', path: '/calendar', show: true },
    { label: 'Perfil', path: '/perfil', show: true },
  ];

  return (
    <div className="sticky top-0 z-50">
      {/* Main Bar - Logo, Primary Nav and User Info */}
      <nav className="bg-[#00426B] border-b border-[#00426B] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
              {/* Logo section */}
              <Link href={getInicioPath()} className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 border border-white/20 p-1 flex items-center justify-center">
                  <img src="/logo-invers.png" alt="Iter Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-lg font-black leading-none tracking-tighter">{title}</span>
                  <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-0.5">Iteració d'Aprenentatge</span>
                </div>
              </Link>

              {/* Navigation Links with Scroll */}
              <div className="relative flex-1 flex items-center min-w-0">
                {showLeftArrow && (
                  <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 z-10 bg-[#00426B] text-white p-1 shadow-lg hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                <div
                  ref={scrollContainerRef}
                  onScroll={checkScroll}
                  className="flex items-center h-full overflow-x-auto no-scrollbar scroll-smooth"
                >
                  {navLinks.filter(link => link.show).map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`h-full flex items-center px-4 md:px-6 text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-white/10 shrink-0 whitespace-nowrap ${pathname === link.path ? 'bg-white/10 text-white border-b-2 border-white' : 'text-white/80 hover:text-white'}`}
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

                {showRightArrow && (
                  <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 z-10 bg-[#00426B] text-white p-1 shadow-lg hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 shrink-0 ml-4">
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest hidden lg:block">
                {user.nom_complet} {user.centre?.nom ? `• ${user.centre.nom}` : ''}
              </span>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/20 transition-all font-inter"
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
