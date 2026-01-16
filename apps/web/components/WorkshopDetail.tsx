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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl max-h-full overflow-y-auto relative">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-12 right-5 bg-black bg-opacity-30 p-2 z-50 text-white hover:bg-opacity-50"
        >
          ✕
        </button>

        <img
          src={imageSource}
          className="w-full h-72 bg-gray-200 object-cover"
          alt={selectedWorkshop.titol}
        />

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-blue-600 text-3xl font-bold leading-tight flex-1">
              {selectedWorkshop.titol}
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(selectedWorkshop)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-bold"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>

          {/* Etiquetas */}
          <div className="flex items-center mb-8 flex-wrap gap-2">
            <div className="bg-blue-100 px-3 py-1 border border-blue-200 rounded">
              <span className="text-blue-600 text-xs font-bold uppercase">
                {selectedWorkshop.modalitat}
              </span>
            </div>
            <div className="bg-blue-50 px-3 py-1 border border-blue-100 rounded">
              <span className="text-blue-400 text-xs font-bold">
                {selectedWorkshop.trimestre} Trimestre
              </span>
            </div>
          </div>

          {/* Contenedor de Información */}
          <div>
            {/* 1. Ubicación */}
            <div className="flex items-start mb-6">
              <div className="bg-gray-100 p-3 mr-4 border border-gray-300 rounded">
                📍
              </div>
              <div className="flex-1 pt-1">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1 block">Ubicación</span>
                <span className="text-blue-600 text-lg font-medium">
                  {selectedWorkshop.detalls_tecnics?.ubicacio_defecte ?? 'No disponible'}
                </span>
              </div>
            </div>

            {/* 2. Detalles */}
            <div className="flex items-start mb-6">
              <div className="bg-gray-100 p-3 mr-4 border border-gray-300 rounded">
                👥
              </div>
              <div className="flex-1 pt-1">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1 block">Detalles</span>
                <span className="text-blue-600 text-lg font-medium">
                  {selectedWorkshop.detalls_tecnics?.places_maximes ?? 0} Plazas disponibles
                </span>
                {(selectedWorkshop.referents_assignats?.length ?? 0) > 0 && (
                  <span className="text-gray-600 text-sm mt-1 leading-5 block">
                    Referentes: {selectedWorkshop.referents_assignats!.join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Separador */}
            <div className="h-px bg-gray-300 w-full mb-6" />

            {/* 4. Descripción */}
            <div>
              <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3 block">Descripción del Taller</span>
              <span className="text-gray-800 text-lg leading-8">
                {selectedWorkshop.detalls_tecnics?.descripcio ?? 'No disponible.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Fijo */}
        <div className="border-t border-gray-300 p-5">
          <div className="flex gap-3">
            <button
              onClick={() => console.log('Download PDF')}
              className="flex-1 border border-gray-300 flex items-center justify-center p-4 hover:bg-gray-50"
            >
              <span className="mr-2">📄</span>
              <span className="text-blue-600 font-bold">PDF</span>
            </button>
            <button
              onClick={() => {
                onClose();
                router.push('/statistics');
              }}
              className="flex-2 bg-blue-600 flex items-center justify-center p-4 text-white font-bold text-lg hover:bg-blue-700"
            >
              <span className="mr-2">📋</span>
              Inscribirse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}