'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import statsService, { StatusStat, PopularStat, ActivityLog } from '@/services/statsService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AdminStatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);
  const [popularStats, setPopularStats] = useState<PopularStat[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
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

  const handleCleanup = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Netejar Logs',
      message: 'Vols netejar els logs antics (>30 dies)? Aquesta acció no es pot desfer.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await statsService.cleanupLogs();
          toast.success(res.message);
          fetchData();
        } catch (err) {
          toast.error('Error en netejar els logs.');
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
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
    const pas_nom = prompt('Nom del nou pas:');
    if (pas_nom) {
      try {
        await statsService.addChecklistStep(id, pas_nom);
        toast.success("Pas afegit correctament.");
        handleSearch();
      } catch (err) {
        toast.error('Error en afegir el pas.');
      }
    }
  };

  if (authLoading || !user) {
    return <Loading fullScreen message="Carregant analítica..." />;
  }

  return (
    <DashboardLayout 
      title="Gestió de Dades" 
      subtitle="Analítica professional i administració de registres d'activitat"
    >
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div className="text-[10px] font-black text-[#00426B] uppercase tracking-widest">
            PANEL D'ADMINISTRACIÓ AVANÇAT
          </div>
          <button 
            onClick={handleCleanup}
            className="bg-white text-red-600 px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all border border-red-200"
          >
            Netejar Logs Antics
          </button>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Stats Section */}
          <div className="bg-white border border-gray-200 rounded-none shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <div className="w-2 h-6 bg-[#00426B]"></div>
              <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest">Peticions per Estat</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {statusStats.length > 0 ? statusStats.map((stat, i) => (
                  <div key={i} className="border border-gray-100 p-4 bg-gray-50/50 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{stat.estat}</span>
                    <span className="text-2xl font-black text-[#00426B]">{stat.total}</span>
                  </div>
                )) : (
                  <div className="col-span-2 py-4 text-center border border-dashed border-gray-100 italic text-xs text-gray-400">
                    No hi ha dades disponibles
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Popular Workshops Section */}
          <div className="bg-white border border-gray-200 rounded-none shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <div className="w-2 h-6 bg-[#0775AB]"></div>
              <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest">Tallers més Sol·licitats</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-3 font-black uppercase tracking-tighter">Pos</th>
                    <th className="px-6 py-3 font-black uppercase tracking-tighter">ID Taller</th>
                    <th className="px-6 py-3 font-black uppercase tracking-tighter text-right">Alumnes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {popularStats.length > 0 ? popularStats.map((stat, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-black text-gray-400">#0{i + 1}</td>
                      <td className="px-6 py-3 font-bold text-gray-800">{stat._id}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="bg-[#0775AB] text-white px-2 py-0.5 font-bold">{stat.alumnes_totals}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-300 italic">No hi ha rànquing disponible</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Checklist Management Section */}
        <div className="bg-white border border-gray-200 rounded-none shadow-none">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-green-600"></div>
              <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest">Gestió de Checklists (MongoDB)</h3>
            </div>
            <div className="flex gap-0">
              <input 
                type="text" 
                placeholder="Cercar per títol o estat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-200 px-4 py-2 rounded-none text-xs focus:outline-none focus:border-[#00426B] border-r-0 w-64"
              />
              <button 
                onClick={handleSearch}
                className="bg-[#00426B] text-white px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB]"
              >
                Cercar
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {searchResults.length > 0 ? searchResults.map((result) => (
                <div key={result._id} className="border border-gray-200 p-4 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-black text-[#00426B]">{result.workshop_title}</h4>
                      <span className="text-[9px] font-black border border-green-600 text-green-600 px-1.5 py-0.5 uppercase">{result.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {result.passos.map((p: any, idx: number) => (
                        <div key={idx} className={`px-2 py-0.5 text-[9px] font-bold border rounded-none ${p.completat ? 'bg-green-100 border-green-200 text-green-800' : 'bg-white border-gray-300 text-gray-400'}`}>
                          {p.pas}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddStep(result.id_peticio)}
                    className="bg-white border border-gray-200 text-[10px] font-black uppercase px-4 py-2 hover:bg-gray-100 transition-all text-[#00426B] whitespace-nowrap"
                  >
                    + Afegir Pas
                  </button>
                </div>
              )) : (
                <div className="text-center py-12 border border-dashed border-gray-100">
                  <p className="text-gray-300 text-xs font-bold uppercase tracking-widest">Utilitza el cercador per trobar llistats nominals</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="bg-white border border-gray-200 rounded-none shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-purple-600"></div>
              <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest">Registre d'activitat (Últims 10)</h3>
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">PostgreSQL & MongoDB Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/30 text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-black uppercase w-48">Timestamp</th>
                  <th className="px-6 py-4 font-black uppercase w-40">Acció</th>
                  <th className="px-6 py-4 font-black uppercase">Detalls Documentals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activityLogs.length > 0 ? activityLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 border border-purple-200 text-purple-700 bg-purple-50 font-black uppercase tracking-tight text-[9px]">
                        {log.tipus_accio}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] text-gray-400 bg-gray-50 p-2 border border-gray-100 max-h-24 overflow-y-auto break-all">
                        {JSON.stringify(log.detalls)}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <p className="text-gray-300 text-xs font-bold uppercase tracking-widest">No hi ha activitat registrada</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
