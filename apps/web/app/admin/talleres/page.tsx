"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME } from "@iter/shared";
import tallerService, { Taller } from "../../../services/tallerService";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateWorkshopModal from "../../../components/CreateWorkshopModal";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pagination from "@/components/Pagination";

const SVG_ICONS: Record<string, React.ReactNode> = {
  PUZZLE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
  ROBOT: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  CODE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
  PAINT: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
  FILM: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
  TOOLS: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  LEAF: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  GEAR: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
};

export default function TallerScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [editingWorkshop, setEditingWorkshop] = useState<Taller | null>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("Tots els sectors");
  const [selectedModalitat, setSelectedModalitat] = useState("Totes les modalitats");
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
    return talleres.filter((taller) => {
      const matchesSearch = !searchQuery || taller.titol?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === "Tots els sectors" || taller.sector === selectedSector;
      const matchesModalitat = selectedModalitat === "Totes les modalitats" || taller.modalitat === selectedModalitat;
      return matchesSearch && matchesSector && matchesModalitat;
    });
  }, [talleres, searchQuery, selectedSector, selectedModalitat]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSector, selectedModalitat]);

  const totalPages = Math.ceil(filteredTalleres.length / itemsPerPage);
  const paginatedTalleres = filteredTalleres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueSectors = useMemo(() => {
    const sectors = Array.from(new Set(talleres.map(t => t.sector))).filter(Boolean);
    return ["Tots els sectors", ...sectors.sort()];
  }, [talleres]);

  const uniqueModalitats = useMemo(() => {
    const modalitats = Array.from(new Set(talleres.map(t => t.modalitat))).filter(Boolean);
    return ["Totes les modalitats", ...modalitats.sort()];
  }, [talleres]);

  const handleWorkshopSaved = (savedWorkshop: Taller) => {
    setTalleres((prev) => {
      const exists = prev.find((t) => t._id === savedWorkshop._id);
      if (exists) {
        return prev.map((t) => (t._id === savedWorkshop._id ? savedWorkshop : t));
      }
      return [savedWorkshop, ...prev];
    });
    setEditingWorkshop(null);
    toast.success("Taller desat amb èxit.");
  };

  const handleEdit = (taller: Taller) => {
    setEditingWorkshop(taller);
    setCreateModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Taller',
      message: 'Estàs segur que vols eliminar aquest taller? Aquesta acció eliminarà el taller del catàleg permanentment.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await tallerService.delete(id);
          setTalleres((prev) => prev.filter((t) => t._id !== id));
          toast.success("Taller eliminat correctament.");
        } catch (err) {
          toast.error("Error al eliminar el taller.");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (authLoading || !user || user.rol.nom_rol !== 'ADMIN') {
    return <Loading fullScreen message="Verificant permisos d'administrador..." />;
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
      {/* Panell de Filtres */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-background-surface border border-border-subtle p-8">
        {/* Cercador de Text */}
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-text-primary uppercase tracking-[0.2em] mb-3">Cerca per títol</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ex: Fusta, Robòtica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-actionBlue focus:ring-0 text-sm font-bold text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filtre Sector */}
        <div className="lg:w-64">
          <label className="block text-[10px] font-bold text-text-primary uppercase tracking-[0.2em] mb-3">Filtra per sector</label>
          <select 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-actionBlue focus:ring-0 text-sm font-bold text-text-primary appearance-none"
          >
            {uniqueSectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Filtre Modalitat */}
        <div className="lg:w-64">
          <label className="block text-[10px] font-bold text-text-primary uppercase tracking-[0.2em] mb-3">Filtrar per modalitat</label>
          <select 
            value={selectedModalitat}
            onChange={(e) => setSelectedModalitat(e.target.value)}
            className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-actionBlue focus:ring-0 text-sm font-bold text-text-primary appearance-none"
          >
            {uniqueModalitats.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Acció: Netejar */}
        <div className="flex items-end">
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedSector("Tots els sectors");
              setSelectedModalitat("Totes les modalitats");
            }}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            Netejar
          </button>
        </div>
      </div>

      {/* Taula de Tallers */}
      {loading ? (
        <Loading message="Carregant catàleg..." />
      ) : filteredTalleres.length > 0 ? (
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary">Informació del Taller</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary">Classificació</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary">Detalls i Capacitat</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-primary text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginatedTalleres.map((taller) => (
                  <tr key={taller._id} className="hover:bg-background-subtle transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background-subtle flex items-center justify-center text-text-primary group-hover:bg-consorci-darkBlue group-hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {SVG_ICONS[taller.icona || "PUZZLE"] || SVG_ICONS.PUZZLE}
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary uppercase tracking-tight">{taller.titol}</div>
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">ID: {taller._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-medium text-text-secondary">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-consorci-actionBlue uppercase">{taller.sector}</span>
                        <span className="text-text-muted">Modalitat {taller.modalitat}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wide">
                          {taller.detalls_tecnics?.durada_hores}h • {taller.detalls_tecnics?.places_maximes} Places
                        </div>
                        <div className="text-[10px] text-text-muted font-medium line-clamp-1 max-w-[200px]">
                          {taller.detalls_tecnics?.descripcio}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => handleEdit(taller)}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-consorci-darkBlue hover:bg-background-subtle transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(taller._id)}
                          className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginació */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredTalleres.length}
            currentItemsCount={paginatedTalleres.length}
            itemName="tallers"
          />
        </div>
      ) : (
        <div className="text-center py-32 bg-background-surface border border-dashed border-border-subtle">
          <div className="w-16 h-16 bg-background-subtle flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-bold uppercase text-xs tracking-widest">No s'han trobat tallers</p>
          <p className="text-text-muted text-[10px] uppercase font-bold mt-1 tracking-widest">Prova amb altres termes de cerca.</p>
        </div>
      )}

      <CreateWorkshopModal
        visible={isCreateModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingWorkshop(null);
        }}
        onWorkshopCreated={handleWorkshopSaved}
        initialData={editingWorkshop}
      />
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