'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import statsService, { StatusStat, PopularStat, ActivityLog } from '@/services/statsService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  History,
  Trash2,
  PlusCircle,
  Database,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  StatusDistribution,
  WorkshopPopularity
} from '@/components/ChartComponents';

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
    onConfirm: () => { },
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
      toast.error('Error al carregar les estadístiques.');
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
    if (!searchTerm.trim()) return;
    try {
      const res = await statsService.search(searchTerm);
      setSearchResults(res);
      if (res.length === 0) toast.info('No s\'han trobat resultats.');
    } catch (err) {
      toast.error('Error en la cerca.');
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

  if (authLoading || !user || loading) {
    return <Loading fullScreen message="Generant analítica professional..." />;
  }

  return (
    <DashboardLayout
      title="Dashboard Analític"
      subtitle="Visualització de dades generades en temps real des de MongoDB Atlas"
    >
      <div className="space-y-8 animate-in fade-in duration-700">

        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#00426B] p-6 text-white shadow-lg border-l-8 border-[#0775AB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-[#97C9E3] animate-pulse" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#97C9E3]">
                DATA SYNC ACTIVE
              </div>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Estadístiques de Gestió</h2>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-[#97C9E3] uppercase mb-0.5 tracking-tighter">Global Requests</div>
              <div className="text-3xl font-black leading-none">
                {statusStats.reduce((acc, s) => acc + s.total, 0)}
              </div>
            </div>
            <button
              onClick={handleCleanup}
              className="group relative flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 border border-white/20 hover:bg-red-600 hover:border-red-600 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Netejar Històric</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Charts & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Status Distribution (Pie) */}
          <div className="lg:col-span-1 flex flex-col bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200 group">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#0775AB]" />
                <h3 className="text-[10px] font-black text-[#00426B] uppercase tracking-widest">Estat de Peticions</h3>
              </div>
              <TrendingUp className="w-4 h-4 text-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
              <StatusDistribution data={statusStats} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {statusStats.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 border-l-2 border-[#00426B]">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">{s.estat}</span>
                    <span className="text-xs font-black text-[#00426B]">{s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workshop Popularity (Bar) */}
          <div className="lg:col-span-2 flex flex-col bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0775AB]" />
              <h3 className="text-[10px] font-black text-[#00426B] uppercase tracking-widest">Demanda Global de Tallers</h3>
            </div>
            <div className="p-6 flex-1">
              <WorkshopPopularity data={popularStats} />
            </div>
          </div>
        </div>


        {/* MongoDB Management (Checklists) */}
        <div className="bg-white border border-[#CFD2D3] shadow-lg">
          <div className="p-6 border-b border-[#CFD2D3] bg-[#F2F4F7] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-[#00426B]" />
              <div>
                <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest">Gestió Dinàmica de Checklists</h3>
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Consulta de documents a col·lecció 'request_checklists'</p>
              </div>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="text"
                placeholder="Ex: Robòtica, Aprovada..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-white border-2 border-r-0 border-[#CFD2D3] px-6 py-3 text-xs focus:outline-none focus:border-[#00426B] w-full md:w-80 transition-all font-bold placeholder:text-gray-300 placeholder:italic"
              />
              <button
                onClick={handleSearch}
                className="bg-[#00426B] text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-colors whitespace-nowrap"
              >
                Cercar Docs
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.length > 0 ? searchResults.map((result) => (
                <div key={result._id} className="group border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-[#00426B] hover:shadow-xl transition-all duration-300 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-sm font-black text-[#00426B] uppercase tracking-tight leading-none mb-2">{result.workshop_title}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter">{result.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                    {result.passos.map((p: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-3 h-3 border ${p.completat ? 'bg-[#00426B] border-[#00426B]' : 'bg-white border-gray-200'}`}></div>
                        <span className={`text-[10px] font-bold ${p.completat ? 'text-[#00426B]' : 'text-gray-400 italic font-medium line-through'}`}>
                          {p.pas}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddStep(result.id_peticio)}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-[#00426B] text-[#00426B] hover:bg-[#00426B] hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Nou Pas Checklist
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 bg-gray-50/20">
                  <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Inicia una cerca per visualitzar llistats nominals</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Log (Activity) */}
        <div className="bg-white border border-[#CFD2D3] overflow-hidden">
          <div className="p-6 border-b border-[#CFD2D3] bg-[#F2F4F7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-[#00426B]" />
              <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest">Registre Logístic d'Activitat</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-white text-[#00426B] border-b border-[#CFD2D3]">
                  <th className="px-6 py-5 font-black uppercase tracking-tighter w-48">Timestamp</th>
                  <th className="px-6 py-5 font-black uppercase tracking-tighter w-48">Mètode Execució</th>
                  <th className="px-6 py-5 font-black uppercase tracking-tighter">Payload Documental (Metadata)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activityLogs.length > 0 ? activityLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-black text-gray-400 italic">
                      {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                        <span className="font-black text-[#00426B] uppercase text-[10px]">
                          {log.tipus_accio}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-[#00426B]/5 p-3 font-mono text-[9px] text-[#00426B]/60 leading-relaxed border-l-2 border-[#00426B]/20">
                        {JSON.stringify(log.detalls)}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr key="no-activity">
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <p className="text-gray-300 text-xs font-bold uppercase tracking-widest italic tracking-widest">Sincronitzant historial de logs...</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sync Atlas (Full Width) */}
        <div className="bg-white border border-[#CFD2D3] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#00426B] uppercase tracking-widest">MongoDB Atlas Data Sync</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                Cluster: <span className="text-[#0775AB]">iter-main</span> · Node: <span className="text-[#0775AB]">GCP-Brussels</span> · Status: <span className="text-green-500 font-black">Connected</span>
              </p>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight text-center md:text-right max-w-md hidden sm:block">
            Sincronització de dades documentals activa. Qualsevol canvi en les peticions es reflecteix en temps real en els gràfics analítics superiors mitjançant pipelines d'agregació.
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
