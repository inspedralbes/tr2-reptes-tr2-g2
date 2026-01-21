'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';

export default function AssignacionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [assignacions, setAssignacions] = useState<any[]>([]);
  const [fases, setFases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tots els estats");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.rol.nom_rol !== 'COORDINADOR') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Fetch asignaciones
    if (currentUser.id_centre) {
      const api = getApi();

      Promise.all([
        api.get(`/assignacions/centre/${currentUser.id_centre}`),
        api.get("/fases")
      ]).then(([resAssig, resFases]) => {
        setAssignacions(resAssig.data);
        setFases(resFases.data.data);
      }).finally(() => setLoading(false));
    }
  }, []);

  const isPhaseActive = (nomFase: string) => {
    const fase = fases.find(f => f.nom === nomFase);
    return fase ? fase.activa : false;
  };

  const filteredAssignacions = assignacions.filter(a => {
    const matchesSearch = !searchQuery || 
      a.taller?.titol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.peticio?.centre?.nom?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "Tots els estats" || a.estat === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) return null;

  return (
    <DashboardLayout
      title="Talleres Asignados"
      subtitle="Aquí puedes consultar el estado de tus talleres y el centro referente."
    >
      <div className="w-full">
        {/* Panell de Filtres */}
        <div className="bg-white border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex-1 w-full space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00426B] mb-2 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#0775AB]"></span>
                Panell de Filtres
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per taller o centre..."
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border-none text-[11px] font-bold uppercase tracking-wider text-[#00426B] focus:ring-2 focus:ring-[#0775AB] transition-all outline-none"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-4 w-4 text-[#00426B]/40 group-focus-within:text-[#0775AB] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-none text-[11px] font-bold uppercase tracking-wider text-[#00426B] focus:ring-2 focus:ring-[#0775AB] transition-all outline-none appearance-none"
                >
                  <option>Tots els estats</option>
                  <option>En curs</option>
                  <option>Finalitzat</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter("Tots els estats"); }}
              className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#EAEFF2] transition-all border border-[#CFD2D3]"
            >
              Netejar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-10 w-10 border-b-2 border-[#00426B] mx-auto mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carregant assignacions...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Taller Assignat</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Centre Referent</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Calendari</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Estat / Progrés</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignacions.map(a => (
                  <tr key={a.id_assignacio} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#4197CB] mb-1">Taller Iter</span>
                        <span className="text-sm font-black text-[#00426B] uppercase tracking-tight">{a.taller?.titol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h5m-5 4h5" />
                        </svg>
                        <span className="text-xs font-bold text-gray-600">{a.peticio?.centre?.nom || 'Pendent'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Inici: {a.data_inici ? new Date(a.data_inici).toLocaleDateString() : 'Pendiente'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-3">
                        <span className={`w-fit px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                          a.estat === 'En curs' ? 'border-orange-200 bg-orange-50 text-orange-600' : 'border-green-200 bg-green-50 text-green-600'
                        }`}>
                          {a.estat}
                        </span>
                        
                        {/* Checklist Mini Visualitzador */}
                        <div className="flex items-center gap-1">
                          {a.checklist?.map((item: any) => (
                            <div 
                              key={item.id_checklist} 
                              title={item.pas_nom}
                              className={`w-2 h-2 border ${item.completat ? 'bg-green-500 border-green-500' : 'bg-gray-100 border-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col sm:flex-row justify-end items-center gap-2">

                        <button
                          onClick={() => isPhaseActive(PHASES.PLANIFICACION) && router.push(`/centro/assignacions/${a.id_assignacio}/alumnos`)}
                          disabled={!isPhaseActive(PHASES.PLANIFICACION)}
                          className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${isPhaseActive(PHASES.PLANIFICACION)
                            ? 'border-[#0775AB] text-[#0775AB] hover:bg-[#0775AB] hover:text-white'
                            : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                          Registre Nominal
                        </button>
                        <button
                          onClick={() => (isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE)) ? router.push(`/centro/assignacions/${a.id_assignacio}/evaluacions`) : alert('Documentació encara no disponible')}
                          className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${(isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE))
                            ? 'border-[#F26178] text-[#F26178] hover:bg-[#F26178] hover:text-white'
                            : 'border-gray-100 text-gray-300'
                            }`}
                        >
                          {(isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE)) ? 'Avaluar Alumnes' : 'Doc.'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAssignacions.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No s'han trobat assignacions</p>
                <p className="text-[9px] font-bold text-gray-300 uppercase mt-2">Prova d'ajustar els filtres de cerca.</p>
              </div>
            )}
          </div>
        )}

        {/* Sección de Incidencias (Solo disponible en Fase 3) */}
        {isPhaseActive(PHASES.EJECUCION) && (
          <section className="mt-16 bg-white p-8 border border-gray-200">
            <h3 className="text-xl font-black text-[#00426B] mb-4 uppercase tracking-tighter">Gestió de Incidències i Vacants</h3>
            <p className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest">
              REPORTAR PROBLEMES DE COMPORTAMENT O SOL·LICITAR PLACES VACANTS.
            </p>

            <div className="flex gap-4">
              <input
                id="incidencia-input"
                type="text"
                placeholder="Descriu el problema..."
                className="flex-1 px-4 py-4 bg-[#F8FAFC] border-none text-[11px] font-bold uppercase tracking-wider text-[#00426B] focus:ring-2 focus:ring-[#F26178] outline-none transition-all"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('incidencia-input') as HTMLInputElement;
                  if (!input.value) return;
                  const api = getApi();
                  await api.post('/assignacions/incidencies', {
                    id_centre: user.id_centre,
                    descripcio: input.value
                  });
                  input.value = '';
                  alert('Incidència reportada. El CEB la revisarà properament.');
                }}
                className="px-8 py-4 bg-[#F26178] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#D94E64] transition-all"
              >
                Reportar Incidència
              </button>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
