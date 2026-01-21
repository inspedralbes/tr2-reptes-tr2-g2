'use client';

import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancel·lar',
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#00426B]/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white border border-gray-200 shadow-2xl max-w-md w-full p-8 animate-in zoom-in fade-in duration-200">
        <div className="mb-6">
          <h3 className="text-xl font-black text-[#00426B] uppercase tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all border border-gray-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${
              isDestructive 
                ? 'bg-[#F26178] hover:bg-[#D94E63]' 
                : 'bg-[#00426B] hover:bg-[#0775AB]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
