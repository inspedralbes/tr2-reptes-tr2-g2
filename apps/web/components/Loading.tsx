'use client';

import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen = false, message = 'Carregant...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-[#00426B]/5 rounded-full blur-xl animate-pulse"></div>

        {/* Modern Circular Spinner */}
        <svg className="w-full h-full animate-spin text-[#00426B]" viewBox="0 0 50 50">
          <circle
            className="opacity-10"
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            d="M25,5 A20,20 0 0,1 45,25"
          />
        </svg>

        {/* Inner Pulsing Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0775AB] rounded-full shadow-lg animate-pulse" style={{ animationDuration: '2s' }}></div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#00426B]/80 drop-shadow-sm">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#F2F2F3] z-[9999] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-20 flex items-center justify-center">
      {content}
    </div>
  );
};

export default Loading;
