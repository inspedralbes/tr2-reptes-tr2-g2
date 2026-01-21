'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME, PHASES } from '@iter/shared';
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
  ordre: number;
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

  const isPhaseActive = (nomFase: string) => {
    const fase = fases.find(f => f.nom === nomFase);
    return fase ? fase.activa : false;
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={`Panell de Centre: ${user.centre?.nom || 'Educatiu'}`}
      subtitle="Procés de gestió de tallers d'Iter."
    >
      {/* Timeline Secció Institucional */}
      <section className="bg-white border border-gray-200 p-12 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05]">
          <svg className="h-32 w-32 text-[#00426B]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00426B] mb-12 flex items-center gap-4">
          <span className="w-12 h-1 bg-[#0775AB]"></span>
          Estat del Programa Iter 25-26
        </h3>

        <div className="relative">
          {/* Connector line for desktop */}
          <div className="absolute top-6 left-0 w-full h-1 bg-[#EAEFF2] hidden md:block z-0"></div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-y-12 gap-x-6">
            {loadingFases ? (
              <div className="w-full py-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                  <div className="h-2 bg-gray-50 rounded w-1/2"></div>
                </div>
              </div>
            ) : fases.length === 0 ? (
              <p className="w-full text-xs text-gray-400 font-bold uppercase tracking-widest text-center py-8">No hi ha fases configurades.</p>
            ) : (
              fases.map((fase) => (
                <div key={fase.id_fase} className="relative flex flex-col items-center text-center group/phase flex-1">
                  <div
                    className={`w-14 h-14 flex items-center justify-center mb-6 z-10 border-4 transition-all duration-500 scale-100 ${fase.activa
                      ? 'border-[#0775AB] bg-[#00426B] text-white shadow-xl scale-110'
                      : 'border-[#EAEFF2] bg-white text-gray-300 group-hover/phase:border-[#0775AB] group-hover/phase:text-[#0775AB]'
                      }`}
                  >
                    <span className="text-lg font-black italic tracking-tighter">
                      {fase.ordre}
                    </span>
                  </div>
                  <h4 className={`font-black text-[10px] uppercase tracking-[0.15em] leading-tight mb-3 transition-colors duration-300 ${fase.activa ? 'text-[#00426B]' : 'text-gray-400 group-hover/phase:text-[#0775AB]'
                    }`}>
                    {fase.nom}
                  </h4>
                  <div className={`text-[10px] font-bold px-3 py-1 border transition-colors ${fase.activa ? 'bg-[#00426B] text-white border-[#00426B]' : 'bg-white text-gray-300 border-[#EAEFF2]'
                    }`}>
                    {new Date(fase.data_inici).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Accesos Directos - Targetes Estil edubcn */}
      < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" >
        <div
          onClick={() => isPhaseActive(PHASES.SOLICITUD) && router.push('/centro/peticions')}
          className={`group p-10 border transition-all duration-500 relative overflow-hidden ${isPhaseActive(PHASES.SOLICITUD)
            ? 'bg-white border-gray-200 cursor-pointer hover:border-[#0775AB] hover:shadow-2xl'
            : 'bg-[#F2F2F3] border-gray-300 opacity-60 cursor-not-allowed'
            }`}
        >
          <div className={`w-16 h-16 flex items-center justify-center mb-8 border transition-all duration-300 ${isPhaseActive(PHASES.SOLICITUD) ? 'bg-[#EAEFF2] text-[#00426B] border-[#EAEFF2] group-hover:bg-[#00426B] group-hover:text-white' : 'bg-gray-200 text-gray-400 border-gray-200'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#00426B] mb-3 uppercase tracking-tight">Solicitar Tallers</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wider">Demana la participació del centre abans del <span className="text-[#0775AB] font-black">10 d'octubre</span>.</p>
          {!isPhaseActive(PHASES.SOLICITUD) && <span className="text-[9px] font-black uppercase text-red-600 mt-6 block tracking-widest px-2 py-1 bg-red-50 w-fit">Fase Finalitzada</span>}
        </div>

        <div
          onClick={() => isPhaseActive(PHASES.PLANIFICACION) && router.push('/centro/alumnos')}
          className={`group p-10 border transition-all duration-500 relative overflow-hidden ${isPhaseActive(PHASES.PLANIFICACION)
            ? 'bg-white border-gray-200 cursor-pointer hover:border-[#0775AB] hover:shadow-2xl'
            : 'bg-[#F2F2F3] border-gray-300 opacity-60 cursor-not-allowed'
            }`}
        >
          <div className={`w-16 h-16 flex items-center justify-center mb-8 border transition-all duration-300 ${isPhaseActive(PHASES.PLANIFICACION) ? 'bg-[#EAEFF2] text-[#00426B] border-[#EAEFF2] group-hover:bg-[#00426B] group-hover:text-white' : 'bg-gray-200 text-gray-400 border-gray-200'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#00426B] mb-3 uppercase tracking-tight">Gestió Alumnat</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wider">Inscriu els alumnes als tallers assignats de forma nominal.</p>
          {!isPhaseActive(PHASES.PLANIFICACION) && <span className="text-[9px] font-black uppercase text-[#0775AB] mt-6 block tracking-widest px-2 py-1 bg-blue-50 w-fit">Propera Fase</span>}
        </div>

        <div
          onClick={() => isPhaseActive(PHASES.PLANIFICACION) && router.push('/centro/profesores')}
          className={`group p-10 border transition-all duration-500 relative overflow-hidden ${isPhaseActive(PHASES.PLANIFICACION)
            ? 'bg-white border-gray-200 cursor-pointer hover:border-[#0775AB] hover:shadow-2xl'
            : 'bg-[#F2F2F3] border-gray-300 opacity-60 cursor-not-allowed'
            }`}
        >
          <div className={`w-16 h-16 flex items-center justify-center mb-8 border transition-all duration-300 ${isPhaseActive(PHASES.PLANIFICACION) ? 'bg-[#EAEFF2] text-[#00426B] border-[#EAEFF2] group-hover:bg-[#00426B] group-hover:text-white' : 'bg-gray-200 text-gray-400 border-gray-200'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#00426B] mb-3 uppercase tracking-tight">Professors</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wider">Gestiona l'equip docent referent del projecte.</p>
        </div>

        <div
          onClick={() => (isPhaseActive(PHASES.PLANIFICACION) || isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE)) && router.push('/centro/assignacions')}
          className={`group p-10 border transition-all duration-500 relative overflow-hidden ${(isPhaseActive(PHASES.PLANIFICACION) || isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE))
            ? 'bg-white border-gray-200 cursor-pointer hover:border-[#0775AB] hover:shadow-2xl'
            : 'bg-[#F2F2F3] border-gray-300 opacity-60 cursor-not-allowed'
            }`}
        >
          <div className={`w-16 h-16 flex items-center justify-center mb-8 border transition-all duration-300 ${(isPhaseActive(PHASES.PLANIFICACION) || isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE)) ? 'bg-[#EAEFF2] text-[#00426B] border-[#EAEFF2] group-hover:bg-[#00426B] group-hover:text-white' : 'bg-gray-200 text-gray-400 border-gray-200'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#00426B] mb-3 uppercase tracking-tight">Assignacions</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wider">Consulta la planificació i estat dels tallers adjudicats.</p>
        </div>
      </div >
    </DashboardLayout >
  );
}
