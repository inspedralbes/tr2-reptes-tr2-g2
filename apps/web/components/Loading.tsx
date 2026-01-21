'use client';

import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen = false, message = 'Carregant...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-[#00426B]/10 rounded-full"></div>
        {/* Spinning Segment */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#00426B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Central Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#00426B]/5 rounded-full animate-pulse"></div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00426B]/60 translate-x-[0.15em]">
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
