'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

export default function AuthorizationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [assignacio, setAssignacio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const resAssig = await api.get(`/assignacions/${id}`);
        setAssignacio(resAssig.data);
      } catch (error) {
        toast.error('Error al carregar les dades.');
        router.push(`/centro/assignacions/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleToggleCompliance = async (idInscripcio: number, field: string, value: boolean) => {
    try {
      const api = getApi();
      await api.post(`/assignacions/${id}/compliance`, {
        idAlumne: idInscripcio,
        [field]: value
      });
      
      // Update local state for immediate feedback
      setAssignacio((prev: any) => ({
        ...prev,
        inscripcions: prev.inscripcions.map((ins: any) => 
          ins.id_inscripcio === idInscripcio ? { ...ins, [field]: value } : ins
        )
      }));
    } catch (error) {
      toast.error('Error al actualizar el document.');
    }
  };

  const handleConfirmAll = async () => {
    try {
      setSaving(true);
      const api = getApi();
      await api.post(`/assignacions/${id}/confirm-legal`);
      toast.success('Registre CEB confirmat correctament.');
      router.push(`/centro/assignacions/${id}`);
    } catch (error) {
      toast.error('Error al confirmar el registre.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !assignacio) return <Loading fullScreen message="Carregant autoritzacions..." />;

  return (
    <DashboardLayout 
      title={`AUTORITZACIONS: ${assignacio.taller?.titol}`} 
      subtitle="Gestiona el compliment legal i les autoritzacions de l'alumnat."
    >
      <div className="w-full pb-20">
        <section className="card-institutional">
          <h3 className="header-label mb-8">Estat de la Documentació</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B]">Alumne</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-center">Acord Pedagògic</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-center">Drets d'Imatge</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00426B] text-center">Mobilitat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignacio.inscripcions?.map((ins: any) => (
                  <tr key={ins.id_inscripcio} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-consorci-darkBlue uppercase tracking-tight">
                        {ins.alumne?.nom} {ins.alumne?.cognoms}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!ins.acord_pedagogic} 
                        onChange={(e) => handleToggleCompliance(ins.id_inscripcio, 'acord_pedagogic', e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-200 text-consorci-darkBlue focus:ring-0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!ins.drets_imatge} 
                        onChange={(e) => handleToggleCompliance(ins.id_inscripcio, 'drets_imatge', e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-200 text-consorci-darkBlue focus:ring-0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!ins.autoritzacio_mobilitat} 
                        onChange={(e) => handleToggleCompliance(ins.id_inscripcio, 'autoritzacio_mobilitat', e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-200 text-consorci-darkBlue focus:ring-0"
                      />
                    </td>
                  </tr>
                ))}
                {(!assignacio.inscripcions || assignacio.inscripcions.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      No hi ha alumnes inscrits en aquesta assignació.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-100 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConfirmAll}
              disabled={saving || !assignacio.inscripcions?.length}
              className="btn-primary flex-1 py-5"
            >
              {saving ? 'PROCESSANT...' : 'CONFIRMAR REGISTRE CEB'}
            </button>
            <button
              onClick={() => router.push(`/centro/assignacions/${id}`)}
              className="btn-secondary px-12"
            >
              TORNAR
            </button>
          </div>
        </section>

        <div className="mt-8 p-8 bg-blue-50/50 border-l-4 border-consorci-lightBlue text-consorci-darkBlue text-[11px] font-bold flex gap-6 items-start">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="uppercase tracking-widest mb-2 font-black">Recordatori Legal</p>
            <p className="font-normal text-gray-600 leading-relaxed max-w-4xl">
              La confirmació del registre implica que el centre disposa i ha validat tota la documentació legal necessària (Acord pedagògic, autoritzacions de mobilitat i drets d'imatge) signada pels pares o tutors legals. Aquesta documentació pot ser requerida per una auditoria del Consorci.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
