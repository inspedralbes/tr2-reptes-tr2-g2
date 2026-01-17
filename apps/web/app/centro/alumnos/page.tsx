'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import alumneService, { Alumne } from '@/services/alumneService';

export default function AlumnesCRUD() {
  const { user, loading: authLoading } = useAuth();
  const [alumnes, setAlumnes] = useState<Alumne[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlumne, setEditingAlumne] = useState<Alumne | null>(null);
  const [formData, setFormData] = useState({ nom: '', cognoms: '', idalu: '', curs: '' });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlumne) {
        await alumneService.update(editingAlumne.id_alumne, formData);
      } else {
        await alumneService.create(formData);
      }
      setIsModalOpen(false);
      setEditingAlumne(null);
      setFormData({ nom: '', cognoms: '', idalu: '', curs: '' });
      loadAlumnes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (alumne: Alumne) => {
    setEditingAlumne(alumne);
    setFormData({ nom: alumne.nom, cognoms: alumne.cognoms, idalu: alumne.idalu, curs: alumne.curs });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      await alumneService.delete(id);
      loadAlumnes();
    }
  };

  return (
    <DashboardLayout title="Gestión de Alumnos" subtitle="Administra los alumnos de tu centro educativo.">
      <div className="mb-6 flex justify-end">
        <button 
          onClick={() => { setEditingAlumne(null); setFormData({ nom: '', cognoms: '', idalu: '', curs: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Alumno
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Nombre</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Apellidos</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">IDALU</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Curso</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {alumnes.map(a => (
              <tr key={a.id_alumne} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{a.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.cognoms}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{a.idalu}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{a.curs}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800 text-sm font-bold">Editar</button>
                  <button onClick={() => handleDelete(a.id_alumne)} className="text-red-500 hover:text-red-700 text-sm font-bold">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {alumnes.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-400">No hay alumnos registrados.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">{editingAlumne ? 'Editar Alumno' : 'Nuevo Alumno'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Nombre" value={formData.nom} 
                onChange={e => setFormData({...formData, nom: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" required
              />
              <input 
                type="text" placeholder="Apellidos" value={formData.cognoms} 
                onChange={e => setFormData({...formData, cognoms: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" required
              />
              <input 
                type="text" placeholder="IDALU" value={formData.idalu} 
                onChange={e => setFormData({...formData, idalu: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-mono" required
              />
              <input 
                type="text" placeholder="Curso (Ej: 4t ESO)" value={formData.curs} 
                onChange={e => setFormData({...formData, curs: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" required
              />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-400">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
