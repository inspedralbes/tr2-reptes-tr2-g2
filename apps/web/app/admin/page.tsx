'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  const sections = [
    {
      title: 'Gestión de Talleres',
      description: 'Administra el catálogo de talleres disponibles, sus sectores y modalidades.',
      path: '/admin/talleres',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2H3a2 2 0 01-2-2V4a2 2 0 114 0v1a2 2 0 012 2h4a2 2 0 012-2V4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-4-4m0 0l-4 4m4-4v12" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Gestión de Centros',
      description: 'Gestiona la información de los centros educativos participantes.',
      path: '/admin/centros',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'red'
    },
    {
      title: 'Solicitudes de Centros',
      description: 'Consulta las peticiones de los centros y asigna talleres.',
      path: '/admin/solicitudes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'orange'
    },
    {
      title: 'Fases del Programa',
      description: 'Configura las fechas y estados de las diferentes fases del curso.',
      path: '/admin/fases',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'Estadísticas',
      description: 'Analítica avanzada de uso, talleres más demandados y actividad del sistema.',
      path: '/admin/stats',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'green'
    }
  ];

  return (
    <DashboardLayout
      title="Panel de Administración"
      subtitle="Bienvenido al centro de control del programa Iter. Gestiona talleres, centros y solicitudes desde este panel."
    >
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {sections.map((section) => (
            <div
              key={section.path}
              onClick={() => router.push(section.path)}
              className="group bg-white p-8 md:p-10 border border-gray-200 cursor-pointer transition-all duration-300 hover:border-[#0775AB] hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#F2F2F3] -mr-8 -mt-8 rotate-45 group-hover:bg-[#0775AB] transition-colors duration-300"></div>

              <div className={`w-16 h-16 bg-[#EAEFF2] flex items-center justify-center mb-8 border border-gray-100 group-hover:bg-[#00426B] group-hover:text-white transition-all duration-300`}>
                <div className={`text-[#00426B] group-hover:text-white`}>
                  {section.icon}
                </div>
              </div>
              <h3 className="text-xl font-black text-[#00426B] mb-3 uppercase tracking-tight">{section.title}</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wider">{section.description}</p>

              <div className="mt-8 flex items-center text-[#0775AB] font-bold text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                Accedir al mòdul
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
