'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';

export default function NominalRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignacio, setAssignacio] = useState<any>(null);
  const [alumnes, setAlumnes] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.rol.nom_rol !== 'COORDINADOR') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        const api = getApi();
        
        // Fetch phases first for gating
        const resFases = await api.get("/fases");
        const phasesData = resFases.data.data;
        const isPlanificacio = phasesData.find((f: any) => f.nom === PHASES.PLANIFICACION)?.activa;
        
        if (!isPlanificacio) {
          alert('El període de registre nominal no està actiu.');
          router.push('/centro/assignacions');
          return;
        }

        // Fetch assignment
        const resAssig = await api.get(`/assignacions/centre/${currentUser.id_centre}`);
        const found = resAssig.data.find((a: any) => a.id_assignacio === parseInt(id));
        
        if (!found) {
          alert('Assignació no trobada o no autoritzada.');
          router.push('/centro/assignacions');
          return;
        }
        setAssignacio(found);
        
        // Fetch all students from center
        const resAlumnes = await api.get(`/alumnes/centre/${currentUser.id_centre}`);
        setAlumnes(resAlumnes.data);
      } catch (error) {
        console.error("Error fetching nominal register data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const toggleAlumne = (idAlumne: number) => {
    setSelectedIds(prev => 
      prev.includes(idAlumne) 
        ? prev.filter(i => i !== idAlumne) 
        : [...prev, idAlumne]
    );
  };

  const handleSave = async () => {
    try {
      const api = getApi();
      // 1. Save inscriptions (Nominal Register)
      await api.post(`/assignacions/${id}/inscripcions`, { ids_alumnes: selectedIds });
      
      // 2. Update Checklist Item "Subir Registro Nominal (Excel)"
      const item = assignacio.checklist.find((i: any) => i.pas_nom === 'Subir Registro Nominal (Excel)');
      if (item) {
        await api.patch(`/assignacions/checklist/${item.id_checklist}`, { completat: true });
      }

      alert('Registre Nominal desat amb èxit i checklist actualitzat.');
      router.push('/centro/assignacions');
    } catch (error) {
      alert('Error al desar el registre nominal.');
    }
  };

  if (loading || !user || !assignacio) return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <DashboardLayout 
      title={`Registre Nominal: ${assignacio.taller?.titol}`} 
      subtitle={`Selecciona els alumnes del centre que participaran en aquest taller.`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-2 border-gray-100 p-8 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Llistat d'Alumnat disponible</h3>
            <span className="bg-blue-50 text-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest border border-blue-100">
              {selectedIds.length} Seleccionats
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {alumnes.map(alum => (
              <div 
                key={alum.id_alumne}
                onClick={() => toggleAlumne(alum.id_alumne)}
                className={`p-4 border-2 flex justify-between items-center cursor-pointer transition-all ${
                  selectedIds.includes(alum.id_alumne) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-50 hover:border-gray-200 bg-gray-50/30'
                }`}
              >
                <div>
                  <p className="font-bold text-gray-900">{alum.nom} {alum.cognoms}</p>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{alum.idalu} • {alum.curs}</p>
                </div>
                {selectedIds.includes(alum.id_alumne) && (
                  <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-4 font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Confirmar i Desar Registre
            </button>
            <button 
              onClick={() => router.back()}
              className="px-8 bg-gray-100 text-gray-400 py-4 font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancel·lar
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium flex gap-4 items-start">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>D'acord amb la Fase 2, aquest registre nominal és obligatori per procedir amb l'emissió de certificats al finalitzal el taller.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
