'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME, ESTADOS_PETICION, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import tallerService, { Taller } from '@/services/tallerService';
import peticioService, { Peticio } from '@/services/peticioService';
import assignacioService from '@/services/assignacioService';
import api from '@/services/api';

export default function AdminSolicitudesPage() {
  const { user, loading: authLoading } = useAuth();
  const [tallers, setTallers] = useState<Taller[]>([]);
  const [peticions, setPeticions] = useState<Peticio[]>([]);
  const [fases, setFases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          const apiInstance = api();
          const [fetchedTallers, fetchedPeticions, fetchedFases] = await Promise.all([
            tallerService.getAll(),
            peticioService.getAll(),
            apiInstance.get('/fases')
          ]);
          setTallers(fetchedTallers);
          setPeticions(fetchedPeticions);
          setFases(fetchedFases.data.data);
        } catch (err) {
          console.error(err);
          setError('No se pudieron cargar las solicitudes.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, authLoading, router]);

  const handleApprove = async (idPeticio: number) => {
    if (!confirm('¿Seguro que quieres aprobar esta solicitud y generar la asignación?')) return;
    try {
      await peticioService.updateStatus(idPeticio, ESTADOS_PETICION.ACEPTADA);
      await assignacioService.createFromPeticio(idPeticio);
      // Refresh data
      const updatedPeticions = await peticioService.getAll();
      setPeticions(updatedPeticions);
      alert('Solicitud aprovada i assignació generada.');
    } catch (err) {
      alert('Error en el procés d\'aprovació.');
    }
  };

  const handleReject = async (idPeticio: number) => {
    if (!confirm('¿Seguro que quieres rechazar esta solicitud?')) return;
    try {
      await peticioService.updateStatus(idPeticio, ESTADOS_PETICION.RECHAZADA);
      const updatedPeticions = await peticioService.getAll();
      setPeticions(updatedPeticions);
    } catch (err) {
      alert('Error al rebutjar la sol·licitud.');
    }
  };
  
  const handleRunTetris = async () => {
    if (!confirm('Esta acción procesará todas las solicitudes aprobadas pendientes y generará asignaciones automáticamente respetando capacidades. ¿Continuar?')) return;
    setLoading(true);
    try {
      const result = await assignacioService.runTetris();
      alert(`Asignación completada: ${result.assignmentsCreated} nuevas asignaciones.\n\nEstadísticas:\n- Peticiones procesadas: ${result.stats.assignedPetitions}/${result.stats.totalPetitions}\n- Alumnos asignados: ${result.stats.assignedStudents}/${result.stats.totalStudents}`);
      // Refresh data
      const updatedPeticions = await peticioService.getAll();
      setPeticions(updatedPeticions);
    } catch (err: any) {
      alert('Error al ejecutar Tetris: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const isPhaseActive = (nomFase: string) => {
    const fase = fases.find(f => f.nom === nomFase);
    return fase ? fase.activa : false;
  };

  const workshopRequests = useMemo(() => {
    const map: Record<number, Peticio[]> = {};
    peticions.forEach(p => {
      if (!map[p.id_taller]) map[p.id_taller] = [];
      map[p.id_taller].push(p);
    });
    return map;
  }, [peticions]);

  const filteredTallers = useMemo(() => {
    let result = tallers;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.titol.toLowerCase().includes(query) || 
        t.sector.toLowerCase().includes(query)
      );
    }
    // Only show workshops with requests
    return result.filter(t => workshopRequests[parseInt(t._id)]?.length > 0);
  }, [tallers, searchQuery, workshopRequests]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Solicitudes de Centros" 
      subtitle="Monitoriza qué talleres están siendo más demandados y gestiona las peticiones de los centros participantes."
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <input 
            type="text"
            placeholder="Buscar por taller o sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-none shadow-none focus:border-consorci-darkBlue focus:ring-1 focus:ring-consorci-darkBlue transition-all text-sm outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-consorci-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Peticiones:</span>
            <span className="bg-consorci-darkBlue text-white px-3 py-1 text-xs font-black">{peticions.length}</span>
          </div>
          <button 
            onClick={handleRunTetris}
            className="bg-white border-2 border-consorci-darkBlue text-consorci-darkBlue hover:bg-consorci-darkBlue hover:text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Assignació Automàtica
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando solicitudes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl">
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      ) : filteredTallers.length > 0 ? (
        <div className="space-y-10">
          {filteredTallers.map(taller => {
            const requests = workshopRequests[parseInt(taller._id)] || [];
            return (
              <section key={taller._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-8 w-1.5 bg-consorci-darkBlue"></div>
                  <div>
                    <h3 className="text-xl font-bold text-consorci-darkBlue uppercase tracking-tight">{taller.titol}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                        {taller.sector}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                        taller.modalitat === 'A' ? 'border-green-200 bg-green-50 text-green-700' :
                        taller.modalitat === 'B' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                        'border-consorci-lightBlue bg-blue-50 text-consorci-lightBlue'
                      }`}>
                        Modalitat {taller.modalitat}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-0 border-t border-l border-r border-gray-200 mb-12">
                  {requests.map(p => (
                    <div key={p.id_peticio} className="bg-white border-b border-gray-200 flex flex-col lg:flex-row hover:bg-gray-50/30 transition-colors">
                      {/* Data Section (Left) */}
                      <div className="flex-1 p-6 flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                          {/* Center Info */}
                          <div className="min-w-[200px] w-full lg:w-1/4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Centre</label>
                            <h4 className="text-lg font-bold text-consorci-darkBlue">{(p as any).centre?.nom}</h4>
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                              <svg className="h-3.5 w-3.5 text-consorci-lightBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {new Date(p.data_peticio).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Request Details */}
                          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Professors Referents</label>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="font-bold text-consorci-darkBlue">1.</span> <span className="text-gray-700">{(p as any).prof1?.nom || 'No asignat'}</span> 
                                  <span className="text-gray-400 text-[10px] ml-2 italic">{(p as any).prof1?.contacte}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-bold text-consorci-darkBlue">2.</span> <span className="text-gray-700">{(p as any).prof2?.nom || 'No asignat'}</span>
                                  <span className="text-gray-400 text-[10px] ml-2 italic">{(p as any).prof2?.contacte}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estat</label>
                              <div className={`inline-block px-4 py-1 text-[10px] font-black uppercase tracking-widest border ${
                                p.estat === 'Pendent' ? 'border-orange-200 bg-orange-50 text-orange-600' :
                                p.estat === 'Aprovada' ? 'border-green-200 bg-green-50 text-green-600' :
                                'border-consorci-pinkRed bg-red-50 text-consorci-pinkRed'
                              }`}>
                                {p.estat}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comments row - Conditional */}
                        {p.comentaris && (
                          <div className="border-t border-gray-50 pt-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Comentaris</label>
                            <p className="text-xs text-gray-600 italic leading-relaxed">{p.comentaris}</p>
                          </div>
                        )}
                      </div>

                      {/* Control Column (Right Sidebar) - Actions only */}
                      <div className="w-full lg:w-48 bg-gray-50/80 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 flex flex-col justify-center items-center">
                        {p.estat === 'Pendent' ? (
                          <div className="w-full space-y-2">
                            <button 
                              onClick={() => handleApprove(p.id_peticio)}
                              className="w-full px-4 py-2.5 bg-consorci-darkBlue text-white text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-none"
                            >
                              Aprovar
                            </button>
                            <button 
                              onClick={() => handleReject(p.id_peticio)}
                              className="w-full px-4 py-2.5 border-2 border-consorci-pinkRed text-consorci-pinkRed text-[10px] font-black uppercase tracking-widest hover:bg-consorci-pinkRed hover:text-white transition-all shadow-none"
                            >
                              Rebutjar
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Peticio gestionada</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-gray-800">No hay solicitudes para mostrar</h4>
          <p className="text-sm text-gray-400 mt-1">Intenta ajustar tu búsqueda o espera a que los centros realicen peticiones.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
