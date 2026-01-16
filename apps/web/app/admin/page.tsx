"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { THEME } from "@enginy/shared";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && (!user || user.rol.nom_rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.rol.nom_rol !== 'ADMIN') {
    return (
      <div className="flex min-h-screen justify-center items-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: THEME.colors.primary }}></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Panell d'Administració" 
      subtitle={`Benvingut de nou, ${user.nom_complet}.`}
    >
      <div className="py-24 text-center animate-in fade-in duration-1000">
        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-blue-100">
           <span className="text-blue-600 font-black text-4xl">E</span>
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Inici de Sessió Actiu</h3>
        <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
          Benvingut al portal d'administració del Programa Enginy. Utilitza el menú superior per gestionar els tallers, centres i fases del programa.
        </p>
        
        <div className="mt-12 flex justify-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Sistema Operatiu</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
