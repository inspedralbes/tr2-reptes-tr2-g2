'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME, FASES } from '@enginy/shared';
import DashboardLayout from '@/components/DashboardLayout';
import NextEventsWidget from '@/components/NextEventsWidget';

export default function CentroDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.rol.nom_rol !== 'COORDINADOR')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title={`Panel de Centro: ${user.centre?.nom || 'Educatiu'}`}
      subtitle="Benvolgut al procés de gestió de tallers del Programa Enginy."
    >
      {/* Timeline i Properes Fites */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
        <div className="lg:col-span-3">
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Cronograma del Procés</h3>
            <div className="relative">
              <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-100 hidden sm:block"></div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                {FASES.map((fase, index) => (
                  <div key={fase.id} className="relative flex flex-col items-start sm:items-center text-left sm:text-center">
                    <div 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 z-10 border-2 transition-all shadow-sm ${
                        index === 1 ? 'border-blue-500 bg-blue-600 text-white shadow-blue-200' : 'border-gray-100 bg-white text-gray-400'
                      }`}
                    >
                      <span className="text-sm font-black">
                        {index + 1}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-800 tracking-tight leading-tight">{fase.nom}</h4>
                    {fase.data && (
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                        {new Date(fase.data).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="lg:col-span-1">
          <NextEventsWidget />
        </div>
      </div>

      {/* Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          onClick={() => router.push('/centro/peticions')}
          className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitar Talleres</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Indica les teves preferències i el nombre d'alumnes abans del <span className="font-bold text-gray-700">10 d'octubre</span>.</p>
        </div>

        <div 
          onClick={() => router.push('/centro/assignacions')}
          className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ver Asignaciones</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Consulta els tallers assignats i el teu centre referent a partir del <span className="font-bold text-gray-700">20 d'octubre</span>.</p>
        </div>

        <div 
          className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 opacity-60 cursor-not-allowed grayscale"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Validación Final</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Completa el checklist un cop hagin finalitzat les sessions dels tallers.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
