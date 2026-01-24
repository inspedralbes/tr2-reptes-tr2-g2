'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import alumneService, { Alumne } from '@/services/alumneService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Avatar from '@/components/Avatar';

export default function AlumnesCRUD() {
  const { user, loading: authLoading } = useAuth();
  const [alumnes, setAlumnes] = useState<Alumne[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlumne, setEditingAlumne] = useState<Alumne | null>(null);
  const [formData, setFormData] = useState({ nom: '', cognoms: '', idalu: '', curs: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurs, setSelectedCurs] = useState("Tots els cursos");
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

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'COORDINADOR')) {
      router.push('/login');
      return;
    }
    if (user) loadAlumnes();
  }, [user, authLoading]);

  const loadAlumnes = async () => {
    try {
      const data = await alumneService.getAll();
      setAlumnes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumnes = alumnes.filter(a => {
    const matchesSearch = !searchQuery || 
      a.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cognoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.idalu.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCurs = selectedCurs === "Tots els cursos" || a.curs === selectedCurs;
    
    return matchesSearch && matchesCurs;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCurs]);

  const totalPages = Math.ceil(filteredAlumnes.length / itemsPerPage);
  const paginatedAlumnes = filteredAlumnes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueCursos = Array.from(new Set(alumnes.map(a => a.curs))).filter(Boolean).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlumne) {
        await alumneService.update(editingAlumne.id_alumne, formData);
        toast.success("Alumne actualitzat correctament.");
      } else {
        await alumneService.create(formData);
        toast.success("Alumne creat correctament.");
      }
      setIsModalOpen(false);
      setEditingAlumne(null);
      setFormData({ nom: '', cognoms: '', idalu: '', curs: '' });
      loadAlumnes();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar l'alumne.");
    }
  };

  const handleEdit = (alumne: Alumne) => {
    setEditingAlumne(alumne);
    setFormData({ nom: alumne.nom, cognoms: alumne.cognoms, idalu: alumne.idalu, curs: alumne.curs });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Alumne',
      message: 'Estàs segur que vols eliminar aquest alumne? Aquesta acció no es pot desfer.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await alumneService.delete(id);
          loadAlumnes();
          toast.success("Alumne eliminat.");
        } catch (err) {
          toast.error("Error al eliminar l'alumne.");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const headerActions = (
    <button 
      onClick={() => { setEditingAlumne(null); setFormData({ nom: '', cognoms: '', idalu: '', curs: '' }); setIsModalOpen(true); }}
      className="bg-[#00426B] text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-[#0775AB] transition-all flex items-center gap-2 shadow-lg"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      Nou Alumne
    </button>
  );

  return (
    <DashboardLayout 
      title="Gestió de l'Alumnat" 
      subtitle="Administra els alumnes del teu centre educatiu i les seves dades nominals."
      actions={headerActions}
    >
      {/* Panell de Filtres */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Cerca per nom o IDALU</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ex: Joan García, 1234567..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="lg:w-64">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Filtra per curs</label>
          <select 
            value={selectedCurs}
            onChange={(e) => setSelectedCurs(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] appearance-none"
          >
            <option value="Tots els cursos">Tots els cursos</option>
            {uniqueCursos.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCurs("Tots els cursos"); }}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            Netejar
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Informació de l'Alumne</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Identificació (IDALU)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Curs / Nivell</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAlumnes.map(a => (
                  <tr key={a.id_alumne} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          url={a.url_foto} 
                          name={`${a.nom} ${a.cognoms}`} 
                          id={a.id_alumne} 
                          type="alumne" 
                          size="md"
                        />
                        <div>
                          <div className="text-sm font-black text-[#00426B] uppercase tracking-tight">{a.nom} {a.cognoms}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase">{a.idalu}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 bg-[#EAEFF2] text-[#00426B] text-[10px] font-black uppercase tracking-widest border border-[#EAEFF2]">
                        {a.curs}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button onClick={() => handleEdit(a)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#EAEFF2] transition-colors">Editar</button>
                        <button onClick={() => handleDelete(a.id_alumne)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAlumnes.length === 0 && !loading && (
            <div className="p-20 text-center">
              <p className="text-[#00426B] font-black uppercase text-xs tracking-widest">No s'han trobat alumnes</p>
              <p className="text-gray-400 text-[10px] uppercase font-bold mt-1 tracking-widest">Prova amb altres termes de cerca.</p>
            </div>
          )}

          {/* Paginació */}
          {totalPages > 1 && (
            <div className="mt-0 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC] border-t border-gray-200 p-6">
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Mostrant <span className="text-[#00426B]">{paginatedAlumnes.length}</span> de <span className="text-[#00426B]">{filteredAlumnes.length}</span> alumnes
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === 1 
                    ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                    : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                >
                  Anterior
                </button>
                <div className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black text-[#00426B] tracking-[0.2em]">
                  Pàgina {currentPage} de {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${currentPage === totalPages 
                    ? 'text-gray-200 border-gray-100 cursor-not-allowed' 
                    : 'text-[#00426B] border-gray-200 hover:bg-[#EAEFF2]'}`}
                >
                  Següent
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-100">
            {/* Header */}
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tight">
                  {editingAlumne ? 'Editar Alumne' : 'Nou Alumne'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {editingAlumne ? 'Modifica les dades de l\'estudiant' : 'Introdueix les dades del nou alumne'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-[#00426B] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {editingAlumne && (
                <div className="p-8 bg-gray-50/50 border-b border-gray-50 flex flex-col items-center gap-4">
                  <Avatar 
                    url={editingAlumne.url_foto} 
                    name={`${editingAlumne.nom} ${editingAlumne.cognoms}`} 
                    id={editingAlumne.id_alumne} 
                    type="alumne" 
                    size="xl"
                    className="shadow-xl ring-4 ring-white"
                  />
                  <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#00426B] hover:text-white transition-all shadow-sm active:scale-95">
                    Canviar Foto
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append('foto', file);
                          try {
                            const api = getApi();
                            const res = await api.post(`/upload/perfil/alumne/${editingAlumne.id_alumne}`, formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            toast.success("Foto actualitzada.");
                            loadAlumnes();
                            setEditingAlumne({ ...editingAlumne, url_foto: res.data.url_foto });
                          } catch (err) {
                            toast.error("Error al pujar la foto.");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <form onSubmit={handleSubmit} id="student-form" className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Nom de l'alumne</label>
                  <input 
                    type="text" value={formData.nom} 
                    onChange={e => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all" required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Cognoms</label>
                  <input 
                    type="text" value={formData.cognoms} 
                    onChange={e => setFormData({...formData, cognoms: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all" required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Codi IDALU</label>
                  <input 
                    type="text" value={formData.idalu} 
                    onChange={e => setFormData({...formData, idalu: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all font-mono tracking-widest" required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Curs / Nivell (Ex: 4t ESO)</label>
                  <input 
                    type="text" value={formData.curs} 
                    onChange={e => setFormData({...formData, curs: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] outline-none transition-all" required
                  />
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel·lar</button>
              <button type="submit" form="student-form" className="flex-1 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-all shadow-lg active:scale-95">Guardar Alumne</button>
            </div>
          </div>
        </div>
      )}
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
