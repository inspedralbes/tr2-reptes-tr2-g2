"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Taller } from '../services/tallerService';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedWorkshop: Taller | null;
  onEdit: (taller: Taller) => void;
  onDelete: (id: string) => void;
}

export default function WorkshopDetail({ visible, onClose, selectedWorkshop, onEdit, onDelete }: Props) {
  const router = useRouter();

  const imageSource = (selectedWorkshop as any)?.imatge
    ? (selectedWorkshop as any).imatge
    : "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop";

  if (!visible || !selectedWorkshop) return null;

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar este taller? Esta acción no se puede deshacer.")) {
      onDelete(selectedWorkshop._id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 z-50 text-white transition-all active:scale-95 border border-white/20"
          title="Tancar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Hero Image Section */}
          <div className="md:w-2/5 relative min-h-[300px]">
            <img
              src={imageSource}
              className="absolute inset-0 w-full h-full object-cover"
              alt={selectedWorkshop.titol}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />
            
            {/* Badges on Image (Mobile) or Sidebar */}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
              <span className="bg-white text-consorci-darkBlue px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                {selectedWorkshop.modalitat}
              </span>
              <span className="bg-consorci-lightBlue text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                {selectedWorkshop.trimestre} Trimestre
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-3/5 p-8 md:p-12 flex flex-col">
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="flex-1">
                <p className="text-consorci-lightBlue font-black text-[10px] uppercase tracking-widest mb-2">Detalls del Taller</p>
                <h1 className="text-consorci-darkBlue text-4xl font-black leading-none tracking-tight">
                  {selectedWorkshop.titol}
                </h1>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => onEdit(selectedWorkshop)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 transition-all active:scale-95 border border-gray-200"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 transition-all active:scale-95 border border-red-100"
                  title="Eliminar"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Technical Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="bg-gray-50 p-3 text-consorci-darkBlue border border-gray-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1 block">Ubicació</span>
                  <p className="text-consorci-darkBlue font-bold">{selectedWorkshop.detalls_tecnics?.ubicacio_defecte ?? 'No disponible'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gray-50 p-3 text-consorci-darkBlue border border-gray-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1 block">Aforament</span>
                  <p className="text-consorci-darkBlue font-bold">{selectedWorkshop.detalls_tecnics?.places_maximes ?? 0} Plazas disponibles</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 border-l-4 border-consorci-darkBlue p-6 mb-8 flex-1">
              <span className="text-consorci-darkBlue font-black text-[10px] uppercase tracking-widest mb-2 block">Resum del Taller</span>
              <p className="text-gray-600 leading-relaxed text-sm">
                {selectedWorkshop.detalls_tecnics?.descripcio ?? 'No hi ha descripció disponible per a este taller.'}
              </p>
            </div>

            {/* Referents section if exists */}
            {(selectedWorkshop.referents_assignats?.length ?? 0) > 0 && (
              <div className="mb-10">
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-3 block">Referents Assignats</span>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkshop.referents_assignats!.map((ref, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold border border-gray-200">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button
                onClick={() => console.log('Download PDF')}
                className="flex items-center justify-center px-6 py-3 border border-gray-200 hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest text-[#00426B]"
              >
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Baixar Fitxa Tècnica (PDF)
              </button>
              <button
                onClick={onClose}
                className="bg-[#00426B] hover:bg-[#0775AB] text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 transition-all"
              >
                Tancar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}