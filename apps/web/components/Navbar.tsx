'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import notificacioService, { Notificacio } from '@/services/notificacioService';
import { useEffect, useState, useRef } from 'react';
import Avatar from './Avatar';

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
    { label: 'Avisos', path: '/centro/avisos', show: true, isAvisos: true },
    { label: 'Calendari', path: '/calendar', show: true },
    { label: 'Perfil', path: '/perfil', show: true },
  ];

  return (
    <div className="sticky top-0 z-50 bg-white border-t-4 border-t-[#00426B] border-b border-b-[#CFD2D3]">
      <div className="max-w-[1440px] mx-auto container-responsive">
        <div className="flex justify-between h-16">
          {/* Logo & Brand Section */}
          <div className="flex items-center">
            <Link href={getInicioPath()} className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Iter Logo" 
                className="w-10 h-10 object-contain" 
              />
            </Link>
          </div>

          {/* Navigation & User Section */}
          <div className="flex items-center">
            {/* Nav Links */}
            <nav className="hidden md:flex items-center h-full mr-8">
              {navLinks.filter(link => link.show).map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`h-full flex items-center px-4 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                    pathname === link.path 
                      ? 'border-[#00426B] text-[#00426B]' 
                      : 'border-transparent text-[#00426B]/40 hover:text-[#00426B] hover:bg-[#F2F4F7]'
                  }`}
                >
                  <span className="relative">
                    {link.label}
                    {link.isAvisos && unreadCount > 0 && (
                      <span className="absolute -top-3 -right-4 flex h-4 w-4">
                        <span className="relative inline-flex h-4 w-4 bg-[#F26178] text-[8px] font-bold items-center justify-center text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center border-l border-[#CFD2D3] pl-8 h-8 my-auto gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[#00426B] text-[10px] font-bold uppercase tracking-widest">
                  {user.nom_complet}
                </span>
                <span className="text-[#4197CB] text-[8px] font-bold uppercase tracking-widest">
                  {user.rol.nom_rol} {user.centre?.nom ? `• ${user.centre.nom}` : ''}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-[#00426B] hover:bg-[#0775AB] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2 transition-all"
              >
                Sortir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
