'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import DocumentUpload from '@/components/DocumentUpload';
import Avatar from '@/components/Avatar';

type ViewMode = 'workshop' | 'selection';

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignacio, setAssignacio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allAlumnes, setAllAlumnes] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('workshop');
  
  // Selection view states
  const [searchAlumne, setSearchAlumne] = useState("");
  const [filterCurs, setFilterCurs] = useState("Tots els cursos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.rol.nom_rol !== 'COORDINADOR') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        const api = getApi();
        const [resAssig, resAlumnes] = await Promise.all([
          api.get(`/assignacions/${id}`),
          api.get('/alumnes')
        ]);
        
        setAssignacio(resAssig.data);
        setAllAlumnes(resAlumnes.data || []);
      } catch (error) {
        toast.error('Error al carregar les dades.');
        router.push('/centro/assignacions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleAddStudent = async (idAlumne: number) => {
    try {
      const api = getApi();
      const currentIds = assignacio.inscripcions.map((i: any) => i.id_alumne);
      if (currentIds.includes(idAlumne)) {
        toast.warning("Aquest alumne ja està inscrit.");
        return;
      }

      const plazasMax = assignacio?.peticio?.alumnes_aprox || assignacio?.taller?.places_maximes || 20;
      if (currentIds.length >= plazasMax) {
        toast.error(`S'ha assolit el límit de ${plazasMax} places.`);
        return;
      }

      await api.post(`/assignacions/${id}/inscripcions`, { 
        ids_alumnes: [...currentIds, idAlumne] 
      });
      
      const res = await api.get(`/assignacions/${id}`);
      setAssignacio(res.data);
      toast.success('Alumne afegit correctament.');
    } catch (error) {
      toast.error('Error al afegir l\'alumne.');
    }
  };

  const handleRemoveStudent = async (idAlumne: number) => {
    try {
      const api = getApi();
      const currentIds = assignacio.inscripcions.map((i: any) => i.id_alumne);
      await api.post(`/assignacions/${id}/inscripcions`, { 
        ids_alumnes: currentIds.filter((id: number) => id !== idAlumne) 
      });
      
      const res = await api.get(`/assignacions/${id}`);
      setAssignacio(res.data);
      toast.success('Alumne eliminat correctament.');
    } catch (error) {
      toast.error('Error al eliminar l\'alumne.');
    }
  };

  const getStatusLabel = (estat: string) => {
    const maps: Record<string, string> = {
      'DATA_ENTRY_PENDING': 'PENDENT DE GESTIÓ',
      'PROVISIONAL': 'PROVISIONAL',
      'VALIDATED': 'CONFIRMAT',
      'EN_CURS': 'EN EXECUCIÓ',
      'FINALITZADA': 'FINALITZAT'
    };
    return maps[estat] || estat.replace('_', ' ');
  };

  if (loading || !assignacio) return <Loading fullScreen message="Carregant detalls..." />;

  const filteredAlumnes = allAlumnes.filter(a => {
    const matchesSearch = a.nom.toLowerCase().includes(searchAlumne.toLowerCase()) || 
                          a.cognoms.toLowerCase().includes(searchAlumne.toLowerCase()) ||
                          a.idalu.toLowerCase().includes(searchAlumne.toLowerCase());
    const matchesCurs = filterCurs === "Tots els cursos" || a.curs === filterCurs;
    return matchesSearch && matchesCurs;
  });

  const totalPages = Math.ceil(filteredAlumnes.length / itemsPerPage);
  const paginatedAlumnes = filteredAlumnes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueCursos = Array.from(new Set(allAlumnes.map(a => a.curs))).filter(Boolean).sort();


  return (
    <DashboardLayout 
      title={`GESTIÓ TALLER: ${assignacio.taller?.titol}`} 
      subtitle={
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-2 border-gray-100 bg-white text-[#00426B]">
              {getStatusLabel(assignacio.estat)}
            </div>
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-[#00426B] text-white">
              MODALITAT {assignacio.taller?.modalitat}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-[#F8FAFC] border border-gray-200">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Equip Docent Referent</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#00426B] uppercase">{assignacio.prof1?.nom}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-black text-[#00426B] uppercase">{assignacio.prof2?.nom}</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Centre Educatiu</span>
              <span className="text-xs font-black text-[#00426B] uppercase">{assignacio.centre?.nom}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-20">
        {/* SECCIÓ: ALUMNAT PARTICIPANT */}
        <section className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-[#F8FAFC] to-white">
            <div>
              <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tighter">Alumnat Participant</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {assignacio.inscripcions?.length || 0} de {assignacio?.peticio?.alumnes_aprox || assignacio?.taller?.places_maximes || 20} places ocupades.
              </p>
            </div>
            <button 
              onClick={() => setViewMode('selection')}
              className="bg-[#00426B] text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] transition-all flex items-center gap-3 shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Afegir Alumne
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {assignacio.inscripcions?.map((ins: any) => (
              <div key={ins.id_inscripcio} className="p-8 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                  {/* Info Alumne */}
                  <div className="flex items-center gap-6 min-w-[280px]">
                    <Avatar 
                      url={ins.alumne.url_foto} 
                      name={`${ins.alumne.nom} ${ins.alumne.cognoms}`} 
                      id={ins.alumne.id_alumne} 
                      type="alumne" 
                      size="lg"
                      className="shadow-md"
                    />
                    <div>
                      <p className="text-base font-black text-[#00426B] uppercase tracking-tight leading-none">
                        {ins.alumne.nom} {ins.alumne.cognoms}
                      </p>
                      <p className="text-[10px] font-bold text-[#4197CB] uppercase tracking-widest mt-2 bg-blue-50 px-2 py-0.5 inline-block border border-blue-100">
                        {ins.alumne.curs} • {ins.alumne.idalu}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <DocumentUpload 
                      idAssignacio={parseInt(id)}
                      idInscripcio={ins.id_inscripcio}
                      documentType="acord_pedagogic"
                      initialUrl={ins.url_acord_pedagogic}
                      label="Acord Pedagògic"
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      idAssignacio={parseInt(id)}
                      idInscripcio={ins.id_inscripcio}
                      documentType="autoritzacio_mobilitat"
                      initialUrl={ins.url_autoritzacio_mobilitat}
                      label="Aut. Mobilitat"
                      onUploadSuccess={() => {}}
                    />
                    <DocumentUpload 
                      idAssignacio={parseInt(id)}
                      idInscripcio={ins.id_inscripcio}
                      documentType="drets_imatge"
                      initialUrl={ins.url_drets_imatge}
                      label="Drets d'Imatge"
                      onUploadSuccess={() => {}}
                    />
                  </div>

                  {/* Accions */}
                  <div className="shrink-0">
                    <button 
                      onClick={() => handleRemoveStudent(ins.id_alumne)}
                      className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                      title="Eliminar alumne"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(!assignacio.inscripcions || assignacio.inscripcions.length === 0) && (
              <div className="p-20 text-center bg-white">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">No hi ha alumnes assignats encara</p>
                <button 
                  onClick={() => setViewMode('selection')}
                  className="text-[#4197CB] font-black text-[10px] uppercase tracking-widest hover:text-[#00426B] transition-colors"
                >
                  Fes clic aquí per començar el registre nominal
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL: SELECCIÓ D'ALUMNAT */}
      {viewMode === 'selection' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blurred */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setViewMode('workshop')}
          ></div>
          
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 bg-[#F8FAFC] flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tighter">Afegir Alumne al Taller</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cerca l'alumnat del teu centre per incloure'l a {assignacio.taller?.titol}.</p>
              </div>
              <button 
                onClick={() => setViewMode('workshop')}
                className="p-2 text-gray-300 hover:text-[#00426B] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Panell de Filtres */}
              <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-[#F8FAFC] border border-gray-100 p-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-2">Cerca per nom o IDALU</label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ex: Joan García, 1234567..."
                      value={searchAlumne}
                      onChange={(e) => { setSearchAlumne(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="lg:w-48">
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-2">Filtra per curs</label>
                  <select 
                    value={filterCurs}
                    onChange={(e) => { setFilterCurs(e.target.value); setCurrentPage(1); }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
                  >
                    <option value="Tots els cursos">Tots els cursos</option>
                    {uniqueCursos.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={() => { setSearchAlumne(""); setFilterCurs("Tots els cursos"); setCurrentPage(1); }}
                    className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    Netejar
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Informació de l'Alumne</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">IDALU</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Curs</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-right">Accions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedAlumnes.map(a => {
                        const isAlreadyAdded = assignacio.inscripcions?.some((i: any) => i.id_alumne === a.id_alumne);
                        return (
                          <tr key={a.id_alumne} className={`hover:bg-[#F8FAFC] transition-colors group ${isAlreadyAdded ? 'bg-green-50/10' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar 
                                  url={a.url_foto} 
                                  name={`${a.nom} ${a.cognoms}`} 
                                  id={a.id_alumne} 
                                  type="alumne" 
                                  size="sm"
                                  className={isAlreadyAdded ? 'ring-2 ring-green-500' : ''}
                                />
                                <div className="text-xs font-black text-[#00426B] uppercase tracking-tight">{a.nom} {a.cognoms}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-[9px] text-gray-400">{a.idalu}</td>
                            <td className="px-6 py-4">
                              <span className="text-[9px] font-black text-[#00426B] uppercase">{a.curs}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end items-center gap-2">
                                {isAlreadyAdded ? (
                                  <>
                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mr-2">Participa</span>
                                    <button 
                                      onClick={() => handleRemoveStudent(a.id_alumne)}
                                      className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all"
                                      title="Treure alumne"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => handleAddStudent(a.id_alumne)}
                                    className="px-4 py-1.5 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                  >
                                    Afegir
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredAlumnes.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-[#00426B] font-black uppercase text-[10px] tracking-widest">No s'han trobat alumnes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Pagination */}
            <div className="p-6 border-t border-gray-100 bg-[#F8FAFC]/50 flex justify-between items-center">
              <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                {paginatedAlumnes.length} de {filteredAlumnes.length} alumnes
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 text-[9px] font-black uppercase border border-gray-200 text-[#00426B] disabled:opacity-20"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 text-[9px] font-black uppercase border border-gray-200 text-[#00426B] disabled:opacity-20"
                >
                  Següent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
