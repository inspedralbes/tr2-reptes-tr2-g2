'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME, ESTADOS_PETICION } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import tallerService, { Taller } from '@/services/tallerService';
import peticioService, { Peticio } from '@/services/peticioService';
import assignacioService from '@/services/assignacioService';
import centroService, { Centre } from '@/services/centroService';
import api from '@/services/api';

export default function AdminSolicitudesPage() {
  const { user, loading: authLoading } = useAuth();
  const [tallers, setTallers] = useState<Taller[]>([]);
  const [peticions, setPeticions] = useState<Peticio[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [fases, setFases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<string>('');
  
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiInstance = api();
      const [fetchedTallers, fetchedPeticions, fetchedFases, fetchedCentres] = await Promise.all([
        tallerService.getAll(),
        peticioService.getAll(),
        apiInstance.get('/fases'),
        centroService.getAll()
      ]);
      setTallers(fetchedTallers);
      setPeticions(fetchedPeticions);
      setFases(fetchedFases.data.data);
      setCentres(fetchedCentres);
    } catch (err) {
      console.error(err);
      setError('No es van poder carregar les dades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const handleApprove = async (idPeticio: number) => {
    if (!confirm('Segur que vols aprovar aquesta sol·licitud i generar l\'assignació?')) return;
    try {
      await peticioService.updateStatus(idPeticio, ESTADOS_PETICION.ACEPTADA);
      await assignacioService.createFromPeticio(idPeticio);
      await fetchData();
      alert('Sol·licitud aprovada i assignació generada.');
    } catch (err) {
      alert('Error en el procés d\'aprovació.');
    }
  };

  const handleReject = async (idPeticio: number) => {
    if (!confirm('Segur que vols rebutjar aquesta sol·licitud?')) return;
    try {
      await peticioService.updateStatus(idPeticio, ESTADOS_PETICION.RECHAZADA);
      await fetchData();
    } catch (err) {
      alert('Error al rebutjar la sol·licitud.');
    }
  };
  
  const handleRunTetris = async () => {
    if (!confirm('Aquesta acció processarà totes les sol·licituds aprovades pendents i generarà assignacions automàticament. Continuar?')) return;
    setLoading(true);
    try {
      const result = await assignacioService.runTetris();
      alert(`Assignació completada: ${result.assignmentsCreated} noves assignacions.`);
      await fetchData();
    } catch (err: any) {
      alert('Error al executar Tetris: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtered Peticions based on Center Selection
  const filteredPeticions = useMemo(() => {
    return peticions.filter(p => {
      const matchesCenter = !selectedCenterId || p.id_centre === parseInt(selectedCenterId);
      return matchesCenter;
    });
  }, [peticions, selectedCenterId]);

  // Grouped requests by workshop
  const workshopRequests = useMemo(() => {
    const map: Record<number, Peticio[]> = {};
    filteredPeticions.forEach(p => {
      if (!map[p.id_taller]) map[p.id_taller] = [];
      map[p.id_taller].push(p);
    });
    return map;
  }, [filteredPeticions]);

  // Final filtered workshops
  const filteredTallers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    return tallers.filter(t => {
      const matchesSearch = !searchQuery || 
        t.titol.toLowerCase().includes(query) || 
        t.sector.toLowerCase().includes(query);
      
      const matchesModality = !selectedModality || t.modalitat === selectedModality;
      
      const hasRequestsAfterFilter = workshopRequests[parseInt(t._id)]?.length > 0;
      
      return matchesSearch && matchesModality && hasRequestsAfterFilter;
    });
  }, [tallers, searchQuery, selectedModality, workshopRequests]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin h-8 w-8 border-2 border-t-transparent border-[#00426B] mx-auto"></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Gestió de Sol·licituds" 
      subtitle="Monitoritza i gestiona les peticions dels centres educatius per al curs actual."
    >
      {/* Filter Section */}
      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 flex flex-col xl:flex-row gap-6 items-end">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cerca Taller</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Ex: Robòtica, Cinema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#00426B] outline-none text-xs font-bold"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Center Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Centre Educatiu</label>
              <select 
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#00426B] outline-none text-xs font-bold"
              >
                <option value="">Tots els centres</option>
                {centres.map(c => (
                  <option key={c.id_centre} value={c.id_centre}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Modality Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modalitat</label>
              <select 
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#00426B] outline-none text-xs font-bold"
              >
                <option value="">Totes les modalitats</option>
                <option value="A">Modalitat A (Grup complet)</option>
                <option value="B">Modalitat B (Mig grup)</option>
                <option value="C">Modalitat C (Projectes individuals)</option>
              </select>
            </div>
          </div>

          <div className="hidden xl:block w-px h-10 bg-gray-200 mx-2"></div>

          <div className="flex w-full xl:w-auto">
            <button 
              onClick={handleRunTetris}
              className="flex-1 xl:w-auto bg-[#00426B] text-white px-8 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 2L14 9L21 11.5L14 14L11.5 21L9 14L2 11.5L9 9L11.5 2Z" />
                <path d="M19 14L20.2 17.5L23.7 18.7L20.2 19.9L19 23.4L17.8 19.9L14.3 18.7L17.8 17.5L19 14Z" />
              </svg>
              Assignació Automàtica
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-10 w-10 border-t-2 border-[#00426B] mx-auto mb-4"></div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Sincronitzant sol·licituds...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6">
          <p className="text-red-700 font-bold text-sm">{error}</p>
        </div>
      ) : filteredTallers.length > 0 ? (
        <div className="space-y-12">
          {filteredTallers.map(taller => {
            const requests = workshopRequests[parseInt(taller._id)] || [];
            return (
              <section key={taller._id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-2">
                  <div className="h-6 w-1 bg-[#00426B]"></div>
                  <div>
                    <h3 className="text-lg font-black text-[#00426B] uppercase tracking-tight">{taller.titol}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{taller.sector}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                        taller.modalitat === 'A' ? 'border-green-200 bg-green-50 text-green-700' :
                        taller.modalitat === 'B' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                        'border-blue-200 bg-blue-50 text-blue-700'
                      }`}>MOD {taller.modalitat}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Centre / Data</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Professorat</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Alumnes</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estat</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Accions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.map(p => (
                        <tr key={p.id_peticio} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-[#00426B]">{(p as any).centre?.nom}</div>
                            <div className="text-[10px] font-bold text-gray-400">{new Date(p.data_peticio).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-gray-700">1. {(p as any).prof1?.nom}</div>
                            <div className="text-xs font-medium text-gray-700">2. {(p as any).prof2?.nom || '-'}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-gray-100 px-2 py-1 text-xs font-black text-[#00426B]">{p.alumnes_aprox}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 border ${
                              p.estat === 'Pendent' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                              p.estat === 'Aprovada' ? 'border-green-200 text-green-600 bg-green-50' :
                              'border-red-200 text-red-600 bg-red-50'
                            }`}>
                              {p.estat}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {p.estat === 'Pendent' ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleApprove(p.id_peticio)}
                                  className="px-3 py-1.5 bg-[#00426B] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#0775AB]"
                                >
                                  Aprovar
                                </button>
                                <button 
                                  onClick={() => handleReject(p.id_peticio)}
                                  className="px-3 py-1.5 border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-50"
                                >
                                  Rebutjar
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] font-bold text-gray-300 uppercase italic">Gestionat</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 p-20 text-center">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">No s'han trobat sol·licituds amb els filtres aplicats</p>
        </div>
      )}
    </DashboardLayout>
  );
}
