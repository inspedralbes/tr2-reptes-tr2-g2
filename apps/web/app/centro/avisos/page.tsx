'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import notificacioService, { Notificacio } from '@/services/notificacioService';

export default function AvisosPage() {
  const { user } = useAuth();
  const [notificacions, setNotificacions] = useState<Notificacio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotificacions();
    }
  }, [user]);

  const fetchNotificacions = async () => {
    try {
      const list = await notificacioService.getAll();
      setNotificacions(list);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await notificacioService.markAsRead(id);
      setNotificacions(prev => prev.map(n => n.id_notificacio === id ? { ...n, llegida: true } : n));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const deleteNotif = async (id: number) => {
    if (!confirm('¿Estàs segur que vols eliminar aquest avís?')) return;
    try {
      await notificacioService.delete(id);
      setNotificacions(prev => prev.filter(n => n.id_notificacio !== id));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  const getImportanceStyles = (imp: string) => {
    switch(imp) {
      case 'URGENT': return 'bg-red-50 text-red-700 border-red-100';
      case 'WARNING': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getTypeIcon = (tipus: string) => {
    switch(tipus) {
      case 'PETICIO': return '📝';
      case 'FASE': return '🗓️';
      default: return '🔔';
    }
  };

  return (
    <DashboardLayout 
      title="Avisos i Notificacions" 
      subtitle="Estigues al dia dels canvis de fase, resolucions de sol·licituds i comunicacions oficials."
    >
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Carregant avisos...</p>
          </div>
        ) : notificacions.length > 0 ? (
          <div className="space-y-4">
            {notificacions.map(notif => (
              <div 
                key={notif.id_notificacio} 
                className={`p-6 border rounded-2xl transition-all ${notif.llegida ? 'bg-white opacity-70' : 'bg-white shadow-md border-transparent ring-1 ring-gray-100'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                      {getTypeIcon(notif.tipus)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-bold transition-all ${notif.llegida ? 'text-gray-600' : 'text-gray-900 text-lg'}`}>
                          {notif.titol}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getImportanceStyles(notif.importancia)}`}>
                          {notif.importancia}
                        </span>
                        {!notif.llegida && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${notif.llegida ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notif.missatge}
                      </p>
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        {new Date(notif.data_creacio).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!notif.llegida && (
                      <button 
                        onClick={() => markRead(notif.id_notificacio)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors group"
                        title="Marcar com a llegit"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotif(notif.id_notificacio)}
                      className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h4 className="text-lg font-bold text-gray-800">No tens avisos pendents</h4>
            <p className="text-sm text-gray-400 mt-1">Quan hi hagi canvis en les teves sol·licituds o dates clau, apareixeran aquí.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
