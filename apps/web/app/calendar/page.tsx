"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, CalendarEvent } from "@enginy/ui";
import getApi from "@/services/api";

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeFase, setActiveFase] = useState<any>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = getApi();
        const [eventsRes, phasesRes] = await Promise.all([
          api.get("/calendar"),
          api.get("/fases")
        ]);
        
        const phasesData = phasesRes.data.data;
        
        // Transform phases into calendar events
        const phaseEvents = phasesData.map((f: any) => ({
          id: `fase-${f.id_fase}`,
          title: `Fase: ${f.nom}`,
          date: f.data_inici,
          endDate: f.data_fi,
          type: 'milestone', // Use milestone color or a new type
          description: f.descripcio
        }));

        setEvents([...eventsRes.data, ...phaseEvents]);
        setActiveFase(phasesData.find((f: any) => f.activa));
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading) return null;

  return (
    <DashboardLayout 
      title="Calendari Enginy" 
      subtitle="Visualitza totes les fites, tallers i terminis en un sol lloc."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {activeFase && (
          <div className="bg-blue-600 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl shadow-blue-900/10 animate-in slide-in-from-top duration-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Fase Actual del Programa</p>
                <h3 className="text-xl font-black">{activeFase.nom}</h3>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Termini de la Fase</p>
              <p className="font-bold text-sm">
                {new Date(activeFase.data_inici).toLocaleDateString()} — {new Date(activeFase.data_fi).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-400 font-bold mt-4 uppercase text-[10px] tracking-widest">Sincronitzant calendari...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Calendar 
                events={events} 
                onEventClick={(e: CalendarEvent) => setSelectedEvent(e)} 
              />
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CFD2D3] mb-8">Llegenda</h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-4 h-4 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110"></div>
                    <span className="text-sm font-bold text-[#00426B]">Fita del Programa</span>
                  </div>
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-4 h-4 bg-[#F26178] rounded-lg shadow-lg shadow-rose-500/20 transition-transform group-hover:scale-110"></div>
                    <span className="text-sm font-bold text-[#00426B]">Termini Límit</span>
                  </div>
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-4 h-4 bg-[#4197CB] rounded-lg shadow-lg shadow-blue-400/20 transition-transform group-hover:scale-110"></div>
                    <span className="text-sm font-bold text-[#00426B]">Taller Assignat</span>
                  </div>
                </div>
              </div>

              {selectedEvent && (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 animate-in slide-in-from-right duration-500">
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Detalls de l'esdeveniment</h4>
                  <h3 className="text-xl font-black text-gray-900 mb-4">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 mb-6 font-bold text-sm">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(selectedEvent.date).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  {selectedEvent.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 italic">"{selectedEvent.description}"</p>
                  )}
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="w-full py-3 bg-gray-50 text-gray-400 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                  >
                    Tancar detalls
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
