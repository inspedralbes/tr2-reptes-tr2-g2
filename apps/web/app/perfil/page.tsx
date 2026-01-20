'use client';

import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { THEME } from '@iter/shared';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="El meu Perfil"
      subtitle="Gestiona la teva informació personal i preferències de l'acadèmia."
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
          {/* Header/Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800"></div>

          <div className="px-8 pb-10 relative">
            {/* Avatar */}
            <div className="absolute -top-12 left-8">
              <div className="w-24 h-24 bg-white shadow-xl flex items-center justify-center border-4 border-white">
                <span className="text-4xl font-black text-blue-600">
                  {user.nom_complet.charAt(0)}
                </span>
              </div>
            </div>

            <div className="pt-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 leading-tight">
                    {user.nom_complet}
                  </h3>
                  <p className="text-blue-600 font-bold tracking-tight uppercase text-xs mt-1">
                    {user.rol.nom_rol} {user.centre?.nom ? `• ${user.centre.nom}` : ''}
                  </p>
                </div>

                <button className="px-6 py-3 bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest cursor-not-allowed">
                  Editar Perfil
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dades de Contacte</label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50">
                        <div className="w-10 h-10 bg-white flex items-center justify-center text-gray-400 shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Correu Electrònic</p>
                          <p className="text-sm font-bold text-gray-700">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Centre Referent</label>
                    <div className="p-4 border-2 border-dashed border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{user.centre?.nom || 'Cap centre assignat'}</p>
                      <p className="text-xs text-gray-400 mt-1">S'utilitza per a la gestió de tallers i peticions.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Seguretat</label>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white flex items-center justify-center text-gray-400 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <span className="text-sm font-bold text-gray-700">Canviar Contrasenya</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
