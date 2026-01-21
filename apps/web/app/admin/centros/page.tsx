"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME } from "@iter/shared";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateCentroModal from "../../../components/CreateCentroModal";
import centroService, { Centre } from "../../../services/centroService";

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
  const [selectedAsistencia, setSelectedAsistencia] = useState("Toti els estats");
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchCentros = useCallback(async () => {
    try {
      const lista = await centroService.getAll();
      setCentros(lista);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los centros.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user && user.rol.nom_rol === 'ADMIN') {
      setLoading(true);
      fetchCentros().finally(() => setLoading(false));
    }
  }, [fetchCentros, user]);

  const filteredCentros = useMemo(() => {
    return centros.filter((centro) => {
      const matchesSearch = !searchQuery || 
        centro.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        centro.codi_centre.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAsistencia = selectedAsistencia === "Toti els estats" || 
        (selectedAsistencia === "Confirmada" && centro.asistencia_reunion) ||
        (selectedAsistencia === "Pendent" && !centro.asistencia_reunion);

      return matchesSearch && matchesAsistencia;
    });
  }, [centros, searchQuery, selectedAsistencia]);

  const handleCentroSaved = (saved: Centre) => {
    setCentros((prev) => {
      const exists = prev.find((c) => c.id_centre === saved.id_centre);
      if (exists) {
        return prev.map((c) => (c.id_centre === saved.id_centre ? saved : c));
      }
      return [saved, ...prev];
    });
    setEditingCentro(null);
  };

  const handleEdit = (centro: Centre) => {
    setEditingCentro(centro);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este centro?')) return;
    try {
      await centroService.delete(id);
      setCentros((prev) => prev.filter((c) => c.id_centre !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el centro");
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
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
        {/* Cercador */}
        <div className="flex-1">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Cerca per nom o codi</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ej: Institut Pedralbes, 08012345..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filtre Assistència */}
        <div className="lg:w-72">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Filtre d'assistència</label>
          <select 
            value={selectedAsistencia}
            onChange={(e) => setSelectedAsistencia(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
          >
            <option value="Toti els estats">Toti els estats</option>
            <option value="Confirmada">Assistència Confirmada</option>
            <option value="Pendent">Pendent d'Assistència</option>
          </select>
        </div>

        {/* Acció: Netejar */}
        <div className="flex items-end">
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedAsistencia("Toti els estats");
            }}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            Netejar
          </button>
        </div>
      </div>

      {/* Taula de Centres */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Carregant centres...</p>
        </div>
      ) : filteredCentros.length > 0 ? (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Informació del Centre</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Dades de Contacte</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Assistència</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCentros.map((centro) => (
                  <tr key={centro.id_centre} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#EAEFF2] flex items-center justify-center text-[#00426B] group-hover:bg-[#00426B] group-hover:text-white transition-colors">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#00426B] uppercase tracking-tight">{centro.nom}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">CODI: {centro.codi_centre} • {centro.adreca || "Sense adreça"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] text-gray-500 font-medium">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300 select-none">Email:</span>
                          <span className="text-[#00426B] font-bold">{centro.email_contacte || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300 select-none">Tel:</span>
                          <span className="text-[#00426B] font-bold">{centro.telefon_contacte || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border ${centro.asistencia_reunion 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {centro.asistencia_reunion ? 'Confirmada' : 'Pendent'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => handleEdit(centro)}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#EAEFF2] transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(centro.id_centre)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
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
        </div>
      ) : (
        <div className="text-center py-32 bg-white border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-[#00426B] font-black uppercase text-xs tracking-widest">No s'han trobat centres</p>
          <p className="text-gray-400 text-[10px] uppercase font-bold mt-1 tracking-widest">Prova amb altres termes de cerca.</p>
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
    </DashboardLayout>
  );
}
