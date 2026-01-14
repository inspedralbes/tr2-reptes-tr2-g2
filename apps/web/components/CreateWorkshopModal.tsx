"use client";

import React, { useState } from "react";
import tallerService, { Taller } from "../services/tallerService";

type CreateWorkshopModalProps = {
  visible: boolean;
  onClose: () => void;
  onWorkshopCreated: (newWorkshop: Taller) => void;
};

const CreateWorkshopModal = ({
  visible,
  onClose,
  onWorkshopCreated,
}: CreateWorkshopModalProps) => {
  const [titol, setTitol] = useState("");
  const [sector, setSector] = useState("");
  const [modalitat, setModalitat] = useState("A");
  const [trimestre, setTrimestre] = useState("1r");
  const [descripcio, setDescripcio] = useState("");
  const [duradaHores, setDuradaHores] = useState("");
  const [placesMaximes, setPlacesMaximes] = useState("");
  const [ubicacioDefecte, setUbicacioDefecte] = useState("");
  const [diesExecucio, setDiesExecucio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!titol || !modalitat) {
      setError("El título y la modalidad son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);

    const newWorkshopData: Omit<Taller, '_id'> = {
      titol,
      sector,
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
      const createdTaller = await tallerService.create(newWorkshopData);
      onWorkshopCreated(createdTaller);
      onClose();
    } catch (err: any) {
      setError(err.message || "No se pudo crear el taller. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-11/12 max-w-lg max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-600">
            Crear Nuevo Taller
          </h2>
          <button onClick={onClose} className="text-blue-400 hover:text-blue-600">
            ✕
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Título</label>
          <input
            className="border border-gray-300 p-2 w-full"
            value={titol}
            onChange={(e) => setTitol(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Sector</label>
          <input
            className="border border-gray-300 p-2 w-full"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Modalidad</label>
          <input
            className="border border-gray-300 p-2 w-full"
            value={modalitat}
            onChange={(e) => setModalitat(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Trimestre</label>
          <input
            className="border border-gray-300 p-2 w-full"
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Descripción</label>
          <textarea
            className="border border-gray-300 p-2 w-full h-24"
            value={descripcio}
            onChange={(e) => setDescripcio(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Duración (horas)</label>
          <input
            className="border border-gray-300 p-2 w-full"
            type="number"
            value={duradaHores}
            onChange={(e) => setDuradaHores(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Plazas Máximas</label>
          <input
            className="border border-gray-300 p-2 w-full"
            type="number"
            value={placesMaximes}
            onChange={(e) => setPlacesMaximes(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Ubicación</label>
          <input
            className="border border-gray-300 p-2 w-full"
            value={ubicacioDefecte}
            onChange={(e) => setUbicacioDefecte(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">
            Días de ejecución (separados por coma)
          </label>
          <input
            className="border border-gray-300 p-2 w-full"
            value={diesExecucio}
            onChange={(e) => setDiesExecucio(e.target.value)}
          />
        </div>

        <button
          className={`p-4 mt-4 w-full text-white font-bold ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Taller"}
        </button>
      </div>
    </div>
  );
};

export default CreateWorkshopModal;