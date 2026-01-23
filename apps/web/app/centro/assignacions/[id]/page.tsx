'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignacio, setAssignacio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allCenterProfs, setAllCenterProfs] = useState<any[]>([]);
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
        const [resAssig, resProfs] = await Promise.all([
          api.get(`/assignacions/${id}`),
          api.get(`/professors/centre/${currentUser.id_centre}`)
        ]);
        
        setAssignacio(resAssig.data);
        setAllCenterProfs(resProfs.data || []);
      } catch (error) {
        toast.error('Error al carregar les dades.');
        router.push('/centro/assignacions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleAddStaff = async (idUsuari: number) => {
    try {
      const api = getApi();
      await api.post(`/assignacions/${id}/staff`, { idUsuari, esPrincipal: false });
      // Refresh
      const res = await api.get(`/assignacions/${id}`);
      setAssignacio(res.data);
      toast.success('Professor afegit a l\'equip.');
    } catch (error) {
      toast.error('Error al afegir el professor.');
    }
  };

  const handleRemoveStaff = async (idUsuari: number) => {
    try {
      const api = getApi();
      await api.delete(`/assignacions/${id}/staff/${idUsuari}`);
      // Refresh
      const res = await api.get(`/assignacions/${id}`);
      setAssignacio(res.data);
      toast.success('Professor eliminat de l\'equip.');
    } catch (error) {
      toast.error('Error al eliminar el professor.');
    }
  };

  if (loading || !assignacio) return <Loading fullScreen message="Carregant detalls..." />;

  const getStatusColor = (completat: boolean) => completat ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-300';
  const getStatusText = (completat: boolean) => completat ? 'COMPLETAT' : 'PENDENT';

  return (
    <DashboardLayout 
      title={`Gestió: ${assignacio.taller?.titol}`} 
      subtitle={`Estat actual: ${assignacio.estat === 'En_curs' ? 'En curs' : assignacio.estat}`}
    >
      <div className="flex flex-col xl:flex-row gap-8 pb-20">
        
        {/* COLUMNA ESQUERRA: Checklist i Info */}
        <div className="flex-1 space-y-8">
          
          {/* SECCIÓ: DOCUMENTACIÓ I CHECKLIST */}
          <section className="bg-white border p-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
              <span className="w-10 h-px bg-gray-200"></span>
              Checklist de Documentació i Tràmits
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {assignacio.checklist?.map((item: any) => (
                <div key={item.id_checklist} className="flex items-center gap-6 p-6 border group hover:border-blue-200 transition-all">
                  {/* El "Cuadrado" més visible */}
                  <div className={`w-12 h-12 border-2 flex items-center justify-center shrink-0 transition-colors ${getStatusColor(item.completat)}`}>
                    {item.completat && (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-black text-xs uppercase tracking-widest text-[#00426B] mb-1">{item.pas_nom}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-tight ${item.completat ? 'text-green-600' : 'text-orange-500'}`}>
                      {getStatusText(item.completat)}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {!item.completat ? (
                      <button 
                        onClick={() => router.push(item.pas_nom.includes('Profesores') ? `/centro/assignacions/${id}/profesores` : item.pas_nom.includes('Registro') ? `/centro/assignacions/${id}/alumnos` : '#')}
                        className="px-6 py-3 bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Completar
                      </button>
                    ) : (
                      <span className="px-6 py-3 bg-gray-50 text-gray-300 text-[10px] font-black uppercase tracking-widest">OK</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓ: EQUIP DOCENT (EL NOSTRE NOU REPTE) */}
          <section className="bg-white border p-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
              <span className="w-10 h-px bg-gray-200"></span>
              Equip Docent del Taller
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignacio.professors?.map((p: any) => (
                  <div key={p.id_usuari} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-[#00426B]">{p.usuari?.nom_complet}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Personal Docent</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveStaff(p.id_usuari)}
                      className="text-red-400 hover:text-red-600 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Selector per afegir */}
              <div className="mt-8 pt-8 border-t border-dashed">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Afegir Professor a l'Equip</label>
                <div className="flex gap-4">
                  <select 
                    id="prof-selector"
                    className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold text-xs"
                  >
                    <option value="">Selecciona un professor del centre...</option>
                    {allCenterProfs
                      .filter(p => !assignacio.professors?.some((sp: any) => sp.id_usuari === p.id_usuari))
                      .map(p => (
                        <option key={p.id_professor} value={p.id_usuari}>{p.nom} ({p.especialitat || 'Docent'})</option>
                      ))
                    }
                  </select>
                  <button 
                    onClick={() => {
                      const select = document.getElementById('prof-selector') as HTMLSelectElement;
                      if (select.value) handleAddStaff(parseInt(select.value));
                    }}
                    className="px-10 bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-900 transition-all"
                  >
                    Afegir a l'Equip
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DRETA: Info i Referents */}
        <div className="w-full xl:w-96 space-y-8">
           {/* CARD: REFERENTS (ELS QUE NO SÓN L'EQUIP) */}
           <div className="bg-[#00426B] p-10 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" /></svg>
             </div>
             
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white/50">Professors Referents (Admin)</h4>
             
             <div className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-white/40 mb-1">Principal</span>
                  <span className="font-bold text-sm tracking-tight">{assignacio.prof1?.nom || 'No assignat'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-white/40 mb-1">Segon Referent</span>
                  <span className="font-bold text-sm tracking-tight">{assignacio.prof2?.nom || 'No assignat'}</span>
                </div>
             </div>

             <button 
              onClick={() => router.push(`/centro/assignacions/${id}/profesores`)}
              className="mt-10 w-full py-4 border border-white/20 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
             >
                Modificar Referents
             </button>
           </div>

           {/* CARD: ALUMNES */}
           <div className="bg-white border p-10">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Registre Nominal</h4>
                <span className="text-2xl font-black italic text-[#4197CB]">{assignacio.inscripcions?.length || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-8">Alumnes inscrits oficialment al taller.</p>
              
              <button 
                onClick={() => router.push(`/centro/assignacions/${id}/alumnos`)}
                className="w-full py-4 bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest"
              >
                Inscriure Alumnat
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
