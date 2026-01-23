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

  const getStatusText = (completat: boolean) => completat ? 'COMPLETAT' : 'PENDENT';

  const getStatusLabel = (estat: string) => {
    const maps: Record<string, string> = {
      'DATA_ENTRY_PENDING': 'PENDENT DE GESTIÓ',
      'PROVISIONAL': 'PROVISIONAL',
      'VALIDATED': 'CONFIRMAT',
      'EN_CURS': 'EN EXECUCIÓ',
      'FINALITZADA': 'FINALITZAT'
    };
    return maps[estat] || estat.replace('_', ' ');
  };

  return (
    <DashboardLayout 
      title={`GESTIÓ: ${assignacio.taller?.titol}`} 
      subtitle={
        <div className="flex items-center gap-3 mt-4">
          <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-2 border-gray-100 bg-white text-consorci-darkBlue">
            ESTAT: {getStatusLabel(assignacio.estat)}
          </div>
          {assignacio.taller?.modalitat === 'C' && (
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-consorci-darkBlue text-white">
              MODALITAT C
            </div>
          )}
        </div>
      }
    >
      <div className="pb-20">
        <div className="space-y-8">
          {/* SECCIÓ: DOCUMENTACIÓ I CHECKLIST - FULL WIDTH */}
          <section className="bg-white border-2 border-gray-100 p-8 shadow-sm">
            <h3 className="header-label mb-8">
              Passos de Planificació i Documentació
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignacio.checklist?.map((item: any) => (
                <div key={item.id_checklist} className="flex items-center gap-6 p-8 border-2 border-gray-100 bg-white hover:border-consorci-lightBlue transition-all cursor-pointer group"
                    onClick={() => {
                      if (item.pas_nom.includes('Profesores')) router.push(`/centro/assignacions/${id}/profesores`);
                      else if (item.pas_nom.includes('Registro')) router.push(`/centro/assignacions/${id}/alumnos`);
                      else if (item.pas_nom.includes('Autorizaciones')) router.push(`/centro/assignacions/${id}/autoritzacions`);
                    }}
                >
                  {/* Status Indicator */}
                  <div className="shrink-0">
                    <div className={`w-10 h-10 flex items-center justify-center border-2 transition-colors ${
                      item.completat ? 'bg-consorci-darkBlue border-consorci-darkBlue' : 'bg-white border-gray-100 group-hover:border-consorci-lightBlue'
                    }`}>
                      {item.completat ? (
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 bg-gray-200 group-hover:bg-consorci-lightBlue"></div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-consorci-darkBlue">
                      {item.pas_nom.replace('(Excel)', '').trim()}
                    </h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${item.completat ? 'text-green-600' : 'text-orange-500'}`}>
                      {getStatusText(item.completat)}
                    </p>
                  </div>

                  {item.completat && (
                    <div className="flex items-center gap-2 text-green-700 font-bold text-[10px] uppercase">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Validat</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
