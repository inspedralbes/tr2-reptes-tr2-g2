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

  return (
    <DashboardLayout title="Gestión de Profesores" subtitle="Administra los profesores referents de tu centro.">
      <div className="mb-6 flex justify-end">
        <button 
          onClick={() => { setEditingProf(null); setFormData({ nom: '', contacte: '' }); setIsModalOpen(true); }}
          className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Profesor
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Nombre</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contacto</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {professors.map(p => (
              <tr key={p.id_professor} className="hover:bg-purple-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{p.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{p.contacte}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(p)} className="text-purple-600 hover:text-purple-800 text-sm font-bold">Editar</button>
                  <button onClick={() => handleDelete(p.id_professor)} className="text-red-500 hover:text-red-700 text-sm font-bold">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {professors.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-400">No hay profesores registrados.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">{editingProf ? 'Editar Profesor' : 'Nuevo Profesor'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Nombre completo" value={formData.nom} 
                onChange={e => setFormData({...formData, nom: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500" required
              />
              <input 
                type="text" placeholder="Contacto (Email o teléfono)" value={formData.contacte} 
                onChange={e => setFormData({...formData, contacte: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500" required
              />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-400">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
