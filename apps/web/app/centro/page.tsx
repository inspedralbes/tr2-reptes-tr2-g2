'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@enginy/shared';
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
        setFases(response.data);
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
      subtitle="Procés de gestió de tallers del Programa Enginy."
      actions={headerActions}
    >
      {/* Timeline Secció Compacta */}
      <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 mb-12 relative overflow-hidden group">
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
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 z-10 border-2 transition-all duration-500 transform group-hover/phase:scale-110 ${
                      fase.activa 
                        ? 'border-blue-500 bg-blue-600 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] ring-8 ring-blue-50' 
                        : 'border-gray-100 bg-white text-gray-300'
                    }`}
                  >
                    <span className="text-sm font-black italic">
                      {index + 1}
                    </span>
                  </div>
                  <h4 className={`font-black text-[11px] uppercase tracking-wider leading-tight mb-2 transition-colors duration-300 ${
                    fase.activa ? 'text-blue-900' : 'text-gray-400'
                  }`}>
                    {fase.nom}
                  </h4>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                    {new Date(fase.data_inici).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                  </p>
                  {fase.activa && (
                    <div className="mt-3">
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-sm shadow-blue-100/50">En curs</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Accesos Directos Dinàmics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(() => {
          const findFase = (name: string) => fases.find(f => f.nom.includes(name));
          
          const faseInscripcio = findFase('Inscripció');
          const faseAsignacio = findFase('Asignación');
          const faseCierre = findFase('Cierre');

          const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long' });
          };

          const actions = [
            {
              title: "Solicitar Talleres",
              desc: faseInscripcio 
                ? `Indica les teves preferències i el nombre d'alumnes abans del <span class="font-bold text-gray-700">${formatDate(faseInscripcio.data_fi)}</span>.`
                : "Indica les teves preferències i el nombre d'alumnes.",
              path: '/centro/peticions',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              enabled: faseInscripcio?.activa || false
            },
            {
              title: "Ver Asignaciones",
              desc: faseAsignacio
                ? `Consulta els tallers assignats i el teu centre referent a partir del <span class="font-bold text-gray-700">${formatDate(faseAsignacio.data_inici)}</span>.`
                : "Consulta els tallers assignats i el teu centre referent.",
              path: '/centro/assignacions',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              enabled: faseAsignacio?.activa || false
            },
            {
              title: "Validación Final",
              desc: "Completa el checklist un cop hagin finalitzat les sessions dels tallers.",
              path: '#',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
              enabled: faseCierre?.activa || false
            }
          ];

          return actions.map((action, idx) => (
            <div 
              key={idx}
              onClick={() => action.enabled && action.path !== '#' && router.push(action.path)}
              className={`group bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 transition-all duration-500 relative overflow-hidden ${
                action.enabled 
                  ? 'hover:shadow-[0_20px_40px_rgba(0,66,107,0.08)] cursor-pointer hover:-translate-y-2' 
                  : 'opacity-60 cursor-not-allowed grayscale'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-inner ${
                action.enabled 
                  ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {action.icon}
              </div>
              <h3 className={`text-xl font-black mb-3 tracking-tight ${action.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                {action.title}
              </h3>
              <p 
                className={`text-sm leading-relaxed ${action.enabled ? 'text-gray-500' : 'text-gray-300'}`}
                dangerouslySetInnerHTML={{ __html: action.desc }}
              />
              
              {action.enabled && (
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ));
        })()}
      </div>
    </DashboardLayout>
  );
}
