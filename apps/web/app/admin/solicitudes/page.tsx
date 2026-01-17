'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import tallerService, { Taller } from '@/services/tallerService';
import peticioService, { Peticio } from '@/services/peticioService';

export default function AdminSolicitudesPage() {
  const { user, loading: authLoading } = useAuth();
  const [tallers, setTallers] = useState<Taller[]>([]);
  const [peticions, setPeticions] = useState<Peticio[]>([]);
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
          const [fetchedTallers, fetchedPeticions] = await Promise.all([
            tallerService.getAll(),
            peticioService.getAll()
          ]);
          setTallers(fetchedTallers);
          setPeticions(fetchedPeticions);
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
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Peticiones:</span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black">{peticions.length}</span>
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
                  <div className="h-10 w-1 bg-blue-600 rounded-full"></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{taller.titol}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                        {taller.sector}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        taller.modalitat === 'A' ? 'bg-green-100 text-green-700' :
                        taller.modalitat === 'B' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        Modalidad {taller.modalitat}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {requests.map(p => (
                    <div key={p.id_peticio} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-8 items-start hover:shadow-md transition-shadow">
                      {/* Center Info */}
                      <div className="min-w-[200px] w-full lg:w-1/4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Centro</label>
                        <h4 className="text-lg font-bold text-gray-800">{(p as any).centre?.nom}</h4>
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(p.data_peticio).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Profesores Referentes</label>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-bold text-gray-700">1.</span> {(p as any).prof1?.nom || 'No asignado'} 
                              <span className="text-gray-400 text-[10px] ml-2 italic">{(p as any).prof1?.contacte}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-gray-700">2.</span> {(p as any).prof2?.nom || 'No asignado'}
                              <span className="text-gray-400 text-[10px] ml-2 italic">{(p as any).prof2?.contacte}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Alumnos ({p.alumnes_aprox})</label>
                          <div className="flex flex-wrap gap-2">
                            {(p as any).alumnes?.map((a: any) => (
                              <span key={a.id_alumne} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold">
                                {a.nom} {a.cognoms}
                              </span>
                            )) || <span className="text-gray-300 italic text-xs">Sin alumnos asignados</span>}
                          </div>
                        </div>
                      </div>

                      {/* Comments & Status */}
                      <div className="w-full lg:w-1/4 flex flex-col items-end gap-3 self-stretch justify-between">
                        <div className="w-full text-right">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Comentarios</label>
                          <p className="text-xs text-gray-600 italic line-clamp-2">{p.comentaris || 'Sin comentarios'}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                          p.estat === 'Pendent' ? 'bg-orange-50 text-orange-600' :
                          p.estat === 'Aprovada' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {p.estat}
                        </div>
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
