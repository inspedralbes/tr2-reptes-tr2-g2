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
      } else {
        // Reset form
        setCodiCentre("");
        setNom("");
        setAdreca("");
        setTelefonContacte("");
        setEmailContacte("");
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
      <div className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-[#00426B] uppercase tracking-tight">
              {initialData ? "Editar Centro" : "Crear Nuevo Centro"}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {initialData ? "Modifica els detalls del centre educatiu" : "Introdueix els detalls per registrar un nou centre."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-[#00426B] transition-colors"
            aria-label="Tancar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Codi del Centre <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: 08012345"
                value={codiCentre}
                onChange={(e) => setCodiCentre(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Nom del Centre <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: Institut Pedralbes"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Adreça
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: Carrer Gran Via, 123"
                value={adreca}
                onChange={(e) => setAdreca(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Telèfon de Contacte
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: 931234567"
                value={telefonContacte}
                onChange={(e) => setTelefonContacte(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Email de Contacte
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: contacte@centre.edu"
                value={emailContacte}
                onChange={(e) => setEmailContacte(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel·lar
          </button>
          <button
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#00426B] hover:bg-[#0775AB]"
              }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processant...
              </span>
            ) : (
              initialData ? "Guardar Canvis" : "Crear Centre"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCentroModal;
