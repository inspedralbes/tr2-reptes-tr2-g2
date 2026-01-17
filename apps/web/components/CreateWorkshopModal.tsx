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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
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
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Taller <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-black"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none h-28 resize-y text-black"
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-black"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-black"
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
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-black"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-black"
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
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            className={`px-6 py-2.5 rounded-lg text-white font-bold shadow-md transform transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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