"use client";

import React, { useState, useEffect } from "react";
import tallerService, { Taller } from "../services/tallerService";
import sectorService, { Sector } from "../services/sectorService";
import WorkshopIcon, { SVG_ICONS } from "./WorkshopIcon";

type CreateWorkshopModalProps = {
  visible: boolean;
  onClose: () => void;
  onWorkshopCreated: (newWorkshop: Taller) => void;
  initialData?: Taller | null;
};

type ScheduleSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

const CreateWorkshopModal = ({
  visible,
  onClose,
  onWorkshopCreated,
  initialData,
}: CreateWorkshopModalProps) => {
  const [titol, setTitol] = useState("");
  const [idSector, setIdSector] = useState<number | "">("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [modalitat, setModalitat] = useState("A");
  const [trimestre, setTrimestre] = useState("1r");
  const [descripcio, setDescripcio] = useState("");
  const [duradaHores, setDuradaHores] = useState("");
  const [placesMaximes, setPlacesMaximes] = useState("");
  const [ubicacioDefecte, setUbicacioDefecte] = useState("");
  const [icona, setIcona] = useState("PUZZLE");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper form state
  const [tempDay, setTempDay] = useState(1);
  const [tempStart, setTempStart] = useState("09:00");
  const [tempEnd, setTempEnd] = useState("11:00");

  const daysMap: Record<number, string> = {
      1: 'Dilluns', 2: 'Dimarts', 3: 'Dimecres', 4: 'Dijous', 5: 'Divendres'
  };

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const data = await sectorService.getAll();
        setSectors(data);
      } catch (err) {
        console.error("Error fetching sectors:", err);
      }
    };
    fetchSectors();
  }, []);

  React.useEffect(() => {
    if (visible && initialData) {
      setTitol(initialData.titol);
      setIdSector(initialData.id_sector || "");
      setModalitat(initialData.modalitat);
      setTrimestre(initialData.trimestre);
      setIcona(initialData.icona || "PUZZLE");
      setDescripcio(initialData.detalls_tecnics?.descripcio || "");
      setDuradaHores(initialData.detalls_tecnics?.durada_hores?.toString() || "");
      setPlacesMaximes(initialData.detalls_tecnics?.places_maximes?.toString() || "");
      setUbicacioDefecte(initialData.detalls_tecnics?.ubicacio_defecte || "");
      
      if (Array.isArray(initialData.dies_execucio) && initialData.dies_execucio.length > 0 && typeof initialData.dies_execucio[0] === 'object') {
          setSchedule(initialData.dies_execucio as any);
      } else {
           setSchedule([]);
      }
    } else if (visible) {
      setTitol("");
      setIdSector("");
      setModalitat("A");
      setTrimestre("1r");
      setIcona("PUZZLE");
      setDescripcio("");
      setDuradaHores("");
      setPlacesMaximes("");
      setUbicacioDefecte("");
      setSchedule([]);
    }
    setError(null);
  }, [visible, initialData]);

  const addScheduleSlot = () => {
      setSchedule([...schedule, { dayOfWeek: tempDay, startTime: tempStart, endTime: tempEnd }]);
  };

  const removeScheduleSlot = (index: number) => {
      const newSchedule = [...schedule];
      newSchedule.splice(index, 1);
      setSchedule(newSchedule);
  };

  const handleSubmit = async () => {
    if (!titol || !modalitat) {
      setError("Els camps marcats amb * són obligatoris.");
      return;
    }
    setLoading(true);
    setError(null);

    const tallerData: Omit<Taller, "_id"> = {
      titol,
      sector: sectors.find(s => s.id_sector === idSector)?.nom || "",
      id_sector: idSector === "" ? undefined : idSector,
      modalitat,
      trimestre,
      icona,
      detalls_tecnics: {
        descripcio,
        durada_hores: parseInt(duradaHores, 10) || 0,
        places_maximes: parseInt(placesMaximes, 10) || 0,
        ubicacio_defecte: ubicacioDefecte,
      },
      dies_execucio: schedule,
      referents_assignats: [],
    };

    try {
      let result;
      if (initialData) {
        result = await tallerService.update(initialData._id, tallerData);
      } else {
        result = await tallerService.create(tallerData);
      }
      onWorkshopCreated(result);
      onClose();
    } catch (err: any) {
      setError(
         "Error al guardar el taller. Comprova les dades."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans transition-all duration-300">
      <div className="bg-white w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gray-50 px-8 py-5 flex justify-between items-center shrink-0 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-[#00426B] uppercase tracking-tight">
              {initialData ? "Editar Taller" : "Nou Taller"}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Configuració del Taller i Horaris Setmanals
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-[#00426B] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* Esquerra: Dades */}
            <div className="md:w-7/12 p-8 overflow-y-auto border-r border-gray-100 custom-scrollbar">
                <section className="mb-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-50 pb-3">Informació General</h3>
                    
                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Títol del Taller <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                value={titol}
                                onChange={(e) => setTitol(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] transition-all placeholder:text-gray-300 outline-none"
                                placeholder="Introdueix el nom del taller..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Sector Professional</label>
                                <select
                                    value={idSector}
                                    onChange={(e) => setIdSector(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] transition-all outline-none appearance-none"
                                >
                                    <option value="">Selecciona un sector...</option>
                                    {sectors.map((sector) => (
                                    <option key={sector.id_sector} value={sector.id_sector}>
                                        {sector.nom}
                                    </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Modalitat <span className="text-red-400">*</span></label>
                                <select
                                    value={modalitat}
                                    onChange={(e) => setModalitat(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] transition-all outline-none appearance-none"
                                >
                                    <option value="A">Modalitat A (3 Trim.)</option>
                                    <option value="B">Modalitat B (2 Trim.)</option>
                                    <option value="C">Modalitat C (1 Trim.)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Descripció</label>
                            <textarea
                                value={descripcio}
                                onChange={(e) => setDescripcio(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] transition-all placeholder:text-gray-300 outline-none custom-scrollbar"
                                placeholder="Breu explicació del contingut..."
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-50 pb-3">Detalls Tècnics</h3>
                    <div className="grid grid-cols-3 gap-6">
                         <div>
                            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Durada (h)</label>
                            <input
                                type="number"
                                value={duradaHores}
                                onChange={(e) => setDuradaHores(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] transition-all outline-none md:appearance-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Places</label>
                            <input
                                type="number"
                                value={placesMaximes}
                                onChange={(e) => setPlacesMaximes(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] transition-all outline-none md:appearance-none"
                            />
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">Icona</label>
                             <div className="relative group/icon">
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] group-hover/icon:border-[#0775AB] transition-all">
                                    <span className="flex items-center gap-2">
                                        <WorkshopIcon iconName={icona} className="w-5 h-5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{icona}</span>
                                    </span>
                                </button>
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl hidden group-hover/icon:grid grid-cols-4 gap-1 p-3 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {Object.keys(SVG_ICONS).map((key) => (
                                        <button key={key} onClick={() => setIcona(key)} className="p-3 hover:bg-[#EAEFF2] flex justify-center text-[#00426B] transition-colors relative group/item">
                                            <WorkshopIcon iconName={key} className="w-5 h-5" />
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[6px] font-black uppercase opacity-0 group-hover/item:opacity-100 transition-opacity bg-[#00426B] text-white px-1">{key}</span>
                                        </button>
                                    ))}
                                </div>
                             </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Dreta: Horaris */}
            <div className="md:w-5/12 bg-[#F8FAFC] p-8 overflow-y-auto">
                <section>
                    <h3 className="text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Horari Setmanal
                    </h3>
                    
                    <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8 relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00426B]"></div>
                        <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Afegir Franja</h4>
                        <div className="space-y-4">
                            <div>
                                <select 
                                    value={tempDay} onChange={(e) => setTempDay(parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-gray-100 text-sm font-bold text-[#00426B] focus:border-[#0775AB] outline-none appearance-none"
                                >
                                    <option value={1}>Dilluns</option>
                                    <option value={2}>Dimarts</option>
                                    <option value={3}>Dimecres</option>
                                    <option value={4}>Dijous</option>
                                    <option value={5}>Divendres</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input type="time" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="w-full px-3 py-2 text-sm font-bold text-[#00426B] border border-gray-100 bg-[#F8FAFC] focus:border-[#0775AB] outline-none" />
                                </div>
                                <span className="flex items-center text-gray-300">-</span>
                                <div className="flex-1">
                                    <input type="time" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="w-full px-3 py-2 text-sm font-bold text-[#00426B] border border-gray-100 bg-[#F8FAFC] focus:border-[#0775AB] outline-none" />
                                </div>
                            </div>
                            <button 
                                onClick={addScheduleSlot}
                                className="w-full py-3 bg-[#EAEFF2] text-[#00426B] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#00426B] hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                + Afegir Dia
                            </button>
                        </div>
                    </div>

                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Dies Configurats</h4>
                    <div className="space-y-3">
                        {schedule.map((slot, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white border border-gray-100 p-4 shadow-sm hover:border-[#0775AB] transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-[#00426B] uppercase tracking-tight">{daysMap[slot.dayOfWeek]}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{slot.startTime} - {slot.endTime}</span>
                                </div>
                                <button onClick={() => removeScheduleSlot(idx)} className="text-gray-300 hover:text-[#F26178] transition-colors p-2 hover:bg-red-50 rounded-full">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                        {schedule.length === 0 && (
                            <div className="text-center py-10 border border-dashed border-gray-200 text-gray-300 text-[10px] font-bold uppercase tracking-widest bg-white">
                                Cap dia configurat encara
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 flex justify-between items-center shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             {error ? (
                 <div className="text-[#F26178] text-[10px] font-black uppercase tracking-widest">{error}</div>
             ) : (
                 <div className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Revisa les dades abans de guardar.</div>
             )}
             
             <div className="flex gap-4">
                 <button onClick={onClose} className="px-6 py-3 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
                     Cancel·lar
                 </button>
                 <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="px-10 py-3 bg-[#00426B] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0775AB] shadow-xl disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                 >
                     {loading ? 'Guardant...' : 'Guardar Taller'}
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkshopModal;