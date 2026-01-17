'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@enginy/shared';
import DashboardLayout from '@/components/DashboardLayout';
import statsService, { StatusStat, PopularStat, ActivityLog } from '@/services/statsService';

export default function AdminStatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);
  const [popularStats, setPopularStats] = useState<PopularStat[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [statusData, popularData, activityData] = await Promise.all([
        statsService.getByStatus(),
        statsService.getPopular(),
        statsService.getActivity()
      ]);
      setStatusStats(statusData);
      setPopularStats(popularData);
      setActivityLogs(activityData);
    } catch (err) {
      console.error("Error fetching stats:", err);
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

  const handleCleanup = async () => {
    if (confirm('¿Deseas limpiar los logs antiguos (>30 días)?')) {
      try {
        const res = await statsService.cleanupLogs();
        alert(res.message);
        fetchData();
      } catch (err) {
        alert('Error al limpiar logs');
      }
    }
  };

  const handleSearch = async () => {
    try {
      const res = await statsService.search(searchTerm);
      setSearchResults(res);
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

  const handleAddStep = async (id: number) => {
    const pas_nom = prompt('Nombre del nuevo paso:');
    if (pas_nom) {
      try {
        await statsService.addChecklistStep(id, pas_nom);
        handleSearch(); // Refresh search results
      } catch (err) {
        alert('Error al añadir paso');
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Gestión de Datos (MongoDB)" 
      subtitle="Analítica avanzada y administración de colecciones documentales."
    >
      <div className="flex justify-end mb-6">
        <button 
          onClick={handleCleanup}
          className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-colors border border-red-100"
        >
          Limpiar Logs Antiguos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Card: Peticiones por Estado */}
        {/* ... (keep existing stats cards) ... */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Solicitudes por Estado</h3>
          </div>
          
          <div className="space-y-4">
            {statusStats.length > 0 ? statusStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <span className="text-xs font-black uppercase text-gray-400 tracking-widest block mb-1">Estado</span>
                  <span className="font-bold text-gray-800">{stat.estat}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600">{stat.total}</span>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Total</span>
                </div>
              </div>
            )) : <p className="text-gray-400 italic text-sm">No hay datos suficientes.</p>}
          </div>
        </div>

        {/* Card: Talleres más populares */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Talleres Populares</h3>
          </div>

          <div className="space-y-4">
            {popularStats.length > 0 ? popularStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-gray-50 rounded-2xl hover:bg-orange-50/30 transition-colors">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-700 text-xs">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-gray-800 block">ID Taller: {stat._id}</span>
                  <span className="text-xs text-gray-500">{stat.alumnes_totals} alumnos impactados</span>
                </div>
                <div className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-black">
                  {stat.total_solicitudes} pet.
                </div>
              </div>
            )) : <p className="text-gray-400 italic text-sm">Cargando datos populares...</p>}
          </div>
        </div>
      </div>

      {/* Checklist Search and Management */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Buscador de Checklists (Flexible)</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Buscar por título o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            <button 
              onClick={handleSearch}
              className="bg-green-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {searchResults.map((result) => (
            <div key={result._id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-gray-900">{result.workshop_title}</h4>
                  <p className="text-xs text-gray-400">ID Petición: {result.id_peticio} | Estado: <span className="text-green-600 font-bold">{result.status}</span></p>
                </div>
                <button 
                  onClick={() => handleAddStep(result.id_peticio)}
                  className="bg-white text-[10px] font-black uppercase border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100"
                >
                  + Añadir Paso
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.passos.map((p: any, idx: number) => (
                  <div key={idx} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${p.completat ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-400'}`}>
                    {p.pas}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {searchResults.length === 0 && (
            <p className="text-center text-gray-400 py-10 italic">Utiliza el buscador para encontrar checklists dinámicos de MongoDB.</p>
          )}
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Registro de Actividad Reciente</h3>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Últimas 10 acciones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalles Imbricados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activityLogs.map((log) => (
                <tr key={log._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-mono text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {log.tipus_accio}
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg block border border-gray-100">
                      {JSON.stringify(log.detalls)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activityLogs.length === 0 && (
            <div className="py-20 text-center text-gray-300 italic text-sm">Aún no hay actividad registrada en MongoDB.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
