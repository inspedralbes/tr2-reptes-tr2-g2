'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME, PHASES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';

export default function AssignacionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [assignacions, setAssignacions] = useState<any[]>([]);
  const [fases, setFases] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.rol.nom_rol !== 'COORDINADOR') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Fetch asignaciones
    if (currentUser.id_centre) {
      const api = getApi();

      api.get(`/assignacions/centre/${currentUser.id_centre}`)
        .then(res => setAssignacions(res.data));

      api.get("/fases")
        .then(res => setFases(res.data.data));
    }
  }, []);

  const isPhaseActive = (nomFase: string) => {
    const fase = fases.find(f => f.nom === nomFase);
    return fase ? fase.activa : false;
  };

  if (!user) return null;

  return (
    <DashboardLayout
      title="Talleres Asignados"
      subtitle="Aquí puedes consultar el estado de tus talleres y el centro referente."
    >
      <div className="w-full">
        {assignacions.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 p-8 rounded-xl text-center">
            <p className="text-blue-700">Aún no se han comunicado las asignaciones oficiales (previsto para el 20 de octubre).</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {assignacions.map(a => (
              <div key={a.id_assignacio} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1 block">Taller Iter</span>
                    <h3 className="text-xl font-bold">{a.taller?.titol}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.estat === 'En curs' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {a.estat}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h5m-5 4h5m-4-10H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h5m-5 4h5m-4-10H5m14 0h2" />
                    </svg>
                    <span>Centro Referente: <strong>{a.peticio?.centre?.nom || 'Pendent d\'assignar'}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Fecha inicio: {a.data_inici ? new Date(a.data_inici).toLocaleDateString() : 'Pendiente'}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="text-sm font-bold mb-3 uppercase tracking-tight text-gray-400">Progreso de Validación</h4>
                  <div className="space-y-2">
                    {a.checklist?.map((item: any) => (
                      <div key={item.id_checklist} className="flex items-center gap-3 text-sm">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${item.completat ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                          }`}>
                          {item.completat && <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                        </div>
                        <span className={item.completat ? 'text-gray-400 line-through' : 'text-gray-700'}>{item.pas_nom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => isPhaseActive(PHASES.PLANIFICACION) && router.push(`/centro/assignacions/${a.id_assignacio}/profesores`)}
                    disabled={!isPhaseActive(PHASES.PLANIFICACION)}
                    className={`py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${isPhaseActive(PHASES.PLANIFICACION)
                      ? 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                      }`}
                  >
                    Designar Professors
                  </button>
                  <button
                    onClick={() => isPhaseActive(PHASES.PLANIFICACION) && router.push(`/centro/assignacions/${a.id_assignacio}/alumnos`)}
                    disabled={!isPhaseActive(PHASES.PLANIFICACION)}
                    className={`py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${isPhaseActive(PHASES.PLANIFICACION)
                      ? 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                      }`}
                  >
                    Registro Nominal
                  </button>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => (isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE)) ? router.push(`/centro/assignacions/${a.id_assignacio}/evaluacions`) : alert('Documentació encara no disponible')}
                    className={`w-full py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${(isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE))
                      ? 'border-accent text-accent hover:bg-accent hover:text-white'
                      : 'border-gray-100 text-gray-300'
                      }`}
                  >
                    {(isPhaseActive(PHASES.EJECUCION) || isPhaseActive(PHASES.CIERRE)) ? 'Avaluar Alumnes' : 'Consultar Documentació'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sección de Incidencias (Solo disponible en Fase 3) */}
        {isPhaseActive(PHASES.EJECUCION) && (
          <section className="mt-16 bg-white p-8 border-2 border-red-600 shadow-[8px_8px_0px_0px_rgba(242,97,120,0.1)]">
            <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Gestión de Incidencias y Vacantes</h3>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">
              REPORTAR PROBLEMES DE COMPORTAMENT O SOL·LICITAR PLACES VACANTS.
            </p>

            <div className="flex gap-4">
              <input
                id="incidencia-input"
                type="text"
                placeholder="Descriu el problema..."
                className="flex-1 p-4 border-2 border-gray-100 text-sm font-bold focus:border-red-600 outline-none transition-all"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('incidencia-input') as HTMLInputElement;
                  if (!input.value) return;
                  const api = getApi();
                  await api.post('/assignacions/incidencies', {
                    id_centre: user.id_centre,
                    descripcio: input.value
                  });
                  input.value = '';
                  alert('Incidència reportada. El CEB la revisarà properament.');
                }}
                className="px-8 py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-red-700 transition"
              >
                Reportar
              </button>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
