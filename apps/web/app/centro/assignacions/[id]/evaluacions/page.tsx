'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import getApi from '@/services/api';

export default function AssignmentEvaluationsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [assignacio, setAssignacio] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || (currentUser.rol.nom_rol !== 'COORDINADOR' && currentUser.rol.nom_rol !== 'ADMIN')) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        const fetchData = async () => {
            try {
                const api = getApi();
                // Fetch assignment with inscriptions and their evaluation status
                const res = await api.get(`/assignacions/centre/${currentUser.id_centre}`);
                const found = res.data.find((a: any) => a.id_assignacio === parseInt(id));

                if (!found) {
                    alert('Assignació no trobada.');
                    router.push('/centro/assignacions');
                    return;
                }
                setAssignacio(found);
            } catch (error) {
                console.error("Error fetching assignment for evaluations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    if (loading || !assignacio) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <div className="animate-spin h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <DashboardLayout
            title={`Avaluació de Competències: ${assignacio.taller?.titol}`}
            subtitle="Qualifica el desempreny de l'alumnat participant en el taller."
        >
            <div className="max-w-4xl mx-auto pb-20">
                <button
                    onClick={() => router.push('/centro/assignacions')}
                    className="mb-8 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Tornar a Assignacions
                </button>

                <div className="bg-white border shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-8 py-4 border-b">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Llistat d'Inscripcions</h3>
                    </div>

                    <div className="divide-y relative">
                        {assignacio.inscripcions?.length === 0 ? (
                            <div className="p-20 text-center">
                                <p className="text-sm text-gray-400 italic">No s'han trobat inscripcions per a aquesta assignació.</p>
                            </div>
                        ) : (
                            assignacio.inscripcions.map((ins: any) => (
                                <div
                                    key={ins.id_inscripcio}
                                    className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-blue-900 flex items-center justify-center font-black italic text-sm text-white shadow-lg">
                                            {ins.alumne?.nom?.charAt(0)}{ins.alumne?.cognoms?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {ins.alumne?.nom} {ins.alumne?.cognoms}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                                                IDALU: {ins.alumne?.idalu}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:block text-right">
                                            {ins.avaluacio_docent ? (
                                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-green-100 text-green-700">Completada</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-orange-100 text-orange-700">Pendent</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => router.push(`/centro/assignacions/${id}/evaluacions/${ins.id_inscripcio}`)}
                                            className="bg-black hover:bg-blue-900 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                                        >
                                            {ins.avaluacio_docent ? 'Veure / Editar' : 'Avaluar'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-8 p-6 bg-gray-100 border-l-4 border-black text-gray-600 text-xs font-bold">
                    <p className="uppercase tracking-widest mb-1">Instruccions d'Avaluació</p>
                    <p className="font-normal leading-relaxed">
                        Recorda que l'avaluació competencial és un requisit indispensable per a la certificació de l'atenció educativa de l'alumne. Has de valorar tant les competències tècniques com les transversals.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
