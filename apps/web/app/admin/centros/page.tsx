"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME } from "@enginy/shared";
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
    if (!searchQuery) return centros;
    return centros.filter((centro) =>
      centro.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      centro.codi_centre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [centros, searchQuery]);

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
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
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
      subtitle="Administración de centros educativos participantes en el Programa Enginy."
      actions={headerActions}
    >
      {/* Buscador */}
      <div className="mb-8">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center">
          <div className="max-w-md">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Buscador de centros</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ej: Institut Pedralbes, 08012345..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </section>
      </div>

      {/* Grid de Centros */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Carregant centres...</p>
        </div>
      ) : filteredCentros.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCentros.map((centro) => (
            <div key={centro.id_centre} className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">CODI: {centro.codi_centre}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors">{centro.nom}</h3>
                <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2 leading-relaxed">{centro.adreca || "Sin dirección"}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {centro.telefon_contacte || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 01-2 2z" />
                    </svg>
                    {centro.email_contacte || "N/A"}
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${centro.asistencia_reunion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {centro.asistencia_reunion ? 'Asistencia confirmada' : 'Pendiente asistencia'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(centro)}
                    className="flex-1 py-3 px-4 text-xs font-bold text-blue-800 bg-blue-50/50 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    Editar Detalles
                  </button>
                  <button 
                    onClick={() => handleDelete(centro.id_centre)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-black uppercase text-xs tracking-widest">No s'han trobat centres</p>
          <p className="text-gray-400 text-sm mt-1">Prova amb altres termes de cerca.</p>
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
