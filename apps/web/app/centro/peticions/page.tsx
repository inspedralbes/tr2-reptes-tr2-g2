'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import tallerService, { Taller } from '@/services/tallerService';
import peticioService from '@/services/peticioService';
import professorService, { Professor } from '@/services/professorService';

export default function PeticionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tallers, setTallers] = useState<Taller[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [requestedWorkshopIds, setRequestedWorkshopIds] = useState<number[]>([]);
  
  const [selectedTallerId, setSelectedTallerId] = useState<string | null>(null);
  const [alumnesCount, setAlumnesCount] = useState<number | ''>('');
  const [prof1_id, setProf1Id] = useState<string>('');
  const [prof2_id, setProf2Id] = useState<string>('');
  const [comentaris, setComentaris] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'COORDINADOR')) {
      router.push('/login');
      return;
    }

    if (user) {
      const loadInitialData = async () => {
        try {
          const [fetchedTallers, fetchedProfs, fetchedPeticions] = await Promise.all([
            tallerService.getAll(),
            professorService.getAll(),
            peticioService.getAll()
          ]);
          setTallers(fetchedTallers);
          setProfessors(fetchedProfs);
          // @ts-ignore - id_taller property might not be in the type but exists in the API response
          setRequestedWorkshopIds(fetchedPeticions.map(p => p.id_taller));
        } catch (err) {
          console.error(err);
          setError('No se pudieron cargar los datos necesarios.');
        } finally {
          setLoading(false);
        }
      };
      loadInitialData();
    }
  }, [user, authLoading, router]);

  const filteredTallers = useMemo(() => {
    let result = tallers;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.titol.toLowerCase().includes(query) || 
        t.sector.toLowerCase().includes(query)
      );
    }
    return result;
  }, [tallers, searchQuery]);

  const selectedTaller = tallers.find(t => t._id === selectedTallerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTallerId || !selectedTaller) return;
    
    setSubmitting(true);
    setError(null);

    if (selectedTaller.modalitat === 'C' && alumnesCount !== '' && alumnesCount > 4) {
      setError('En la Modalitat C, el número màxim d\'alumnes és 4.');
      setSubmitting(false);
      return;
    }

    try {
      await peticioService.create({
        id_taller: parseInt(selectedTallerId),
        alumnes_aprox: Number(alumnesCount),
        comentaris,
        prof1_id: prof1_id ? parseInt(prof1_id) : undefined,
        prof2_id: prof2_id ? parseInt(prof2_id) : undefined,
        modalitat: selectedTaller.modalitat
      });
      router.push('/centro');
    } catch (err: any) {
      setError(err.message || 'Error en enviar la sol·licitud.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin h-8 w-8 border-2 border-t-transparent mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Sol·licitar Tallers" 
      subtitle="Gestiona les peticions de tallers per al teu centre educatiu"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section: Catalog */}
        <div className="flex-1 space-y-6">
          {/* Filter Bar */}
          <div className="bg-white border border-gray-200 p-4 rounded-none shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00426B] transition-colors"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                placeholder="Cercar taller o sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] focus:ring-1 focus:ring-[#00426B] text-sm transition-all"
              />
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              {filteredTallers.length} Tallers disponibles
            </div>
          </div>

          {/* Workshop Table */}
          <div className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider w-12 text-center">Mod</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider">Taller / Sector</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#00426B] uppercase tracking-wider text-right">Estat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-t-transparent border-[#00426B] mx-auto mb-2"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregant catàleg...</span>
                    </td>
                  </tr>
                ) : filteredTallers.length > 0 ? (
                  filteredTallers.map((taller) => {
                    const isRequested = requestedWorkshopIds.includes(parseInt(taller._id));
                    const isSelected = selectedTallerId === taller._id;

                    return (
                      <tr 
                        key={taller._id}
                        onClick={() => !isRequested && setSelectedTallerId(isSelected ? null : taller._id)}
                        className={`group transition-colors ${
                          isRequested 
                          ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                          : isSelected 
                          ? 'bg-blue-50/50 cursor-pointer border-l-4 border-l-[#00426B]' 
                          : 'hover:bg-gray-50 cursor-pointer border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs ${
                            taller.modalitat === 'A' ? 'bg-green-100 text-green-700' :
                            taller.modalitat === 'B' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {taller.modalitat}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 text-sm group-hover:text-[#00426B] transition-colors">{taller.titol}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{taller.sector}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isRequested ? (
                            <span className="text-[10px] font-black border border-gray-300 px-2 py-1 text-gray-400 uppercase tracking-widest">Sol·licitat</span>
                          ) : isSelected ? (
                            <span className="text-[10px] font-black border border-[#00426B] px-2 py-1 text-[#00426B] uppercase tracking-widest bg-blue-50">Seleccionat</span>
                          ) : (
                            <span className="text-[10px] font-black border border-transparent group-hover:border-gray-300 px-2 py-1 text-gray-300 uppercase tracking-widest transition-all group-hover:text-gray-400">Seleccionar</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No s'han trobat tallers</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Form Sidebar */}
        <div className="w-full lg:w-96">
          <div className="bg-white border border-gray-200 rounded-none shadow-sm sticky top-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-black text-[#00426B] uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Nova Sol·licitud
              </h3>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-1 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Error en la sol·licitud
                  </p>
                  <p className="text-xs">{error}</p>
                </div>
              )}

              {!selectedTaller ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 bg-gray-50/30">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-6">
                    Selecciona un taller de la llista per començar
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selected Taller Info */}
                  <div className="bg-[#00426B] p-4 rounded-none text-white shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 tracking-tighter uppercase">MOD {selectedTaller.modalitat}</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedTallerId(null)}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <h4 className="font-bold text-sm leading-tight">{selectedTaller.titol}</h4>
                    <p className="text-[10px] font-bold text-white/60 uppercase mt-1">{selectedTaller.sector}</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Professorat Referent</label>
                      <div className="space-y-2">
                        <select 
                          value={prof1_id}
                          onChange={(e) => setProf1Id(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                          required
                        >
                          <option value="">Referent Principal</option>
                          {professors.map(p => (
                            <option key={p.id_professor} value={p.id_professor}>{p.nom}</option>
                          ))}
                        </select>
                        <select 
                          value={prof2_id}
                          onChange={(e) => setProf2Id(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                        >
                          <option value="">Segon Referent (Opcional)</option>
                          {professors.map(p => (
                            <option key={p.id_professor} value={p.id_professor}>{p.nom}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nº Alumnat Previst</label>
                      <input 
                        type="number"
                        value={alumnesCount}
                        onChange={(e) => setAlumnesCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder="Ex: 4"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700"
                        min="1"
                        max={selectedTaller.modalitat === 'C' ? 4 : 100}
                        required
                      />
                      {selectedTaller.modalitat === 'C' && (
                        <p className="mt-1.5 text-[9px] text-orange-600 font-bold italic bg-orange-50 p-1.5 border border-orange-100">
                          * Màxim 4 alumnes per projecte en Modalitat C.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Motiu de la Sol·licitud</label>
                      <textarea 
                        value={comentaris}
                        onChange={(e) => setComentaris(e.target.value)}
                        placeholder="Breu explicació del perfil de l'alumnat..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-[#00426B] text-sm font-bold text-gray-700 min-h-[80px] resize-none"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-4 rounded-none font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      submitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#00426B] text-white hover:bg-[#0775AB] shadow-md hover:shadow-lg active:translate-y-0.5'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white/20 border-t-white"></div>
                        <span>Processant...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Enviar Sol·licitud</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}