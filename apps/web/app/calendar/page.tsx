"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, CalendarEvent } from "@iter/ui";
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
      title="Calendari Iter" 
      subtitle="Visualitza totes les fites, tallers i terminis en un sol lloc."
    >
      <div className="max-w-6xl mx-auto space-y-6">


        {loading ? (
          <div className="py-20 text-center">
            <div className="h-10 w-10 border-b-2 border-consorci-darkBlue mx-auto animate-spin"></div>
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
              <div className="bg-white border border-gray-200">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8">Llegenda</h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-4 h-4 bg-consorci-darkBlue"></div>
                    <span className="text-sm font-bold text-consorci-darkBlue">Fita del Programa</span>
                  </div>
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-4 h-4 bg-consorci-pinkRed"></div>
                    <span className="text-sm font-bold text-consorci-darkBlue">Termini Límit</span>
                  </div>
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-4 h-4 bg-consorci-lightBlue"></div>
                    <span className="text-sm font-bold text-consorci-darkBlue">Taller Assignat</span>
                  </div>
                </div>
              </div>

              {selectedEvent && (
                <div className="bg-white p-8 border border-gray-200">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Detalls de l'esdeveniment</h4>
                  <h3 className="text-xl font-bold text-consorci-darkBlue mb-4">{selectedEvent.title}</h3>
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
                    className="w-full py-3 bg-gray-50 text-gray-400 font-bold border border-gray-200 text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
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
