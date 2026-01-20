"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME } from "@iter/shared";
import WorkshopDetail from "../../../components/WorkshopDetail";
import WorkshopCard from "../../../components/WorkshopCard";
import tallerService, { Taller } from "../../../services/tallerService";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateWorkshopModal from "../../../components/CreateWorkshopModal";

export default function TallerScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [selectedWorkshop, setSelectedWorkshop] = useState<Taller | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<Taller | null>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const fetchTalleres = useCallback(async () => {
    try {
      const listaTalleres = await tallerService.getAll();
      setTalleres(listaTalleres);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los talleres.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user && user.rol.nom_rol === 'ADMIN') {
      setLoading(true);
      fetchTalleres().finally(() => setLoading(false));
    }
  }, [fetchTalleres, user]);

  const filteredTalleres = useMemo(() => {
    if (!searchQuery) return talleres;
    return talleres.filter((taller) =>
      taller.titol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [talleres, searchQuery]);

  const handleWorkshopSaved = (savedWorkshop: Taller) => {
    setTalleres((prev) => {
      const exists = prev.find((t) => t._id === savedWorkshop._id);
      if (exists) {
        return prev.map((t) => (t._id === savedWorkshop._id ? savedWorkshop : t));
      }
      return [savedWorkshop, ...prev];
    });
    setEditingWorkshop(null);
  };

  const handleEdit = (taller: Taller) => {
    setEditingWorkshop(taller);
    setSelectedWorkshop(null);
    setCreateModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este taller?')) return;
    try {
      await tallerService.delete(id);
      setTalleres((prev) => prev.filter((t) => t._id !== id));
      setSelectedWorkshop(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el taller");
    }
  };

  if (authLoading || !user || user.rol.nom_rol !== 'ADMIN') {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  const headerActions = (
    <button
      onClick={() => {
        setEditingWorkshop(null);
        setCreateModalVisible(true);
      }}
      className="flex items-center gap-2 px-6 py-3 text-white font-bold shadow-lg"
      style={{ backgroundColor: THEME.colors.primary }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Nuevo Taller
    </button>
  );

  return (
    <DashboardLayout 
      title="Gestión de Talleres" 
      subtitle="Creación, edición y supervisión del catálogo oficial de Iter."
      actions={headerActions}
    >
      {/* Buscador */}
      <div className="mb-8 flex justify-between items-center bg-white shadow-sm border border-gray-100 p-6">
        <div className="max-w-md w-full">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Buscador ràpid</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ej: Fusta, Robòtica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid de Talleres */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Carregant catàleg...</p>
        </div>
      ) : filteredTalleres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredTalleres.map((taller) => (
            <div key={taller._id} className="group bg-white shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>

              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">ID: {taller._id}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors">{taller.titol}</h3>
                <p className="text-sm text-gray-500 mb-6 h-10 line-clamp-2 leading-relaxed">{taller.detalls_tecnics?.descripcio}</p>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 font-bold text-[10px] uppercase tracking-wide">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {taller.detalls_tecnics?.durada_hores}h
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 font-bold text-[10px] uppercase tracking-wide">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {taller.detalls_tecnics?.places_maximes} p.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedWorkshop(taller)}
                    className="flex-1 py-3 px-4 text-xs font-bold text-blue-800 bg-blue-50/50 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    Detalles
                  </button>
                  <button 
                    onClick={() => handleEdit(taller)}
                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    title="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(taller._id)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Eliminar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white border border-dashed border-gray-200 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-black uppercase text-xs tracking-widest">No s'han trobat tallers</p>
          <p className="text-gray-400 text-sm mt-1">Prova amb altres termes de cerca.</p>
        </div>
      )}

      <WorkshopDetail
        visible={!!selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        selectedWorkshop={selectedWorkshop}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateWorkshopModal
        visible={isCreateModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingWorkshop(null);
        }}
        onWorkshopCreated={handleWorkshopSaved}
        initialData={editingWorkshop}
      />
    </DashboardLayout>
  );
}