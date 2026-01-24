'use client';

import { useState } from 'react';
import getApi from '@/services/api';
import { toast } from 'sonner';

interface DocumentUploadProps {
  idAssignacio: number;
  idInscripcio: number;
  documentType: 'acord_pedagogic' | 'autoritzacio_mobilitat' | 'drets_imatge';
  initialUrl?: string | null;
  isValidated?: boolean;
  label: string;
  onUploadSuccess: (newUrl: string) => void;
}

export default function DocumentUpload({
  idAssignacio,
  idInscripcio,
  documentType,
  initialUrl,
  isValidated,
  label,
  onUploadSuccess
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Només es permeten fitxers PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('idInscripcio', idInscripcio.toString());
    formData.append('documentType', documentType);

    try {
      setUploading(true);
      const api = getApi();
      const res = await api.post(`/assignacions/${idAssignacio}/student-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newUrl = res.data[documentType === 'acord_pedagogic' ? 'url_acord_pedagogic' : 
                               documentType === 'autoritzacio_mobilitat' ? 'url_autoritzacio_mobilitat' : 
                               'url_drets_imatge'];
      
      setCurrentUrl(newUrl);
      onUploadSuccess(newUrl);
      toast.success(`${label} pujat correctament.`);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error al pujar el document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 p-3 border border-gray-100 bg-gray-50/50 group hover:bg-white hover:border-consorci-lightBlue transition-all">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</span>
            {isValidated && (
                <span className="bg-green-100 text-green-600 p-0.5 rounded-full" title="Validat per l'Administrador">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                </span>
            )}
          </div>
          {currentUrl ? (
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL}${currentUrl}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${isValidated ? 'text-green-600' : 'text-consorci-darkBlue hover:text-consorci-lightBlue'}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {isValidated ? 'DOCUMENT VALIDAT' : 'VEURE DOCUMENT'}
            </a>
          ) : (
            <span className="text-[10px] font-bold text-red-400 mt-1 uppercase">PENDENT</span>
          )}
        </div>

        <label className={`shrink-0 cursor-pointer px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
          uploading ? 'bg-gray-100 text-gray-300' : 'bg-[#00426B] text-white hover:bg-[#0775AB]'
        }`}>
          {uploading ? 'PUJANT...' : currentUrl ? 'CANVIAR' : 'ADJUNTAR'}
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
