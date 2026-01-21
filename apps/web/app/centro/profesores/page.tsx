'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import professorService, { Professor } from '@/services/professorService';

export default function ProfesoresCRUD() {
  const { user, loading: authLoading } = useAuth();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({ nom: '', contacte: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'COORDINADOR')) {
      router.push('/login');
      return;
    }
    if (user) loadProfessors();
  }, [user, authLoading]);

  const loadProfessors = async () => {
    try {
      const data = await professorService.getAll();
      setProfessors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessors = professors.filter(p => {
    return !searchQuery || 
      p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contacte.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredProfessors.length / itemsPerPage);
  const paginatedProfessors = filteredProfessors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProf) {
        await professorService.update(editingProf.id_professor, formData);
      } else {
        await professorService.create(formData);
      }
      setIsModalOpen(false);
      setEditingProf(null);
      setFormData({ nom: '', contacte: '' });
      loadProfessors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prof: Professor) => {
    setEditingProf(prof);
    setFormData({ nom: prof.nom, contacte: prof.contacte });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este profesor?')) {
      await professorService.delete(id);
      loadProfessors();
    }
  };
  const headerActions = (
    <button 
      onClick={() => { setEditingProf(null); setFormData({ nom: '', contacte: '' }); setIsModalOpen(true); }}
      className="bg-[#00426B] text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-[#0775AB] transition-all flex items-center gap-2 shadow-lg"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      Nou Professor
    </button>
  );

  return (
    <DashboardLayout 
      title="Gestió del Professorat" 
      subtitle="Administra els professors referents del teu centre educatiu."
      actions={headerActions}
    >
      {/* Panell de Filtres */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 bg-white border border-gray-200 p-8">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">Cerca per nom o contacte</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Ex: Manuel Pérez, manuel@escolaurgell.cat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-0 text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => setSearchQuery("")}
            className="w-full lg:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 h-[46px]"
          >
            Netejar
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Professor/a</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Contacte</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-right">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProfessors.map(p => (
                <tr key={p.id_professor} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#EAEFF2] flex items-center justify-center text-[#00426B] group-hover:bg-[#00426B] group-hover:text-white transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#00426B] uppercase tracking-tight">{p.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-gray-500">{p.contacte}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => handleEdit(p)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00426B] hover:bg-[#EAEFF2] transition-colors">Editar</button>
                      <button onClick={() => handleDelete(p.id_professor)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProfessors.length === 0 && !loading && (
          <div className="p-20 text-center">
            <p className="text-[#00426B] font-black uppercase text-xs tracking-widest">No s'han trobat professors</p>
            <p className="text-gray-400 text-[10px] uppercase font-bold mt-1 tracking-widest">Prova amb altres termes de cerca.</p>
          </div>
        )}
      </div>

      {/* Paginació */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-gray-200 p-6">
          <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            Mostrant <span className="text-[#00426B]">{paginatedProfessors.length}</span> de <span className="text-[#00426B]">{filteredProfessors.length}</span> professors
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
            <div className="px-4 py-2 bg-[#F8FAFC] border border-gray-200 text-[10px] font-black text-[#00426B] tracking-[0.2em]">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-10 max-w-md w-full shadow-2xl relative border border-gray-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tight mb-8">
              {editingProf ? 'Editar Professor' : 'Nou Professor'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom complet</label>
                <input 
                  type="text" value={formData.nom} 
                  onChange={e => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-none focus:ring-2 focus:ring-[#0775AB] font-bold text-[#00426B]" required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dades de contacte (Email o telèfon)</label>
                <input 
                  type="text" value={formData.contacte} 
                  onChange={e => setFormData({...formData, contacte: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-none focus:ring-2 focus:ring-[#0775AB] font-bold text-[#00426B]" required
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel·lar</button>
                <button type="submit" className="flex-1 py-3 bg-[#00426B] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#0775AB] transition-all shadow-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
