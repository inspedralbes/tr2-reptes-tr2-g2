"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME } from "@iter/shared";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateCentroModal from "../../../components/CreateCentroModal";
import centroService, { Centre } from "../../../services/centroService";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function CentrosScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [editingCentro, setEditingCentro] = useState<Centre | null>(null);
  const [centros, setCentros] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
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

  const fetchCentros = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await centroService.getAll();
      setCentros(lista);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los centros.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.rol.nom_rol === 'ADMIN') {
      fetchCentros();
    }
  }, [fetchCentros, user]);

  const filteredCentros = useMemo(() => {
    return centros.filter((centro) => {
      const matchesSearch = !searchQuery || 
        centro.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        centro.codi_centre.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [centros, searchQuery]);

  const totalPages = Math.ceil(filteredCentros.length / itemsPerPage);
  const paginatedCentros = filteredCentros.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCentroSaved = (saved: Centre) => {
    setCentros((prev) => {
      const exists = prev.find((c) => c.id_centre === saved.id_centre);
      if (exists) {
        return prev.map((c) => (c.id_centre === saved.id_centre ? saved : c));
      }
      return [saved, ...prev];
    });
    setEditingCentro(null);
    toast.success("Centre desat amb èxit.");
  };

  const handleEdit = (centro: Centre) => {
    setEditingCentro(centro);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Centre',
      message: 'Estàs segur que vols eliminar aquest centre? S\'eliminaran totes les dades associades.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await centroService.delete(id);
          setCentros((prev) => prev.filter((c) => c.id_centre !== id));
          toast.success("Centre eliminat correctament.");
        } catch (err) {
          toast.error("Error al eliminar el centre.");
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
        setEditingCentro(null);
        setModalVisible(true);
      }}
      className="flex items-center gap-2 px-6 py-3 text-white font-bold shadow-lg"
      style={{ backgroundColor: THEME.colors.primary }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Nuevo Centro
    </button>
  );

  return (
    <DashboardLayout 
      title="Gestión de Centros" 
      subtitle="Administración de centros educativos participantes en Iter."
      actions={headerActions}
    >
      {/* Panell de Filtres */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-background-surface border border-border-subtle p-8">
        {/* Cercador */}
        <div className="flex-1">
          <label className="block text-[10px] font-black text-text-primary uppercase tracking-[0.2em] mb-3">Cerca per nom o codi</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ej: Institut Pedralbes, 08012345..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-actionBlue focus:ring-0 text-sm font-bold text-text-primary placeholder:text-text-muted transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Acció: Netejar */}
        <div className="flex items-end">
          <button 
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            Netejar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Taula de Centres */}
      {loading ? (
        <Loading message="Carregant centres..." />
      ) : filteredCentros.length > 0 ? (
        <div className="bg-background-surface border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-subtle border-b border-border-subtle">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-primary">Centre</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-primary">Adreça</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-primary">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-primary">Telèfon</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-primary text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginatedCentros.map((centro) => (
                  <tr key={centro.id_centre} className="hover:bg-background-subtle transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background-subtle flex items-center justify-center text-text-primary group-hover:bg-consorci-darkBlue group-hover:text-white transition-colors">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-black text-text-primary uppercase tracking-tight">{centro.nom}</div>
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">CODI: {centro.codi_centre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-text-primary">
                      {centro.adreca || "Sense adreça"}
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-text-primary">
                      {centro.email_contacte || "N/A"}
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-text-primary">
                      {centro.telefon_contacte || "N/A"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => handleEdit(centro)}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-consorci-darkBlue hover:bg-background-subtle transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(centro.id_centre)}
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
          {totalPages > 1 && (
            <div className="mt-0 flex flex-col sm:flex-row justify-between items-center gap-4 bg-background-subtle border-t border-border-subtle p-6">
              <div className="text-[10px] font-black uppercase text-text-muted tracking-widest">
                Mostrant <span className="text-consorci-darkBlue">{paginatedCentros.length}</span> de <span className="text-consorci-darkBlue">{filteredCentros.length}</span> centres
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === 1 
                    ? 'text-text-muted border-border-subtle cursor-not-allowed' 
                    : 'text-consorci-darkBlue border-border-subtle hover:bg-background-subtle'}`}
                >
                  Anterior
                </button>
                <div className="px-4 py-2 bg-background-surface border border-border-subtle text-[10px] font-black text-consorci-darkBlue tracking-[0.2em]">
                  Pàgina {currentPage} de {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === totalPages 
                    ? 'text-text-muted border-border-subtle cursor-not-allowed' 
                    : 'text-consorci-darkBlue border-border-subtle hover:bg-background-subtle'}`}
                >
                  Següent
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-32 bg-background-surface border border-dashed border-border-subtle">
          <div className="w-16 h-16 bg-background-subtle flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-black uppercase text-xs tracking-widest">No s'han trobat centres</p>
          <p className="text-text-muted text-[10px] uppercase font-bold mt-1 tracking-widest">Prova amb altres termes de cerca.</p>
        </div>
      )}

      <CreateCentroModal
        visible={isModalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingCentro(null);
        }}
        onCentroSaved={handleCentroSaved}
        initialData={editingCentro}
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
