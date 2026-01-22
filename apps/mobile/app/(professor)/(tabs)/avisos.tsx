import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import api, { getNotificacions } from '../../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Notificacio {
  id_notificacio: number;
  titol: string;
  missatge: string;
  llegida: boolean;
  data_creacio: string;
  tipus: 'PETICIO' | 'FASE' | 'SISTEMA';
  importancia: 'INFO' | 'WARNING' | 'URGENT';
}

export default function AvisosScreen() {
  const insets = useSafeAreaInsets();
  const [notificacions, setNotificacions] = useState<Notificacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotificacions = async () => {
    try {
      const response = await getNotificacions();
      setNotificacions(response.data);
    } catch (error) {
      console.error("Error fetching notifications mobile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotificacions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificacions();
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`notificacions/${id}/read`);
      setNotificacions(prev => prev.map(n => n.id_notificacio === id ? { ...n, llegida: true } : n));
    } catch (error) {
      console.error("Error marking read mobile:", error);
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`notificacions/${id}`);
      setNotificacions(prev => prev.filter(n => n.id_notificacio !== id));
    } catch (error) {
      console.error("Error deleting notification mobile:", error);
    }
  };

  const getImportanceColor = (imp: string) => {
    switch (imp) {
      case 'URGENT': return '#EF4444';
      case 'WARNING': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getTypeIcon = (tipus: string) => {
    switch (tipus) {
      case 'PETICIO': return 'document-text';
      case 'FASE': return 'calendar';
      default: return 'notifications';
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F9FAFB]">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        <View className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 mb-6">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Comunicacions</Text>
          <Text className="text-3xl font-extrabold text-slate-900 leading-tight">Avisos Oficials</Text>
        </View>

        <View className="px-6 pb-12">
          {notificacions.length > 0 ? (
            notificacions.map((notif) => (
              <View 
                key={notif.id_notificacio}
                className={`mb-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden ${notif.llegida ? 'opacity-60' : ''}`}
              >
                {!notif.llegida && (
                  <View style={{ backgroundColor: getImportanceColor(notif.importancia) }} className="absolute left-0 top-0 bottom-0 w-1.5" />
                )}
                
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-md">
                     <Ionicons name={getTypeIcon(notif.tipus) as any} size={12} color="#64748B" />
                     <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider ml-1.5">{notif.tipus}</Text>
                  </View>
                  <Text className="text-gray-400 text-[10px] font-medium">
                    {new Date(notif.data_creacio).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>

                <Text className={`text-lg font-black text-slate-900 mb-1 leading-tight ${notif.llegida ? 'text-slate-500' : ''}`}>
                  {notif.titol}
                </Text>
                <Text className="text-slate-600 text-sm leading-relaxed mb-4">
                  {notif.missatge}
                </Text>

                <View className="flex-row justify-end space-x-3 pt-4 border-t border-gray-50">
                   {!notif.llegida && (
                     <TouchableOpacity 
                        onPress={() => markRead(notif.id_notificacio)}
                        className="bg-slate-900 px-4 py-2 rounded-lg flex-row items-center"
                     >
                        <Ionicons name="checkmark" size={14} color="white" />
                        <Text className="text-white font-bold text-[10px] uppercase ml-1.5">Llegit</Text>
                     </TouchableOpacity>
                   )}
                   <TouchableOpacity 
                      onPress={() => deleteNotif(notif.id_notificacio)}
                      className="bg-gray-50 px-4 py-2 rounded-lg flex-row items-center border border-gray-100"
                   >
                      <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      <Text className="text-red-500 font-bold text-[10px] uppercase ml-1.5">Eliminar</Text>
                   </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
               <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="mail-open-outline" size={32} color="#CBD5E1" />
               </View>
               <Text className="text-gray-400 font-bold uppercase tracking-widest text-center px-8">No hi ha avisos nous en aquest moment</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
