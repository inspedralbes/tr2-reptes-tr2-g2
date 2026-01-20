"use client";

import React, { useState } from "react";
import centroService, { Centre } from "../services/centroService";

type CreateCentroModalProps = {
  visible: boolean;
  onClose: () => void;
  onCentroSaved: (savedCentro: Centre) => void;
  initialData?: Centre | null;
};

const CreateCentroModal = ({
  visible,
  onClose,
  onCentroSaved,
  initialData,
}: CreateCentroModalProps) => {
  const [codiCentre, setCodiCentre] = useState("");
  const [nom, setNom] = useState("");
  const [adreca, setAdreca] = useState("");
  const [telefonContacte, setTelefonContacte] = useState("");
  const [emailContacte, setEmailContacte] = useState("");
  const [asistenciaReunion, setAsistenciaReunion] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialData) {
        setCodiCentre(initialData.codi_centre);
        setNom(initialData.nom);
        setAdreca(initialData.adreca || "");
        setTelefonContacte(initialData.telefon_contacte || "");
        setEmailContacte(initialData.email_contacte || "");
        setAsistenciaReunion(initialData.asistencia_reunion);
      } else {
        // Reset form
        setCodiCentre("");
        setNom("");
        setAdreca("");
        setTelefonContacte("");
        setEmailContacte("");
        setAsistenciaReunion(false);
      }
      setError(null);
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!codiCentre || !nom) {
      setError("El código y el nombre del centro son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);

    const centroData: Omit<Centre, "id_centre"> = {
      codi_centre: codiCentre,
      nom,
      adreca,
      telefon_contacte: telefonContacte,
      email_contacte: emailContacte,
      asistencia_reunion: asistenciaReunion,
    };

    try {
      let result;
      if (initialData) {
        result = await centroService.update(initialData.id_centre, centroData);
      } else {
        result = await centroService.create(centroData);
      }
      onCentroSaved(result);
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
        (initialData ? "No se pudo actualizar el centro." : "No se pudo crear el centro.")
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
              {initialData ? "Editar Centro" : "Crear Nuevo Centro"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {initialData ? "Modifica los detalles del centro" : "Introduce los detalles para registrar un nuevo centro."}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del Centro <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                placeholder="Ej: 08012345"
                value={codiCentre}
                onChange={(e) => setCodiCentre(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Centro <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                placeholder="Ej: Institut Pedralbes"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                placeholder="Ej: Calle Mayor, 123"
                value={adreca}
                onChange={(e) => setAdreca(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                placeholder="Ej: 931234567"
                value={telefonContacte}
                onChange={(e) => setTelefonContacte(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de Contacto
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-consorci-darkBlue transition-shadow outline-none text-black"
                placeholder="Ej: contacto@centro.edu"
                value={emailContacte}
                onChange={(e) => setEmailContacte(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                id="asistencia"
                type="checkbox"
                className="h-4 w-4 text-consorci-darkBlue focus:ring-consorci-darkBlue border-gray-300"
                checked={asistenciaReunion}
                onChange={(e) => setAsistenciaReunion(e.target.checked)}
              />
              <label htmlFor="asistencia" className="ml-2 block text-sm text-gray-700">
                Asistencia a la reunión confirmada
              </label>
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
              initialData ? "Guardar Cambios" : "Crear Centro"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCentroModal;
