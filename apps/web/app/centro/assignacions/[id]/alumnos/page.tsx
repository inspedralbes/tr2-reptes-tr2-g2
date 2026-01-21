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

        // Fetch assignment with inscriptions
        const resAssig = await api.get(`/assignacions/centre/${currentUser.id_centre}`);
        const found = resAssig.data.find((a: any) => a.id_assignacio === parseInt(id));

        if (!found) {
          alert('Assignació no trobada o no autoritzada.');
          router.push('/centro/assignacions');
          return;
        }
        setAssignacio(found);

        // Pre-populate selectedIds from existing inscriptions
        if (found.inscripcions) {
          setSelectedIds(found.inscripcions.map((i: any) => i.id_alumne));
        }

        // Fetch all students from center
        const resAlumnes = await api.get(`/alumnes/centre/${currentUser.id_centre}`);
        setAlumnes(resAlumnes.data || []);
      } catch (error) {
        console.error("Error fetching nominal register data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const toggleAlumne = (idAlumne: number) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(idAlumne);
      const plazasMax = assignacio?.peticio?.alumnes_aprox || 0;

      if (!isSelected && prev.length >= plazasMax) {
        alert(`Has arribat al límit de ${plazasMax} places sol·licitades.`);
        return prev;
      }

      return isSelected
        ? prev.filter(i => i !== idAlumne)
        : [...prev, idAlumne];
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const api = getApi();
      // 1. Save inscriptions (Nominal Register)
      await api.post(`/assignacions/${id}/inscripcions`, { ids_alumnes: selectedIds });

      // 2. Update Checklist Item etc.
      alert('Registre Nominal desat amb èxit.');
      router.push('/centro/assignacions');
    } catch (error) {
      alert('Error al desar el registre nominal.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const api = getApi();
      const response = await api.post(`/assignacions/${id}/enrollment/excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      window.location.reload(); // Refresh to show new students
    } catch (err: any) {
      alert('Error al carregar l\'Excel: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !assignacio) return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="animate-spin h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );

  const plazasAsignadas = assignacio?.peticio?.alumnes_aprox || 0;
  const isFull = selectedIds.length === plazasAsignadas;

  return (
    <DashboardLayout
      title={`Registre Nominal: ${assignacio.taller?.titol}`}
      subtitle={`En aquesta fase has de designar els ${plazasAsignadas} alumnes que participaran.`}
    >
      <div className="w-full pb-20">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Assignació d'Alumnes</h2>
          <div className="flex gap-2">
            <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Importar Excel
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleExcelUpload} disabled={loading} />
            </label>
            <button
              onClick={() => router.push('/centro/alumnos')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Alumne
            </button>
          </div>
        </div>

        {/* Header de Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 border shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Places Assignades</span>
            <span className="text-3xl font-black text-blue-900">{plazasAsignadas}</span>
          </div>
          <div className="bg-white p-6 border shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Seleccionats</span>
            <span className={`text-3xl font-black ${isFull ? 'text-green-600' : 'text-blue-600'}`}>{selectedIds.length}</span>
          </div>
          <div className="bg-white p-6 border shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Restants</span>
            <span className="text-3xl font-black text-gray-200">{Math.max(0, plazasAsignadas - selectedIds.length)}</span>
          </div>
        </div>

        <div className="bg-white border shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-8 py-4 border-b flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Llistat d'Alumnat del Centre</h3>
            {isFull && (
              <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-3 py-1 animate-pulse">
                Cupo Completat
              </span>
            )}
          </div>

          <div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
            {alumnes.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-sm text-gray-400 italic">No s'han trobat alumnes registrats al centre.</p>
                <button
                  onClick={() => router.push('/centro/alumnos')}
                  className="mt-4 text-xs font-bold text-blue-600 hover:underline"
                >
                  + Anar a Gestió d'Alumnes
                </button>
              </div>
            ) : (
              alumnes.map(alum => {
                const isSelected = selectedIds.includes(alum.id_alumne);
                return (
                  <div
                    key={alum.id_alumne}
                    onClick={() => toggleAlumne(alum.id_alumne)}
                    className={`px-8 py-5 flex justify-between items-center cursor-pointer transition-all ${isSelected
                        ? 'bg-blue-50/50'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 flex items-center justify-center font-black italic text-sm transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-300'
                        }`}>
                        {alum.nom.charAt(0)}{alum.cognoms.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold transition-colors ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                          {alum.nom} {alum.cognoms}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                          IDALU: {alum.idalu} <span className="mx-2 text-gray-200">|</span> CURS: {alum.curs}
                        </p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200'
                      }`}>
                      {isSelected && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-8 bg-gray-50 border-t flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={loading || selectedIds.length === 0}
              className={`flex-1 py-4 font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 ${loading || selectedIds.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-900 text-white hover:bg-black active:scale-95'
                }`}
            >
              {loading ? 'Processant...' : 'Confirmar Registre Nominal'}
              {!loading && <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
            </button>
            <button
              onClick={() => router.back()}
              className="px-10 bg-white text-gray-400 py-4 font-black uppercase text-xs tracking-widest border border-gray-200 hover:bg-gray-100 transition-all"
            >
              Tornar
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50/50 border-l-4 border-blue-900 text-blue-900 text-xs font-bold flex gap-4 items-start">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="uppercase tracking-widest mb-1">Nota sobre la Fase 2</p>
            <p className="font-normal text-blue-800/80 leading-relaxed">
              D'acord amb la normativa, el registre nominal ha de coincidir amb el nombre de places sol·licitades en la Fase 1. Aquestes dades s'utilizaren per a la certificació final.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
