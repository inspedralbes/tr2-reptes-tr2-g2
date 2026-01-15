'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout, User } from '@/lib/auth';

export default function CentroDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.rol.nom_rol !== 'COORDINADOR') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, []);

  if (!user) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Panel de Centro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Hola, {user.nom_complet}</span>
              <button
                onClick={logout}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
             <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Gestión de Centro</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Aquí podrá gestionar las peticiones y asignaciones de su centro.</p>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
