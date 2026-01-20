'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.rol.nom_rol === 'ADMIN') {
          router.push('/admin');
        } else if (user.rol.nom_rol === 'COORDINADOR') {
          router.push('/centro');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
      <div className="animate-spin h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
    </div>
  );
}
