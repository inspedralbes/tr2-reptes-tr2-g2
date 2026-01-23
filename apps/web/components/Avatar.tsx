'use client';

interface AvatarProps {
  url?: string | null;
  name: string;
  id: string | number;
  type: 'alumne' | 'usuari';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isCoordinator?: boolean;
}

export default function Avatar({ url, name, id, type, size = 'md', className = '', isCoordinator }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-20 h-20 text-base'
  };

  const currentSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  
  // Realist fallbacks
  // For 'alumne' we use a curated student-like photo from Unsplash/Pravatar
  // For 'usuari' we use Pravatar
  // For 'coordinator' we show a building/school icon
  const avatarId = typeof id === 'number' ? id : parseInt(id.toString().slice(-3)) || 1;
  const fallbackUrl = type === 'alumne' 
    ? `https://i.pravatar.cc/150?u=student${avatarId}`
    : `https://i.pravatar.cc/150?u=teacher${avatarId}`;

  const fullUrl = url ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : null;

  return (
    <div className={`relative shrink-0 overflow-hidden bg-consorci-darkBlue text-white flex items-center justify-center font-black shadow-inner ${currentSize} ${className}`}>
      {fullUrl ? (
        <img 
          src={fullUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement?.classList.add('flex-col');
          }}
        />
      ) : isCoordinator ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-[#EAEFF2] text-[#00426B]">
          <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      ) : (
        <img 
          src={fallbackUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
