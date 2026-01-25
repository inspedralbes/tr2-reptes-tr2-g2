'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

export default function DesignateProfessorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignacio, setAssignacio] = useState<any>(null);
  const [professors, setProfessors] = useState<any[]>([]);
  const [prof1Id, setProf1Id] = useState<string>('');
  const [prof2Id, setProf2Id] = useState<string>('');
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
          toast.error('El període de designació de professors no està actiu.');
          router.push('/centro/assignacions');
          return;
        }

        // Fetch assignment
        const resAssig = await api.get(`/assignacions/centre/${currentUser.id_centre}`);
        const found = resAssig.data.find((a: any) => a.id_assignacio === parseInt(id));
        
        if (!found) {
          toast.error('Assignació no trobada.');
          router.push('/centro/assignacions');
          return;
        }
        setAssignacio(found);
        setProf1Id(found.prof1_id?.toString() || '');
        setProf2Id(found.prof2_id?.toString() || '');
        
        // Fetch all professors from center
        const resProfs = await api.get(`/professors/centre/${currentUser.id_centre}`);
        setProfessors(resProfs.data || []);
      } catch (error) {
        console.error("Error fetching designation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSave = async () => {
    if (!prof1Id || !prof2Id) {
      toast.error('Has de designar dos professors responsables.');
      return;
    }

    if (prof1Id === prof2Id) {
      toast.error('Els dos professors han de ser persones diferents.');
      return;
    }

    try {
      setLoading(true);
      const api = getApi();
      
      await api.patch(`/assignacions/checklist/designate-profs/${id}`, {
        prof1_id: parseInt(prof1Id),
        prof2_id: parseInt(prof2Id)
      });
      
      toast.success('Professors designats correctament.');
      router.push('/centro/assignacions');
    } catch (error) {
      toast.error('Error al desar la designació.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !assignacio) return <Loading fullScreen message="Carregant designació..." />;

  return (
    <DashboardLayout 
      title={`Designar Professors: ${assignacio.taller?.titol}`} 
      subtitle="Designa els dos professors referents que es faran responsables del seguiment."
    >
      <div className="max-w-2xl mx-auto pb-20">
        <div className="bg-white border shadow-sm p-10">
          <div className="mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-gray-200"></span>
              Selecció de Referents
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Professor/a Principal</label>
                <select 
                  value={prof1Id}
                  onChange={(e) => setProf1Id(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 outline-none rounded-none transition-all font-bold text-gray-800"
                >
                  <option value="">Selecciona...</option>
                  {professors.map(p => (
                    <option key={p.id_professor} value={p.id_professor}>{p.nom} ({p.contacte})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Professor/a Segon/a</label>
                <select 
                  value={prof2Id}
                  onChange={(e) => setProf2Id(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 outline-none rounded-none transition-all font-bold text-gray-800"
                >
                  <option value="">Selecciona...</option>
                  {professors.map(p => (
                    <option key={p.id_professor} value={p.id_professor}>{p.nom} ({p.contacte})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`flex-1 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all ${
                loading ? 'bg-gray-100 text-gray-300' : 'bg-blue-900 text-white hover:bg-black'
              }`}
            >
              {loading ? 'Guardant...' : 'Confirmar Designació'}
            </button>
            <button 
              onClick={() => router.back()}
              className="px-10 bg-white text-gray-400 py-5 font-black uppercase text-xs tracking-widest border border-gray-100 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-orange-50 border-l-4 border-orange-500 text-orange-800 text-xs font-bold leading-relaxed">
          <p className="uppercase tracking-widest mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            Requisit Obligatori
          </p>
          <p>
            És necessari designar dos professors per garantir que sempre hi hagi un referent disponible per a l'alumnat i per a les comunicacions amb el CEB.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
