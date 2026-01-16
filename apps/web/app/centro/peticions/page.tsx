'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@enginy/shared';
import DashboardLayout from '@/components/DashboardLayout';
import tallerService, { Taller } from '@/services/tallerService';
import peticioService from '@/services/peticioService';

export default function PeticionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tallers, setTallers] = useState<Taller[]>([]);
  const [selectedTallerId, setSelectedTallerId] = useState<string | null>(null);
  const [alumnes, setAlumnes] = useState<number | ''>('');
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
          const fetchedTallers = await tallerService.getAll();
          setTallers(fetchedTallers);
        } catch (err) {
          console.error(err);
          setError('No se pudieron cargar los talleres disponibles.');
        } finally {
          setLoading(false);
        }
      };
      loadInitialData();
    }
  }, [user, authLoading, router]);

  const filteredTallers = useMemo(() => {
    if (!searchQuery) return tallers;
    const query = searchQuery.toLowerCase();
    return tallers.filter(t => 
      t.titol.toLowerCase().includes(query) || 
      t.sector.toLowerCase().includes(query)
    );
  }, [tallers, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTallerId) return;
    
    setSubmitting(true);
    setError(null);

    try {
      await peticioService.create({
        id_taller: parseInt(selectedTallerId),
        alumnes_aprox: alumnes === '' ? undefined : alumnes,
        comentaris
      });
      router.push('/centro');
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTaller = (id: string) => {
    setSelectedTallerId(prev => (prev === id ? null : id));
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  const selectedTaller = tallers.find(t => t._id === selectedTallerId);

  return (
    <DashboardLayout 
      title="Solicitar Talleres" 
      subtitle="Selecciona el taller que más se ajuste a las necesidades de tu centro para este curso."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Workshop Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Catálogo de Talleres</h3>
                <p className="text-sm text-gray-500">Haz clic en un taller para seleccionarlo</p>
              </div>
              <div className="relative max-w-xs w-full">
                <input 
                  type="text"
                  placeholder="Buscar taller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cargando catálogo...</p>
              </div>
            ) : filteredTallers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTallers.map((taller) => (
                  <div 
                    key={taller._id}
                    onClick={() => toggleTaller(taller._id)}
                    className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      selectedTallerId === taller._id 
                      ? 'border-blue-600 bg-blue-50/50 shadow-md' 
                      : 'border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    {selectedTallerId === taller._id && (
                      <div className="absolute top-3 right-3 text-blue-600 animate-in fade-in zoom-in duration-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <h4 className={`font-bold text-sm mb-1 transition-colors ${selectedTallerId === taller._id ? 'text-blue-700' : 'text-gray-800'}`}>
                      {taller.titol}
                    </h4>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider inline-block mb-3">
                      {taller.sector}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {taller.detalls_tecnics?.durada_hores}h
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {taller.detalls_tecnics?.places_maximes} p.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium">No se encontraron talleres con ese nombre.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Submission Form */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Detalles de Solicitud</h3>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Taller Seleccionado</label>
                {selectedTaller ? (
                  <div className="p-4 rounded-xl bg-blue-600 text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="font-bold text-sm leading-tight">{selectedTaller.titol}</h4>
                    <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-tight">{selectedTaller.sector}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border-2 border-dashed border-gray-100 text-center">
                    <p className="text-xs text-gray-400 italic">Por favor, selecciona un taller de la lista</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Alumnos Estimados</label>
                <input 
                  type="number"
                  value={alumnes}
                  onChange={(e) => setAlumnes(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Ej: 25"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                  min="1"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-2 italic px-1">Indica cuántos alumnos participarían aproximadamente.</p>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Observaciones</label>
                <textarea 
                  value={comentaris}
                  onChange={(e) => setComentaris(e.target.value)}
                  placeholder="Ej: Preferencia por el primer trimestre..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 min-h-[120px] resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={!selectedTallerId || submitting}
                className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                  !selectedTallerId || submitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-200 hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-b-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Enviar Solicitud</span>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}