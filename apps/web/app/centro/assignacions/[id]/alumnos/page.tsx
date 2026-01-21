'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';

export default function NominalRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignacio, setAssignacio] = useState<any>(null);
  const [alumnes, setAlumnes] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Searching state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurs, setSelectedCurs] = useState("Tots els cursos");
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

        // Fetch phases first for gating
        const resFases = await api.get("/fases");
        const phasesData = resFases.data.data;
        const isPlanificacio = phasesData.find((f: any) => f.nom === PHASES.PLANIFICACION)?.activa;

        if (!isPlanificacio) {
          alert('El període de registre nominal no està actiu.');
          router.push('/centro/assignacions');
          return;
        }

        // Fetch assignment with inscriptions
        const resAssig = await api.get(`/assignacions/centre/${currentUser.id_centre}`);
        const found = resAssig.data.find((a: any) => a.id_assignacio === parseInt(id));

        if (!found) {
          alert('Assignació no trobada o no autoritzada.');
          router.push('/centro/assignacions');
          return;
        }
        setAssignacio(found);

        // Pre-populate selectedIds from existing inscriptions
        if (found.inscripcions) {
          setSelectedIds(found.inscripcions.map((i: any) => i.id_alumne));
        }

        // Fetch all students from center (controller handles scoping)
        const resAlumnes = await api.get('/alumnes');
        setAlumnes(resAlumnes.data || []);
      } catch (error) {
        console.error("Error fetching nominal register data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const toggleAlumne = (idAlumne: number) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(idAlumne);
      const plazasMax = assignacio?.peticio?.alumnes_aprox || 0;

      if (!isSelected && prev.length >= plazasMax) {
        alert(`Has arribat al límit de ${plazasMax} places sol·licitades.`);
        return prev;
      }

      return isSelected
        ? prev.filter(i => i !== idAlumne)
        : [...prev, idAlumne];
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const plazasMax = assignacio?.peticio?.alumnes_aprox || 0;
      const available = plazasMax - selectedIds.length;
      
      if (available <= 0) {
        alert(`Has arribat al límit de ${plazasMax} places sol·licitades.`);
        return;
      }

      const toAdd: number[] = [];
      let count = 0;
      
      for (const alum of filteredAlumnes) {
        if (!selectedIds.includes(alum.id_alumne)) {
          toAdd.push(alum.id_alumne);
          count++;
          if (count >= available) break;
        }
      }
      
      setSelectedIds(prev => [...prev, ...toAdd]);
    } else {
      // Unselect all in CURRENT filtered view
      const filteredIds = filteredAlumnes.map(a => a.id_alumne);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const api = getApi();
      await api.post(`/assignacions/${id}/inscripcions`, { ids_alumnes: selectedIds });
      alert('Registre Nominal desat amb èxit.');
      router.push('/centro/assignacions');
    } catch (error) {
      alert('Error al desar el registre nominal.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumnes = alumnes.filter(a => {
    const matchesSearch = !searchQuery || 
      a.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cognoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.idalu.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCurs = selectedCurs === "Tots els cursos" || a.curs === selectedCurs;
    
    return matchesSearch && matchesCurs;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCurs]);

  const totalPages = Math.ceil(filteredAlumnes.length / itemsPerPage);
  const paginatedAlumnes = filteredAlumnes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueCursos = Array.from(new Set(alumnes.map(a => a.curs))).filter(Boolean).sort();

  if (loading && !assignacio) return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="animate-spin h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );

  const plazasAsignadas = assignacio?.peticio?.alumnes_aprox || 0;
  const isFull = selectedIds.length === plazasAsignadas;

  const headerActions = (
    <button
      onClick={() => router.push('/centro/alumnos')}
      className="bg-[#00426B] hover:bg-[#0775AB] text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Crear Alumne
    </button>
  );

  return (
    <DashboardLayout
      title={`Registre Nominal: ${assignacio.taller?.titol}`}
      subtitle={`En aquesta fase has de designar els ${plazasAsignadas} alumnes que participaran.`}
      actions={headerActions}
    >
      <div className="w-full pb-20">
        {/* Header de Status - Matching the structure but keeping it centered as logic cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Places Assignades</span>
            <span className="text-4xl font-black text-[#00426B]">{plazasAsignadas}</span>
          </div>
          <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Seleccionats</span>
            <span className={`text-4xl font-black ${isFull ? 'text-green-600' : 'text-[#0775AB]'}`}>{selectedIds.length}</span>
          </div>
          <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Restants</span>
            <span className="text-4xl font-black text-gray-200">{Math.max(0, plazasAsignadas - selectedIds.length)}</span>
          </div>
        </div>

        {/* Panell de Filtres - Matching Gestió de l'Alumnat */}
        <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Cerca per nom o IDALU</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ex: Joan García, 1234567..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="lg:w-64">
            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Filtra per curs</label>
            <select 
              value={selectedCurs}
              onChange={(e) => setSelectedCurs(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
            >
              <option value="Tots els cursos">Tots els cursos</option>
              {uniqueCursos.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCurs("Tots els cursos"); }}
              className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
            >
              Netejar
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200">
                  <th className="px-8 py-4 w-16">
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleSelectAll(selectedIds.length < (assignacio?.peticio?.alumnes_aprox || 0)); }}
                      className={`w-5 h-5 border-2 flex items-center justify-center cursor-pointer transition-all ${
                        selectedIds.length > 0 ? 'bg-[#00426B] border-[#00426B] text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      {selectedIds.length > 0 && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Alumne</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Identificació (IDALU)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Curs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAlumnes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <p className="text-[#00426B] font-black uppercase text-xs tracking-widest">No s'han trobat alumnes</p>
                    </td>
                  </tr>
                ) : (
                  paginatedAlumnes.map(alum => {
                    const isSelected = selectedIds.includes(alum.id_alumne);
                    return (
                      <tr 
                        key={alum.id_alumne} 
                        onClick={() => toggleAlumne(alum.id_alumne)}
                        className={`transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-8 py-5">
                          <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#00426B] border-[#00426B] text-white shadow-md' : 'bg-white border-gray-100'}`}>
                            {isSelected && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 flex items-center justify-center text-xs font-black transition-colors ${isSelected ? 'bg-[#00426B] text-white' : 'bg-[#EAEFF2] text-[#00426B]'}`}>
                              {alum.nom.charAt(0)}{alum.cognoms.charAt(0)}
                            </div>
                            <div className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-[#00426B]' : 'text-gray-700'}`}>
                              {alum.nom} {alum.cognoms}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase">{alum.idalu}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-2 py-0.5 bg-[#EAEFF2] text-[#00426B] text-[10px] font-black uppercase tracking-widest border border-[#EAEFF2]">
                            {alum.curs}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginació - Matching Gestió de l'Alumnat */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC]/50">
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Mostrant <span className="text-[#00426B]">{paginatedAlumnes.length}</span> de <span className="text-[#00426B]">{filteredAlumnes.length}</span> alumnes
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === 1 
                    ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                    : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                >
                  Anterior
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === totalPages 
                    ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                    : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                >
                  Següent
                </button>
              </div>
            </div>
          )}

          <div className="p-10 bg-gray-50 border-t flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={loading || selectedIds.length === 0}
              className={`flex-1 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${loading || selectedIds.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#00426B] text-white hover:bg-black active:scale-95'
                }`}
            >
              {loading ? 'Processant...' : 'Confirmar Registre Nominal'}
              {!loading && <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
            </button>
            <button
              onClick={() => router.back()}
              className="px-12 bg-white text-gray-400 py-5 font-black uppercase text-xs tracking-[0.2em] border border-gray-200 hover:bg-gray-100 transition-all"
            >
              Tornar
            </button>
          </div>
        </div>

        <div className="mt-8 p-8 bg-blue-50/30 border-l-4 border-[#00426B] text-[#00426B] text-[11px] font-bold flex gap-6 items-start">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="uppercase tracking-[0.2em] mb-2 font-black">Nota sobre el Registre Nominal</p>
            <p className="font-normal text-gray-600 leading-relaxed max-w-3xl">
              D'acord amb la normativa del Consorci, el registre nominal ha de coincidir amb el nombre de places sol·licitades. Un cop confirmat, aquest alumnat serà el que constarà a l'acta final i rebrà la certificació corresponent.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
