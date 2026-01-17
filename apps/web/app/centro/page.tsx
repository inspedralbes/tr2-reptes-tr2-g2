'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import ResourcesWidget from '@/components/ResourcesWidget';
import getApi from '@/services/api';

interface Fase {
  id_fase: number;
  nom: string;
  descripcio: string;
  data_inici: string;
  data_fi: string;
  activa: boolean;
}

export default function CentroDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [fases, setFases] = useState<Fase[]>([]);
  const [loadingFases, setLoadingFases] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'COORDINADOR')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchFases = async () => {
      try {
        const api = getApi();
        const response = await api.get("/fases");
        setFases(response.data.data);
      } catch (error) {
        console.error("Error fetching phases:", error);
      } finally {
        setLoadingFases(false);
      }
    };

    if (user && user.rol.nom_rol === 'COORDINADOR') {
      fetchFases();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  const headerActions = (
    <ResourcesWidget />
  );

  return (
    <DashboardLayout 
      title={`Panell de Centre: ${user.centre?.nom || 'Educatiu'}`}
      subtitle="Procés de gestió de tallers del Programa Iter."
      actions={headerActions}
    >
      {/* Timeline Secció Compacta */}
      <section className="bg-white shadow-sm border border-gray-100 p-10 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
          <svg className="h-40 w-40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10 flex items-center gap-3">
          <span className="w-6 h-px bg-gray-200"></span>
          Cronograma del Procés
        </h3>
        
        <div className="relative">
          {/* Connector line for desktop */}
          <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-50 hidden md:block z-0"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-y-10 gap-x-4">
            {loadingFases ? (
              <div className="w-full py-4 text-center">
                <div className="animate-pulse flex space-x-4 justify-center">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            ) : fases.length === 0 ? (
              <p className="w-full text-sm text-gray-500 italic text-center">No hi ha fases definides.</p>
            ) : (
              fases.map((fase, index) => (
                <div key={fase.id_fase} className="relative flex flex-col items-center text-center group/phase flex-1">
                  <div 
                    className={`w-12 h-12 flex items-center justify-center mb-5 z-10 border-2 transition-all duration-300 ${
                      fase.activa 
                        ? 'border-blue-500 bg-blue-600 text-white shadow-lg ring-8 ring-blue-50' 
                        : 'border-gray-100 bg-white text-gray-300 group-hover/phase:bg-blue-600 group-hover/phase:text-white group-hover/phase:border-blue-600'
                    }`}
                  >
                    <span className="text-sm font-black italic">
                      {index + 1}
                    </span>
                  </div>
                  <h4 className={`font-black text-[11px] uppercase tracking-wider leading-tight mb-2 transition-colors duration-300 ${
                    fase.activa ? 'text-blue-900' : 'text-gray-400 group-hover/phase:text-blue-600'
                  }`}>
                    {fase.nom}
                  </h4>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                    {new Date(fase.data_inici).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                  </p>
                  {fase.activa && (
                    <div className="mt-3">
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-widest animate-pulse shadow-sm shadow-blue-100/50">En curs</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            onClick={() => router.push('/centro/peticions')}
            className="group bg-white p-8 border border-gray-100 shadow-sm cursor-pointer transition-all duration-300"
          >
            <div className="w-14 h-14 bg-blue-50 flex items-center justify-center mb-6 text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitar Talleres</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Indica les teves preferències i el nombre d'alumnes abans del <span className="font-bold text-gray-700">10 d'octubre</span>.</p>
          </div>

        <div 
          onClick={() => router.push('/centro/alumnos')}
          className="group bg-white p-8 border border-gray-100 shadow-sm cursor-pointer transition-all duration-300"
        >
          <div className="w-14 h-14 bg-green-50 flex items-center justify-center mb-6 text-green-600 shadow-inner group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Gestionar Alumnos</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Afegeix o modifica els alumnes que participaran en els tallers.</p>
        </div>

        <div 
          onClick={() => router.push('/centro/profesores')}
          className="group bg-white p-8 border border-gray-100 shadow-sm cursor-pointer transition-all duration-300"
        >
          <div className="w-14 h-14 bg-purple-50 flex items-center justify-center mb-6 text-purple-600 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Gestionar Profesores</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Gestiona els professors referents del teu centre.</p>
        </div>

        <div 
          onClick={() => router.push('/centro/assignacions')}
          className="group bg-white p-8 border border-gray-100 shadow-sm cursor-pointer transition-all duration-300"
        >
          <div className="w-14 h-14 bg-orange-50 flex items-center justify-center mb-6 text-orange-600 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ver Asignaciones</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Consulta els tallers assignats i el teu centre referent.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
