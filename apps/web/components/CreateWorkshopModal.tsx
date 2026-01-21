"use client";

import React, { useState, useEffect } from "react";
import tallerService, { Taller } from "../services/tallerService";
import sectorService, { Sector } from "../services/sectorService";

type CreateWorkshopModalProps = {
  visible: boolean;
  onClose: () => void;
  onWorkshopCreated: (newWorkshop: Taller) => void;
  initialData?: Taller | null;
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
  const [diesExecucio, setDiesExecucio] = useState("");
  const [icona, setIcona] = useState("PUZZLE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const SVG_ICONS = {
    PUZZLE: <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
    ROBOT: <path d="M12 2a2 2 0 012 2v1h2a2 2 0 012 2v2h1a2 2 0 012 2v4a2 2 0 01-2 2h-1v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2H4a2 2 0 01-2-2v-4a2 2 0 012-2h1V7a2 2 0 012-2h2V4a2 2 0 012-2zM9 9H7v2h2V9zm8 0h-2v2h2V9z" />,
    CODE: <path d="M10 20l-7-7 7-7m4 0l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor" />,
    PAINT: <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10c1 0 1.8-.8 1.8-1.8 0-.46-.17-.9-.47-1.24-.3-.33-.47-.78-.47-1.26 0-.96.79-1.75 1.75-1.75H17c2.76 0 5-2.24 5-5 0-4.42-4.48-8-10-8z" />,
    FILM: <path d="M7 4V20M17 4V20M3 8H7M17 8H21M3 12H21M3 16H7M17 16H21M3 4H21V20H3V4Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor" />,
    TOOLS: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6-3.8 3.8L11 11.6a1 1 0 00-1.4 0L3.3 18a1 1 0 000 1.4l1.3 1.3a1 1 0 001.4 0l6.4-6.4 1.5 1.5a1 1 0 001.4 0l3.8-3.8 1.6 1.6a1 1 0 001.4 0l1.3-1.3a1 1 0 000-1.4L14.7 6.3z" />,
    LEAF: <path d="M12 2a10 10 0 00-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16z" />,
    GEAR: <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
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
    if (visible) {
      if (initialData) {
        setTitol(initialData.titol);
        setIdSector(initialData.id_sector || "");
        setModalitat(initialData.modalitat);
        setTrimestre(initialData.trimestre);
        setIcona(initialData.icona || "🧩");
        setDescripcio(initialData.detalls_tecnics?.descripcio || "");
        setDuradaHores(initialData.detalls_tecnics?.durada_hores?.toString() || "");
        setPlacesMaximes(initialData.detalls_tecnics?.places_maximes?.toString() || "");
        setUbicacioDefecte(initialData.detalls_tecnics?.ubicacio_defecte || "");
        setDiesExecucio(initialData.dies_execucio.join(", "));
      } else {
        // Reset form
        setTitol("");
        setIdSector("");
        setModalitat("A");
        setTrimestre("1r");
        setIcona("🧩");
        setDescripcio("");
        setDuradaHores("");
        setPlacesMaximes("");
        setUbicacioDefecte("");
        setDiesExecucio("");
      }
      setError(null);
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!titol || !modalitat) {
      setError("El título y la modalidad son obligatorios.");
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
      dies_execucio: diesExecucio.split(",").map((d) => d.trim()),
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
        err.message ||
        (initialData ? "No se pudo actualizar el taller." : "No se pudo crear el taller.")
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white border-l border-r shadow-none w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-300 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? "Editar Taller" : "Crear Nuevo Taller"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {initialData ? "Modifica los detalles del taller" : "Introduce los detalles para registrar un nuevo taller en el catálogo."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors focus:outline-none focus:ring-1 focus:ring-consorci-darkBlue"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-[0.2em] mb-3">
                Icona del Taller
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-100">
                {Object.entries(SVG_ICONS).map(([key, path]) => (
                  <button
                    key={key}
                    onClick={() => setIcona(key)}
                    className={`w-12 h-12 flex items-center justify-center transition-all border ${
                      icona === key 
                        ? 'bg-[#00426B] border-[#00426B] scale-105 shadow-md text-white' 
                        : 'bg-white border-gray-200 text-[#00426B] hover:border-[#0775AB] hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      {path}
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Taller <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black font-bold uppercase tracking-tight"
                placeholder="Ej: Robótica Avanzada"
                value={titol}
                onChange={(e) => setTitol(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none h-28 resize-y text-black font-medium"
                placeholder="Describe los objetivos y contenido del taller..."
                value={descripcio}
                onChange={(e) => setDescripcio(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none bg-white text-black"
                value={idSector}
                onChange={(e) => setIdSector(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">Selecciona un sector</option>
                {sectors.map((s) => (
                  <option key={s.id_sector} value={s.id_sector}>
                    {s.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none bg-white text-black"
                value={modalitat}
                onChange={(e) => setModalitat(e.target.value)}
              >
                <option value="A">Modalitat A</option>
                <option value="B">Modalitat B</option>
                <option value="C">Modalitat C</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trimestre
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none bg-white text-black"
                value={trimestre}
                onChange={(e) => setTrimestre(e.target.value)}
              >
                <option value="1r">1r Trimestre</option>
                <option value="2n">2n Trimestre</option>
                <option value="3r">3r Trimestre</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (h)
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                    type="number"
                    min="0"
                    value={duradaHores}
                    onChange={(e) => setDuradaHores(e.target.value)}
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">
                    hrs
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plazas Max.
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                  type="number"
                  min="0"
                  value={placesMaximes}
                  onChange={(e) => setPlacesMaximes(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                  placeholder="Aula o laboratorio"
                  value={ubicacioDefecte}
                  onChange={(e) => setUbicacioDefecte(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días de ejecución
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                placeholder="Ej: Lunes, Miércoles"
                value={diesExecucio}
                onChange={(e) => setDiesExecucio(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Separados por comas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none transition-colors"
          >
            Cancelar
          </button>
          <button
            className={`px-6 py-2.5 text-white font-bold transition-colors focus:outline-none ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-consorci-darkBlue hover:bg-consorci-lightBlue"
              }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </span>
            ) : (
              initialData ? "Guardar Cambios" : "Crear Taller"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkshopModal;