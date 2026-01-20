'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { THEME } from '@iter/shared';

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  
  // No mostrar breadcrumbs en la raíz o en login
  if (pathname === '/' || pathname === '/login') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Mapeo de segmentos a nombres legibles
  const segmentMap: Record<string, string> = {
    admin: 'Inici',
    centro: 'Inici',
    talleres: 'Tallers',
    centros: 'Centres',
    solicitudes: 'Peticions',
    fases: 'Fases',
    calendar: 'Calendari',
    perfil: 'El meu Perfil',
    alumnos: 'Alumnat',
    profesores: 'Professorat',
    assignacions: 'Assignacions'
  };

  return (
    <div className="mb-10 w-full">
      <nav className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-widest" aria-label="Breadcrumb">
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const label = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={path}>
              {index > 0 && (
                <span className="text-gray-300 mx-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
              {isLast ? (
                <span className="text-gray-400" style={{ fontFamily: THEME.fonts.primary }}>
                  {label}
                </span>
              ) : (
                <Link 
                  href={path}
                  className="hover:text-blue-600 transition-colors"
                  style={{ color: THEME.colors.primary, fontFamily: THEME.fonts.primary }}
                >
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      <div className="h-px bg-gray-200 w-full mt-4" />
    </div>
  );
};

export default Breadcrumbs;
