'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

type AssignmentMode = 'single' | 'whole';

export default function SessionsListPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignacions, setAssignacions] = useState<any[]>([]); // For the dropdown
  const [allProfessors, setAllProfessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<AssignmentMode>('single');
  const [selectedAssignacioId, setSelectedAssignacioId] = useState<string>("");
  const [selectedSessioId, setSelectedSessioId] = useState<string>("");
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'COORDINADOR')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    if (user && user.centre?.id_centre) {
      try {
        const api = getApi();
        const [resAssig, resProfs] = await Promise.all([
          api.get(`/assignacions/centre/${user.centre.id_centre}`),
          api.get('/professors')
        ]);
        
        const rawAssignacions = resAssig.data;
        setAssignacions(rawAssignacions);
        setAllProfessors(resProfs.data || []);

        // Flatten sessions
        const flatSessions: any[] = [];
        rawAssignacions.forEach((a: any) => {
          if (a.sessions && a.sessions.length > 0) {
            a.sessions.forEach((s: any) => {
              flatSessions.push({
                ...s,
                assignmentTitle: a.taller?.titol,
                assignacioId: a.id_assignacio,
                modalitat: a.taller?.modalitat
              });
            });
          }
        });

        // Sort by date
        flatSessions.sort((a, b) => new Date(a.data_sessio).getTime() - new Date(b.data_sessio).getTime());
        setSessions(flatSessions);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAssign = async () => {
    if (!selectedAssignacioId || !selectedProfessorId) {
      toast.error('Selecciona taller i professor');
      return;
    }
    if (mode === 'single' && !selectedSessioId) {
      toast.error('Selecciona una sessió');
      return;
    }

    try {
      const api = getApi();
      
      if (mode === 'whole') {
        // Assign to the whole assignment (teaching staff)
        await api.post(`/assignacions/${selectedAssignacioId}/staff`, { 
          idUsuari: parseInt(selectedProfessorId) 
        });
        
        // OPTIONAL: Also add to all existing sessions individually if the backend logic requires it 
        // asking the user "Assign to all sessions?" might be better but for now let's stick to the prompt.
        // The prompt says "un profesor para un taller completo".
        // In our robust model, we might want to ensure they are on the sessions too.
        // For now, let's assume adding to the assignment staff is what's requested, 
        // BUT if the calendar view relies on session.staff, we might need to loop.
        // Let's loop to be safe and ensure they appear on the calendar for all days.
        const targetAssignacio = assignacions.find(a => a.id_assignacio === parseInt(selectedAssignacioId));
        if (targetAssignacio?.sessions) {
           await Promise.all(targetAssignacio.sessions.map((s: any) => 
               api.post(`/assignacions/sessions/${s.id_sessio}/staff`, { idUsuari: parseInt(selectedProfessorId) })
                 .catch(() => {}) // Ignore duplicates
           ));
        }

        toast.success('Professor assignat al taller complet');
      } else {
        // Single session
        await api.post(`/assignacions/sessions/${selectedSessioId}/staff`, { 
          idUsuari: parseInt(selectedProfessorId) 
        });
        toast.success('Professor assignat al dia seleccionat');
      }

      setShowModal(false);
      fetchData(); // Refresh list to show new staff
      
      // Reset form
      setSelectedSessioId("");
      setSelectedProfessorId("");
      
    } catch (error) {
      toast.error('Error al realitzar l\'assignació');
    }
  };

  const selectedAssignacio = assignacions.find(a => a.id_assignacio.toString() === selectedAssignacioId);

  if (authLoading || loading) return <Loading fullScreen message="Carregant sessions..." />;

  return (
    <DashboardLayout 
      title="Gestió de Sessions" 
      subtitle="Visualitza i gestiona les sessions formatives."
    >
      {/* Top Action Bar */}
      <div className="mb-8 flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#00426B] text-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all flex items-center gap-3 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Assignar Professors
        </button>
      </div>

      {/* Flat List */}
      <div className="bg-white border border-gray-200 shadow-sm">
        {sessions.length === 0 ? (
          <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            No hi ha sessions programades.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((sessio) => {
              const dateObj = new Date(sessio.data_sessio);
              const dayName = dateObj.toLocaleDateString('ca-ES', { weekday: 'long' });
              const dateStr = dateObj.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long' });
              const staffNames = sessio.staff?.map((s: any) => s.usuari?.nom_complet).join(', ');

              return (
                <div key={sessio.id_sessio} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-start gap-4 mb-2 md:mb-0">
                    <div className={`p-3 rounded-full shrink-0 ${sessio.modalitat === 'A' ? 'bg-blue-50 text-[#00426B]' : 'bg-orange-50 text-orange-600'}`}>
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#00426B] uppercase tracking-tight leading-none mb-2">
                        {sessio.assignmentTitle}
                        <span className="ml-2 text-[9px] font-normal text-gray-400 normal-case tracking-normal border border-gray-200 px-1.5 py-0.5 rounded">
                          {sessio.hora_inici || '09:00'} - {sessio.hora_fi || '11:00'}
                        </span>
                      </h4>
                      <p className="text-sm font-medium text-gray-600">
                        <span className="capitalize font-bold">{dayName}</span>, {dateStr}
                      </p>
                    </div>
                  </div>
                  
                  {/* Staff Display */}
                  <div className="md:text-right pl-14 md:pl-0">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                      Equip Docent
                    </span>
                    {staffNames ? (
                      <span className="text-xs font-bold text-[#4197CB] uppercase">
                        {staffNames}
                      </span>
                    ) : (
                      <span className="text-[10px] italic text-gray-400">
                        Sense asignar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Assignment */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#00426B] p-6 text-white">
              <h3 className="text-lg font-black uppercase tracking-tight">Assignar Professor</h3>
              <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">Selecciona el mode d'assignació.</p>
            </div>

            <div className="p-8 flex flex-col gap-6">
              
              {/* Mode Selection */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => { setMode('single'); setSelectedSessioId(""); }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${
                    mode === 'single' ? 'bg-white text-[#00426B] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Día Específic
                </button>
                <button 
                  onClick={() => { setMode('whole'); setSelectedSessioId(""); }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${
                    mode === 'whole' ? 'bg-white text-[#00426B] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Taller Complet
                </button>
              </div>

              {/* Taller Select */}
              <div>
                <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                  Selecciona Taller
                </label>
                <select 
                  value={selectedAssignacioId}
                  onChange={(e) => { setSelectedAssignacioId(e.target.value); setSelectedSessioId(""); }}
                  className="w-full bg-gray-50 border border-gray-200 text-sm p-3 font-medium focus:ring-1 focus:ring-[#00426B] outline-none"
                >
                  <option value="">-- Tria un taller --</option>
                  {assignacions.map(a => (
                    <option key={a.id_assignacio} value={a.id_assignacio}>
                      {a.taller?.titol} (Ref: {a.id_assignacio})
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Select (Only Single Mode) */}
              {mode === 'single' && selectedAssignacioId && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                    Selecciona Dia
                  </label>
                  <select 
                    value={selectedSessioId}
                    onChange={(e) => setSelectedSessioId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-sm p-3 font-medium focus:ring-1 focus:ring-[#00426B] outline-none"
                  >
                    <option value="">-- Tria una sessió --</option>
                    {selectedAssignacio?.sessions?.map((s: any, idx: number) => (
                      <option key={s.id_sessio} value={s.id_sessio}>
                         Sessió {idx + 1} - {new Date(s.data_sessio).toLocaleDateString()} ({s.hora_inici}-{s.hora_fi})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Professor Select */}
              <div>
                <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                  Selecciona Professor
                </label>
                <select 
                  value={selectedProfessorId}
                  onChange={(e) => setSelectedProfessorId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm p-3 font-medium focus:ring-1 focus:ring-[#00426B] outline-none"
                >
                  <option value="">-- Tria un docent --</option>
                  {allProfessors.map(p => (
                    <option key={p.id_usuari} value={p.id_usuari}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
               <button 
                 onClick={() => setShowModal(false)}
                 className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-colors"
               >
                 Cancel·lar
               </button>
               <button 
                 onClick={handleAssign}
                 className="bg-[#00426B] text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-colors shadow-lg"
               >
                 Guardar Assignació
               </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
