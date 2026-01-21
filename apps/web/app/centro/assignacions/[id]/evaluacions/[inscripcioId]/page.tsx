'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, User } from '@/lib/auth';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import { avaluacioService } from '@/services/avaluacioService';
import getApi from '@/services/api';

export default function StudentEvaluationFormPage({ params }: { params: Promise<{ id: string, inscripcioId: string }> }) {
    const { id, inscripcioId } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [inscripcio, setInscripcio] = useState<any>(null);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const router = useRouter();

    // Form State
    const [form, setForm] = useState({
        percentatge_asistencia: 100,
        numero_retards: 0,
        observacions: '',
        competencies: [] as { id_competencia: number; puntuacio: number }[]
    });

    // Voice State
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        const fetchData = async () => {
            try {
                const api = getApi();
                // 1. Fetch competencies
                const resComp = await avaluacioService.getCompetencies();
                setCompetencies(resComp.data);

                // 2. Fetch existing evaluation/student info
                // We look for the assignment first to verify access, then the specific inscription
                const resAssig = await api.get(`/assignacions/centre/${currentUser.id_centre}`);
                const assignment = resAssig.data.find((a: any) => a.id_assignacio === parseInt(id));

                if (!assignment) {
                    alert('Assignació no trobada.');
                    router.push('/centro/assignacions');
                    return;
                }

                const ins = assignment.inscripcions.find((i: any) => i.id_inscripcio === parseInt(inscripcioId));
                if (!ins) {
                    alert('Inscripció no trobada.');
                    router.push(`/centro/assignacions/${id}/evaluacions`);
                    return;
                }
                setInscripcio(ins);

                // 3. If evaluation exists, pre-fill form
                const resEval = await avaluacioService.getAvaluacioInscripcio(parseInt(inscripcioId));
                if (resEval.data) {
                    const evalData = resEval.data;
                    setForm({
                        percentatge_asistencia: evalData.percentatge_asistencia,
                        numero_retards: evalData.numero_retards,
                        observacions: evalData.observacions || '',
                        competencies: evalData.competencies?.map((c: any) => ({
                            id_competencia: c.id_competencia,
                            puntuacio: c.puntuacio
                        })) || []
                    });
                } else {
                    // Initialize competencies with 0/null
                    setForm(prev => ({
                        ...prev,
                        competencies: resComp.data.map((c: any) => ({ id_competencia: c.id_competencia, puntuacio: 3 })) // default sufficient
                    }));
                }

            } catch (error) {
                console.error("Error fetching evaluation data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, inscripcioId, router]);

    const handleRatingChange = (id_competencia: number, puntuacio: number) => {
        setForm(prev => ({
            ...prev,
            competencies: prev.competencies.map(c =>
                c.id_competencia === id_competencia ? { ...c, puntuacio } : c
            )
        }));
    };

    const startVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("El seu navegador no suporta el reconeixement de veu.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ca-ES'; // O es-ES según prefiera
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setForm(prev => ({ ...prev, observacions: prev.observacions + " " + transcript }));
        };

        recognition.start();
    };

    const handleAIAnalysis = async () => {
        if (!form.observacions.trim()) return;
        setAnalyzing(true);
        try {
            const res = await avaluacioService.analyzeObservations(form.observacions);
            const { suggestedScore, summary } = res.data;
            if (confirm(`L'IA suggereix una puntuació mitjana de ${suggestedScore}. Resum de l'anàlisi: ${summary}\nVols moure tota l'avaluació a aquest nivell?`)) {
                setForm(prev => ({
                    ...prev,
                    competencies: prev.competencies.map(c => ({ ...c, puntuacio: suggestedScore }))
                }));
            }
        } catch (err) {
            alert("Error en l'anàlisi de l'IA.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await avaluacioService.upsetAvaluacio({
                id_inscripcio: parseInt(inscripcioId),
                ...form
            });
            alert("Avaluació desada amb èxit.");
            router.push(`/centro/assignacions/${id}/evaluacions`);
        } catch (err) {
            alert("Error al desar l'avaluació.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !inscripcio) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <div className="animate-spin h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    const competenciesT = competencies.filter(c => c.tipus === 'TECNICA');
    const competenciesG = competencies.filter(c => c.tipus === 'TRANSVERSAL');

    return (
        <DashboardLayout
            title={`Avaluació d'Alumne`}
            subtitle={`${inscripcio.alumne?.nom} ${inscripcio.alumne?.cognoms}`}
        >
            <div className="w-full pb-20">
                <button
                    onClick={() => router.push(`/centro/assignacions/${id}/evaluacions`)}
                    className="mb-8 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Tornar al llistat
                </button>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Secció Seguiment */}
                    <section className="bg-white p-8 border shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8">Seguiment i Assistència</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Percentatge d'Assistència (%)</label>
                                <div className="flex items-center gap-6">
                                    <input
                                        type="range" min="0" max="100"
                                        value={form.percentatge_asistencia}
                                        onChange={(e) => setForm({ ...form, percentatge_asistencia: parseInt(e.target.value) })}
                                        className="flex-1 accent-blue-900"
                                    />
                                    <span className="text-2xl font-black text-blue-900 w-16">{form.percentatge_asistencia}%</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Nombre de Retards</label>
                                <div className="flex items-center gap-6">
                                    <button type="button" onClick={() => setForm({ ...form, numero_retards: Math.max(0, form.numero_retards - 1) })} className="w-10 h-10 border-2 font-black text-xl hover:bg-gray-100">-</button>
                                    <span className="text-2xl font-black text-gray-900">{form.numero_retards}</span>
                                    <button type="button" onClick={() => setForm({ ...form, numero_retards: form.numero_retards + 1 })} className="w-10 h-10 border-2 font-black text-xl hover:bg-gray-100">+</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Secció Competències */}
                    <section className="bg-white p-8 border shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8">Avaluació Competencial (Escala 1-5)</h3>

                        <div className="space-y-12">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    Competències Tècniques
                                </h4>
                                <div className="space-y-6">
                                    {competenciesT.map(c => (
                                        <div key={c.id_competencia} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <div className="mb-4 md:mb-0">
                                                <p className="font-bold text-gray-900">{c.nom}</p>
                                                <p className="text-[10px] text-gray-400 max-w-sm">{c.descripcio}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => handleRatingChange(c.id_competencia, v)}
                                                        className={`w-10 h-10 border-2 font-black transition-all ${form.competencies.find(comp => comp.id_competencia === c.id_competencia)?.puntuacio === v
                                                            ? 'bg-blue-900 border-blue-900 text-white shadow-md scale-110'
                                                            : 'bg-white border-gray-200 text-gray-300 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    Competències Transversals
                                </h4>
                                <div className="space-y-6">
                                    {competenciesG.map(c => (
                                        <div key={c.id_competencia} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <div className="mb-4 md:mb-0">
                                                <p className="font-bold text-gray-900">{c.nom}</p>
                                                <p className="text-[10px] text-gray-400 max-w-sm">{c.descripcio}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => handleRatingChange(c.id_competencia, v)}
                                                        className={`w-10 h-10 border-2 font-black transition-all ${form.competencies.find(comp => comp.id_competencia === c.id_competencia)?.puntuacio === v
                                                            ? 'bg-blue-900 border-blue-900 text-white shadow-md scale-110'
                                                            : 'bg-white border-gray-200 text-gray-300 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Secció Observacions i IA */}
                    <section className="bg-white p-8 border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Observacions</h3>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={startVoiceRecognition}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 border-2 transition-all ${isListening ? 'bg-red-50 border-red-500 text-red-500 animate-pulse' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    {isListening ? 'Escoltant...' : 'Dictar per Veu'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAIAnalysis}
                                    disabled={analyzing || !form.observacions.trim()}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    {analyzing ? 'Analitzant...' : 'Anàlisi IA'}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-40 border-2 p-6 outline-none focus:border-blue-900 transition-colors text-sm italic"
                            placeholder="Escriu les teves observacions o utilitza el dictat per veu..."
                            value={form.observacions}
                            onChange={(e) => setForm({ ...form, observacions: e.target.value })}
                        />
                    </section>

                    {/* Footer d'accions */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-900 text-white py-4 font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Desant...' : 'Confirmar Avaluació'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-12 bg-white border font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all"
                        >
                            Cancel·lar
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
