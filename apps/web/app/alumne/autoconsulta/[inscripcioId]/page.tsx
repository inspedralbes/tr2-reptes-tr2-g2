'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { THEME } from '@iter/shared';
import { avaluacioService } from '@/services/avaluacioService';
import { toast } from 'sonner';

export default function StudentSelfEvaluationPage({ params }: { params: Promise<{ inscripcioId: string }> }) {
    const { inscripcioId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        puntualitat_tasques: 'Sempre',
        respecte_material: 'Sempre',
        interes_aprenentatge: 'Molt',
        autonomia_resolucio: 'Sovint',
        valoracio_experiencia: 8,
        valoracio_docent: 8,
        impacte_vocacional: 'CONSIDERANT',
        millores_personals: '',
        aprenentatges_clau: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await avaluacioService.submitAutoconsulta({
                id_inscripcio: parseInt(inscripcioId),
                ...form
            });
            setSubmitted(true);
        } catch (err) {
            toast.error("Error al enviar l'autoconsulta.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background-page flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-background-surface p-12 text-center border border-border-subtle shadow-xl">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-consorci-darkBlue dark:text-consorci-lightBlue">Gràcies per la teva participació!</h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-8">La teva opinió ens ajuda a millorar el Programa Enginy. Les teves respostes han estat registrades correctament.</p>
                    <button onClick={() => window.close()} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest hover:bg-consorci-darkBlue dark:hover:bg-consorci-lightBlue transition-all">Tancar Finestra</button>
                </div>
            </div>
        );
    }

    const freqOptions = ['Mai', 'Rarament', 'Sovint', 'Sempre'];
    const interestOptions = ['Gairebé gens', 'Una mica', 'Molt', 'Moltíssim'];

    return (
        <div className="min-h-screen bg-background-page py-12 px-4 md:px-0">
            <div className="max-w-3xl mx-auto">
                <header className="mb-12 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-consorci-actionBlue mb-4 block">Programa Enginy</span>
                    <h1 className="text-4xl font-black text-consorci-darkBlue dark:text-consorci-lightBlue uppercase tracking-tighter mb-4">Autoconsulta de l'Alumne</h1>
                    <p className="text-text-secondary max-w-lg mx-auto text-sm">Volem conèixer la teva experiència durant el taller. Sinceritat i detall ens ajudaran molt!</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                    {/* Actitud i Comportament */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Actitud i Comportament</h3>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Has estat puntual en el lliurament de tasques?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {freqOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, puntualitat_tasques: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.puntualitat_tasques === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Has respectat el material i les instal·lacions?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {freqOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, respecte_material: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.respecte_material === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Quin interès has mostrat per l'aprenentatge?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {interestOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, interes_aprenentatge: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.interes_aprenentatge === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">T'has sentit autònom en la resolució de problemes?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {freqOptions.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({ ...form, autonomia_resolucio: opt })} className={`py-4 text-[10px] font-black uppercase border-2 transition-all ${form.autonomia_resolucio === opt ? 'bg-consorci-darkBlue border-consorci-darkBlue text-white' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Satisfacció */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Valoració i Satisfacció</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Experiència global (1-10)</label>
                                <input type="range" min="1" max="10" step="1" value={form.valoracio_experiencia} onChange={(e) => setForm({ ...form, valoracio_experiencia: parseInt(e.target.value) })} className="w-full accent-consorci-darkBlue" />
                                <div className="flex justify-between text-[10px] font-black text-text-muted uppercase"><span>Pobre</span><span className="text-2xl text-consorci-darkBlue dark:text-consorci-lightBlue">{form.valoracio_experiencia}</span><span>Excel·lent</span></div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-text-primary">Qualitat del docent (1-10)</label>
                                <input type="range" min="1" max="10" step="1" value={form.valoracio_docent} onChange={(e) => setForm({ ...form, valoracio_docent: parseInt(e.target.value) })} className="w-full accent-consorci-darkBlue" />
                                <div className="flex justify-between text-[10px] font-black text-text-muted uppercase"><span>Pobre</span><span className="text-2xl text-consorci-darkBlue dark:text-consorci-lightBlue">{form.valoracio_docent}</span><span>Excel·lent</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Impacte Vocacional */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Impacte Vocacional</h3>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-text-primary">T'ha ajudat a decidir-te pel teu futur professional?</label>
                            <div className="flex flex-col gap-4">
                                {['SI', 'NO', 'CONSIDERANT'].map(opt => (
                                    <button key={opt} type="button" onClick={() => setForm({ ...form, impacte_vocacional: opt })} className={`p-4 text-xs font-bold border-2 text-left transition-all ${form.impacte_vocacional === opt ? 'bg-background-subtle border-consorci-darkBlue text-consorci-darkBlue dark:text-consorci-lightBlue' : 'bg-background-surface border-border-subtle text-text-muted hover:border-consorci-lightBlue'}`}>
                                        {opt === 'SI' ? 'Sí, m\'ha aclarat les idees.' : opt === 'NO' ? 'No, ja ho tenia clar o no és per a mi.' : 'Ho estic considerant ara mateix.'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preguntes Obertes */}
                    <div className="bg-background-surface p-10 border border-border-subtle shadow-sm space-y-12">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-10 border-b border-border-subtle pb-4">Feedback Obert</h3>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-text-primary">Què canviaries o milloraries del taller?</label>
                            <textarea value={form.millores_personals} onChange={(e) => setForm({ ...form, millores_personals: e.target.value })} className="w-full h-32 border-2 border-border-subtle bg-background-surface text-text-primary p-6 outline-none focus:border-consorci-darkBlue text-sm italic" placeholder="La teva opinió..." />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-text-primary">Quins són els teus 3 aprenentatges clau?</label>
                            <textarea value={form.aprenentatges_clau} onChange={(e) => setForm({ ...form, aprenentatges_clau: e.target.value })} className="w-full h-32 border-2 border-border-subtle bg-background-surface text-text-primary p-6 outline-none focus:border-consorci-darkBlue text-sm italic" placeholder="1. ... 2. ... 3. ..." />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-consorci-darkBlue text-white py-10 font-black uppercase text-xl tracking-[0.2em] shadow-[0_20px_50px_rgba(0,66,107,0.3)] hover:bg-black active:scale-95 transition-all disabled:opacity-50">
                        {loading ? 'Enviant...' : 'Enviar Autoconsulta'}
                    </button>
                </form>
            </div>
        </div>
    );
}
