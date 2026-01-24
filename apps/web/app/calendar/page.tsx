"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, CalendarEvent } from "@iter/ui";
import getApi from "@/services/api";
import Loading from "@/components/Loading";

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeFase, setActiveFase] = useState<any>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Overlay states
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = getApi();
        const [eventsRes, phasesRes] = await Promise.all([
          api.get("/calendar"),
          api.get("/fases")
        ]);

        const phasesData = phasesRes.data.data;

        const getPhaseColor = (nom: string) => {
          const n = nom.toLowerCase();
          if (n.includes("solicitud") || n.includes("sol·licitud")) return "bg-consorci-darkBlue text-white";
          if (n.includes("planificació") || n.includes("planificación")) return "bg-consorci-actionBlue text-white";
          if (n.includes("execució") || n.includes("ejecución")) return "bg-consorci-pinkRed text-white";
          if (n.includes("cierre") || n.includes("tancament") || n.includes("evaluación") || n.includes("avaluació")) return "bg-consorci-beige text-[#00426B]";
          return "bg-consorci-darkBlue text-white";
        };

        const phaseEvents = phasesData.map((f: any) => ({
          id: `fase-${f.id_fase}`,
          title: `Fase: ${f.nom}`,
          date: f.data_inici,
          endDate: f.data_fi,
          type: 'milestone',
          description: f.descripcio,
          colorClass: getPhaseColor(f.nom)
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

  if (authLoading) return <Loading fullScreen message="Sincronitzant el teu calendari..." />;

  return (
    <DashboardLayout
      title="Calendari Iter"
      subtitle="Visualitza totes les fites, tallers i terminis en un calendari complet."
    >
      <div className="w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div className="text-[10px] font-black text-[#00426B] uppercase tracking-widest">
            {activeFase ? `Fase Actual: ${activeFase.nom}` : "Sincronitzant fases..."}
          </div>
          <button 
            onClick={() => setIsLegendOpen(true)}
            className="px-4 py-2 border border-[#00426B] text-[#00426B] text-[10px] font-black uppercase tracking-widest hover:bg-[#00426B] hover:text-white transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Veure Llegenda
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="bg-white border border-gray-200">
            <Calendar
              events={events}
              onEventClick={(e: CalendarEvent) => setSelectedEvent(e)}
            />
          </div>
        )}

        {/* Legend Overlay */}
        {isLegendOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00426B]/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border border-[#00426B] w-full max-w-sm p-8 shadow-2xl relative">
              <button 
                onClick={() => setIsLegendOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#00426B] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h3 className="text-sm font-black text-[#00426B] uppercase tracking-widest border-b border-gray-100 pb-4 mb-6">
                Llegenda de Colors
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-consorci-lightBlue"></div>
                  <div>
                    <span className="block text-xs font-black text-gray-800 uppercase tracking-tight">Assignació</span>
                    <span className="text-[10px] text-gray-400 font-medium">Període total del taller al centre.</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-consorci-yellow"></div>
                  <div>
                    <span className="block text-xs font-black text-gray-800 uppercase tracking-tight">Sessió de Taller</span>
                    <span className="text-[10px] text-gray-400 font-medium">Dia i hora concrets de l'activitat.</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                   <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Fases del Programa</span>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#00426B]"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Solicitud e Inscripción</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#0775AB]"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Planificación y Asignación</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#F26178]"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Ejecución y Seguimiento</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#E0C5AC]"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Cierre y Evaluación</span>
                      </div>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setIsLegendOpen(false)}
                className="w-full mt-8 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-colors"
              >
                Entès
              </button>
            </div>
          </div>
        )}

        {/* Event Details Overlay */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00426B]/20 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            <div className="bg-white border border-[#00426B] w-full max-w-md p-8 shadow-2xl relative">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#00426B] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Detalls de l'esdeveniment</div>
                <h3 className="text-xl font-black text-[#00426B] leading-tight uppercase tracking-tight">{selectedEvent.title}</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-600">
                  <svg className="w-4 h-4 text-[#00426B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-bold">
                    {new Date(selectedEvent.date).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                {selectedEvent.metadata?.hora && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg className="w-4 h-4 text-[#00426B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-bold">{selectedEvent.metadata.hora}</span>
                  </div>
                )}

                {selectedEvent.metadata?.centre && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg className="w-4 h-4 text-[#00426B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs font-bold">{selectedEvent.metadata.centre}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="p-4 bg-gray-50 border-l-4 border-[#00426B]">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                      "{selectedEvent.description}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-3 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Tancar
                </button>
                {(selectedEvent.metadata?.id_assignacio) && (
                  <button 
                    onClick={() => {
                      const baseUrl = user?.rol.nom_rol === 'ADMIN' ? '/admin/assignacions' : '/centro/assignacions';
                      window.location.href = `${baseUrl}/${selectedEvent.metadata.id_assignacio}`;
                    }}
                    className="flex-1 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-colors"
                  >
                    Veure Detalls
                  </button>
                )}
                {!selectedEvent.metadata?.id_assignacio && (
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0775AB] transition-colors"
                  >
                    D'acord
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
