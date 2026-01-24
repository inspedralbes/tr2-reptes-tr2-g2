'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AssignacionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [assignacions, setAssignacions] = useState<any[]>([]);
  const [fases, setFases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tots els estats");
  
  // Dialog states
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
      title="Talleres Assignats"
      subtitle="Consulta i gestiona la planificació dels teus tallers."
    >
      <div className="w-full">
        {/* Panell de Filtres */}
        <div className="bg-white border-2 border-gray-100 p-8 mb-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex-1 w-full space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00426B] mb-4 flex items-center gap-3">
                <div className="w-8 h-1 bg-[#0775AB]"></div>
                Cerca i Filtres
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="CERCA PER TALLER O CENTRE..."
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4197CB] text-[11px] font-bold uppercase tracking-widest text-[#00426B] transition-all outline-none"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-4 h-4 w-4 text-[#00426B]/40 group-focus-within:text-[#4197CB] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4197CB] text-[11px] font-bold uppercase tracking-widest text-[#00426B] transition-all outline-none appearance-none"
                >
                  <option value="Tots els estats">Tots els estats</option>
                  <option value="IN_PROGRESS">En curs / Acceptats</option>
                  <option value="COMPLETED">Finalitzats</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter("Tots els estats"); }}
              className="px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#00426B] hover:bg-[#EAEFF2] transition-all border-2 border-[#00426B]"
            >
              Netejar
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Taller Assignat</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Referent</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Més Info</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignacions.map(a => (
                  <tr key={a.id_assignacio} className="bg-white hover:bg-gray-50 transition-colors border-b-2 border-gray-50">
                    <td className="px-10 py-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#4197CB] mb-2">IDENTIFICADOR TALLER</span>
                        <span className="text-base font-extrabold text-[#00426B] uppercase tracking-tight leading-tight">{a.taller?.titol}</span>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <span className="text-[11px] font-bold text-[#00426B] uppercase">{a.centre?.nom || 'No assignat'}</span>
                    </td>
                    <td className="px-10 py-10">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Inici: {a.data_inici ? new Date(a.data_inici).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <button
                        onClick={() => router.push(`/centro/assignacions/${a.id_assignacio}`)}
                        className="btn-primary py-2 px-6 text-[10px]"
                      >
                        Gestionar
                      </button>
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
                  toast.success('Incidència reportada. El CEB la revisarà properament.');
                }}
                className="px-8 py-4 bg-[#F26178] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#D94E64] transition-all"
              >
                Reportar Incidència
              </button>
            </div>
          </section>
        )}
      </div>
      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        isDestructive={confirmConfig.isDestructive}
      />
    </DashboardLayout>
  );
}
