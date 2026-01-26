'use client';

import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  white?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Carregant...',
  size = 'md',
  white = false
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const ringColor = white ? 'text-white' : 'text-[#00426B]';
  const dotColor = white ? 'bg-white' : 'bg-[#0775AB]';
  const glowColor = white ? 'bg-white/10' : 'bg-[#00426B]/5';
  const textColor = white ? 'text-white/80' : 'text-[#00426B]/80';

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer Glow */}
        <div className={`absolute inset-0 ${glowColor} rounded-full blur-xl animate-pulse`}></div>

        {/* Modern Circular Spinner */}
        <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
          <circle
            className={`${ringColor} opacity-10`}
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className={ringColor}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            d="M25,5 A20,20 0 0,1 45,25"
          />
        </svg>

        {/* Inner Pulsing Circle */}
        {size !== 'sm' && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${dotColor} rounded-full shadow-lg animate-pulse`}
            style={{ animationDuration: '2s' }}
          ></div>
        )}
      </div>

      {message && size !== 'sm' && (
        <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${textColor} drop-shadow-sm`}>
          {message}
        </p>
      )}
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
    <div className={`flex items-center justify-center ${size === 'sm' ? '' : 'w-full py-20'}`}>
      {content}
    </div>
  );
};

export default Loading;
