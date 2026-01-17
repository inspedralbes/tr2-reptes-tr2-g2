"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import getApi from "@/services/api";
import { THEME } from "@iter/shared";

interface Fase {
  id_fase: number;
  nom: string;
  descripcio: string;
  data_inici: string;
  data_fi: string;
  activa: boolean;
}

export default function PhaseManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchFases = async () => {
    try {
      const api = getApi();
      const response = await api.get("/fases");
      setFases(response.data.data);
    } catch (error) {
      console.error("Error fetching phases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.rol.nom_rol === 'ADMIN') {
      fetchFases();
    }
  }, [user]);

  const togglePhase = async (id: number, currentActiva: boolean) => {
    setUpdating(id);
    try {
      const api = getApi();
      await api.put(`/fases/${id}`, { activa: !currentActiva });
      await fetchFases();
    } catch (error) {
      alert("Error al actualizar la fase");
    } finally {
      setUpdating(null);
    }
  };

  const updatePhaseDate = async (id: number, field: 'data_inici' | 'data_fi', value: string) => {
    try {
      const api = getApi();
      await api.put(`/fases/${id}`, { [field]: value });
      setFases(prev => prev.map(f => f.id_fase === id ? { ...f, [field]: value } : f));
    } catch (error) {
      alert("Error al actualizar la fecha");
    }
  };

  if (authLoading || !user || user.rol.nom_rol !== 'ADMIN') return null;

  return (
    <DashboardLayout 
      title="Gestió de Fases Iter" 
      subtitle="Controla el cicle de vida del programa i simula dates per a test."
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-blue-50 border border-blue-100 p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-1">Eina de Desenvolupador</h3>
              <p className="text-sm text-blue-700 font-medium">Mitjançant aquest panell pots activar/desactivar fases per provar el comportament del calendari i els diferents dashboards en temps real.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
             <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {fases.map((fase) => (
              <div 
                key={fase.id_fase} 
                className={`p-8 bg-white border-2 ${
                  fase.activa ? 'border-blue-500' : 'border-gray-100 opacity-60 grayscale-[0.5]'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl font-black text-gray-900">{fase.nom}</h3>
                       {fase.activa && (
                         <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">ACTIVA</span>
                       )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-6">{fase.descripcio}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data Inici</label>
                        <input 
                          type="date" 
                          value={fase.data_inici.split('T')[0]}
                          onChange={(e) => updatePhaseDate(fase.id_fase, 'data_inici', e.target.value)}
                          className="w-full bg-gray-50 border-none text-sm font-bold text-gray-700 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data Fi</label>
                        <input 
                          type="date" 
                          value={fase.data_fi.split('T')[0]}
                          onChange={(e) => updatePhaseDate(fase.id_fase, 'data_fi', e.target.value)}
                          className="w-full bg-gray-50 border-none text-sm font-bold text-gray-700 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:w-48 flex items-center justify-center">
                    <button
                      onClick={() => togglePhase(fase.id_fase, fase.activa)}
                      disabled={updating === fase.id_fase}
                      className={`w-full py-4 font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                        fase.activa 
                          ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 shadow-none' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                      }`}
                    >
                      {updating === fase.id_fase ? 'Procesant...' : fase.activa ? 'Desactivar' : 'Activar Fase'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
