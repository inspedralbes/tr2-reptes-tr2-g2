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
      <section className="bg-white border-2 border-gray-100 p-12 mb-12 relative overflow-hidden">
        
        <h3 className="header-label">
          Estat del Programa Iter 25-26
        </h3>

        <div className="relative pt-4">
          {/* Connector line */}
          <div className="absolute top-10 left-0 w-full h-[2px] bg-gray-100 hidden md:block z-0"></div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-y-12 gap-x-8">
            {loadingFases ? (
              <div className="w-full py-8 text-center uppercase text-[10px] font-bold tracking-widest text-[#00426B]">Carregant calendari...</div>
            ) : (
              fases.map((fase) => (
                <div key={fase.id_fase} className="relative flex flex-col items-center text-center flex-1 group">
                  {/* Square with number */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center mb-6 z-10 border-2 transition-all ${fase.activa
                      ? 'bg-[#00426B] text-white border-[#00426B]'
                      : 'bg-white text-gray-200 border-gray-100'
                      }`}
                  >
                    <span className="text-base font-bold">
                      {fase.ordre}
                    </span>
                  </div>
                  
                  {/* Name and Date */}
                  <h4 className={`font-black text-[10px] uppercase tracking-[0.1em] mb-4 min-h-[3em] flex items-center justify-center ${fase.activa ? 'text-[#00426B]' : 'text-gray-300'}`}>
                    {fase.nom}
                  </h4>
                  
                  <div className={`text-[10px] font-bold px-4 py-2 border-2 ${fase.activa ? 'bg-[#00426B] text-white border-[#00426B]' : 'bg-white text-gray-200 border-gray-100'}`}>
                    {new Date(fase.data_inici).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Accesos Directos - Targetes Estil edubcn */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { 
            title: "Solicitar Tallers", 
            text: "Demana la participació del centre abans del 10 d'octubre.", 
            icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
            path: "/centro/peticions",
            active: isPhaseActive(PHASES.SOLICITUD),
            phaseLabel: "Fase Finalitzada"
          },
          { 
            title: "Gestió Alumnat", 
            text: "Inscriu els alumnes als tallers assignats de forma nominal.", 
            icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
            path: "/centro/alumnos",
            active: isPhaseActive(PHASES.PLANIFICACION) || isPhaseActive(PHASES.SOLICITUD),
            phaseLabel: "Propera Fase"
          },
          { 
            title: "Professors", 
            text: "Gestiona l'equip docent referent del projecte.", 
            icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
            path: "/centro/profesores",
            active: true
          },
          { 
            title: "Assignacions", 
            text: "Consulta la planificació i estat dels tallers adjudicats.", 
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
            path: "/centro/assignacions",
            active: isPhaseActive(PHASES.PLANIFICACION) || isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE)
          }
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => item.active && router.push(item.path)}
            className={`group p-10 border-2 transition-all ${item.active
              ? 'bg-white border-gray-100 cursor-pointer hover:border-[#4197CB]'
              : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
              }`}
          >
            <div className={`w-16 h-16 flex items-center justify-center mb-8 border-2 ${item.active ? 'bg-gray-50 text-[#00426B] border-gray-50 group-hover:bg-[#00426B] group-hover:text-white' : 'bg-gray-100 text-gray-200 border-gray-100'
              }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#00426B] mb-4 uppercase tracking-tighter">{item.title}</h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed tracking-wider">{item.text}</p>
            {(!item.active && item.phaseLabel) && (
              <span className={`text-[9px] font-black uppercase mt-8 block tracking-widest px-3 py-1 w-fit ${item.phaseLabel.includes('Final') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-[#0775AB] border border-blue-100'}`}>
                {item.phaseLabel}
              </span>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
