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
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModalitat, setSelectedModalitat] = useState("Totes les modalitats");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
                modalitat: a.taller?.modalitat,
                referent1: a.prof1?.usuari?.nom_complet,
                referent2: a.prof2?.usuari?.nom_complet
              });
            });
          } else if (a.estat !== 'PUBLISHED' && a.estat !== 'CANCELLED') {
              // Si no tiene sesiones pero está en una fase donde debería tenerlas pronto
              // Lo añadimos como un item "placeholder" para que el usuario sepa que está ahí
              flatSessions.push({
                  id_sessio: `pending-${a.id_assignacio}`,
                  isPending: true,
                  assignmentTitle: a.taller?.titol,
                  assignacioId: a.id_assignacio,
                  modalitat: a.taller?.modalitat,
                  referent1: a.prof1?.usuari?.nom_complet,
                  referent2: a.prof2?.usuari?.nom_complet,
                  data_sessio: new Date().toISOString(), // Use current date just for sorting
                  estat: a.estat
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

  // Filtering Logic
  const filteredSessions = (sessions || []).filter(s => {
    const matchesSearch = s.assignmentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModalitat = selectedModalitat === "Totes les modalitats" || s.modalitat === selectedModalitat;
    return matchesSearch && matchesModalitat;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedModalitat]);

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
      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8 shadow-sm">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Cerca taller</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ex: Robòtica, Cinema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Modalitat Filter */}
        <div className="lg:w-64">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Filtrar per modalitat</label>
          <select 
            value={selectedModalitat}
            onChange={(e) => setSelectedModalitat(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
          >
            <option value="Totes les modalitats">Totes les modalitats</option>
            <option value="A">Modalitat A</option>
            <option value="B">Modalitat B</option>
            <option value="C">Modalitat C</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#00426B] text-white px-8 py-[13px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all flex items-center gap-3 shadow-lg h-[46px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Assignar Professors
          </button>
        </div>
      </div>

      {/* Flat List */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {paginatedSessions.length === 0 ? (
          <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">
            No s'han trobat sessions amb aquests filtres.
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {paginatedSessions.map((sessio) => {
              const dateObj = new Date(sessio.data_sessio);
              const dayName = dateObj.toLocaleDateString('ca-ES', { weekday: 'long' });
              const dateStr = dateObj.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long' });
              const staffNames = sessio.staff?.map((s: any) => s.usuari?.nom_complet).join(', ');

              return (
                <div key={sessio.id_sessio} className={`p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors group ${sessio.isPending ? 'opacity-70 bg-gray-50/50' : ''}`}>
                  <div className="flex items-start gap-4 mb-2 md:mb-0">
                    <div className={`p-3 rounded-full shrink-0 ${sessio.isPending ? 'bg-gray-200 text-gray-400' : sessio.modalitat === 'A' ? 'bg-blue-50 text-[#00426B]' : 'bg-orange-50 text-orange-600'}`}>
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sessio.isPending ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                       </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#00426B] uppercase tracking-tight leading-none mb-2">
                        {sessio.assignmentTitle}
                        {!sessio.isPending && (
                          <span className="ml-2 text-[9px] font-normal text-gray-400 normal-case tracking-normal border border-gray-200 px-1.5 py-0.5 rounded">
                            {sessio.hora_inici || '09:00'} - {sessio.hora_fi || '11:00'}
                          </span>
                        )}
                      </h4>
                      <p className="text-sm font-medium text-gray-600">
                        {sessio.isPending ? (
                          <span className="text-orange-500 font-bold uppercase text-[10px] tracking-widest">Pendent de confirmació final</span>
                        ) : (
                          <><span className="capitalize font-bold">{dayName}</span>, {dateStr}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Staff & Referents Display */}
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:text-right pl-14 md:pl-0">
                    {/* Referents */}
                    <div>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                        Referents Centre
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#00426B] uppercase leading-tight">
                          {sessio.referent1}
                        </span>
                        <span className="text-[10px] font-bold text-[#00426B] uppercase leading-tight">
                          {sessio.referent2}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Staff */}
                    <div className="md:min-w-[150px]">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                        Docents Assignats
                      </span>
                      {sessio.isPending ? (
                        <span className="text-[10px] italic text-gray-400">
                          Confirmació requerida
                        </span>
                      ) : staffNames ? (
                        <span className="text-xs font-black text-[#4197CB] uppercase">
                          {staffNames}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 uppercase">
                          Sense professor assignat
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="bg-[#F8FAFC] border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Mostrant <span className="text-[#00426B]">{paginatedSessions.length}</span> de <span className="text-[#00426B]">{filteredSessions.length}</span> sessions
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentPage === 1 
                      ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                      : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                  >
                    Anterior
                  </button>
                  <div className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-bold text-[#00426B] tracking-[0.2em]">
                    Pàgina {currentPage} de {totalPages}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentPage === totalPages 
                      ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                      : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                  >
                    Següent
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Assignment */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tight">Assignar Professor</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Selecciona el mode i el docent per a la sessió.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-300 hover:text-[#00426B] transition-colors"
                aria-label="Tancar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Mode Selection */}
              <div className="flex bg-[#F1F5F9] p-1.5 rounded-lg border border-gray-100 shadow-inner">
                <button 
                  onClick={() => { setMode('single'); setSelectedSessioId(""); }}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${
                    mode === 'single' ? 'bg-white text-[#00426B] shadow-lg ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Día Específic
                </button>
                <button 
                  onClick={() => { setMode('whole'); setSelectedSessioId(""); }}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${
                    mode === 'whole' ? 'bg-white text-[#00426B] shadow-lg ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Taller Complet
                </button>
              </div>

              {/* Taller Select */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">
                    Selecciona Taller
                  </label>
                  <select 
                    value={selectedAssignacioId}
                    onChange={(e) => { setSelectedAssignacioId(e.target.value); setSelectedSessioId(""); }}
                    className="w-full bg-[#F8FAFC] border border-gray-100 text-sm p-3 font-bold text-[#00426B] focus:border-[#0775AB] outline-none appearance-none"
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
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">
                      Selecciona Dia
                    </label>
                    <select 
                      value={selectedSessioId}
                      onChange={(e) => setSelectedSessioId(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-100 text-sm p-3 font-bold text-[#00426B] focus:border-[#0775AB] outline-none appearance-none"
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
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">
                    Selecciona Professor
                  </label>
                  <select 
                    value={selectedProfessorId}
                    onChange={(e) => setSelectedProfessorId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-100 text-sm p-3 font-bold text-[#00426B] focus:border-[#0775AB] outline-none appearance-none"
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
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
               <button 
                 onClick={() => setShowModal(false)}
                 className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
               >
                 Cancel·lar
               </button>
               <button 
                 onClick={handleAssign}
                 className="flex-1 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all shadow-xl active:scale-95"
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
