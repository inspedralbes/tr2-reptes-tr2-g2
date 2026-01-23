import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME, PHASES } from '@iter/shared';
import api, { getMyAssignments, getFases, getNotificacions } from '../../../services/api';

import { CalendarEvent } from '../../../components/EventDetailModal';
import WorkshopDetailModal from '../../../components/WorkshopDetailModal';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fases, setFases] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<CalendarEvent | null>(null);
  const [userName, setUserName] = useState('Professor');

  useEffect(() => {
    const checkRoleAndFetchData = async () => {
      try {
        let userData = null;
        try {
          userData = Platform.OS === 'web' 
            ? localStorage.getItem('user') 
            : await SecureStore.getItemAsync('user');
        } catch (storageError) {
          console.warn("⚠️ [Dashboard] Error accedint al magatzem:", storageError);
          router.replace('/login');
          return;
        }
        
        if (userData) {
          const user = JSON.parse(userData);
          if (user.nom) setUserName(user.nom);
          if (user.rol?.nom_rol !== 'PROFESSOR') {
            console.warn("[Dashboard] Accés no autoritzat per a aquest rol");
            router.replace('/login');
            return;
          }
        } else {
          router.replace('/login');
          return;
        }

        const [fasesRes, assignmentsRes] = await Promise.all([
          getFases(),
          getMyAssignments()
        ]);
        setFases(fasesRes.data.data);
        setAssignments(assignmentsRes.data);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    checkRoleAndFetchData();
  }, []);

  const isPhaseActive = (nomFase: string) => {
    const fase = fases.find(f => f.nom === nomFase);
    return fase ? fase.activa : false;
  };

  const getNextSession = () => {
    if (assignments.length === 0) return null;
    const now = new Date();
    
    // Flatten sessions from all assignments
    const allSessions: any[] = [];
    assignments.forEach(assign => {
        if (assign.sessions && assign.sessions.length > 0) {
            assign.sessions.forEach((sess: any) => {
                allSessions.push({
                    id_assignacio: assign.id_assignacio,
                    taller: assign.taller,
                    centre: assign.centre,
                    data_inici: sess.data_sessio, 
                    hora_inici: sess.hora_inici,
                    hora_fi: sess.hora_fi,
                    isSession: true
                });
            });
        } else {
             // Fallback for assignments without sessions loaded
             allSessions.push({
                id_assignacio: assign.id_assignacio,
                taller: assign.taller,
                centre: assign.centre,
                data_inici: assign.data_inici,
                hora_inici: null,
                isSession: false
             });
        }
    });

    // Sort sessions by date
    allSessions.sort((a, b) => new Date(a.data_inici).getTime() - new Date(b.data_inici).getTime());

    // Find next upcoming session (today or future)
    // We look back ~20h to ensuring 'today's' sessions are shown even if technically started a few hours ago
    return allSessions.find(s => new Date(s.data_inici).getTime() >= now.getTime() - 72000000) || allSessions[allSessions.length - 1];
  };

  const nextWorkshop = getNextSession();

  const handleWorkshopClick = (workshop: any) => {
    const formattedEvent: CalendarEvent = {
        id: workshop.id_assignacio,
        title: workshop.taller.titol,
        date: workshop.data_inici,
        type: 'assignment',
        description: workshop.taller.descripcio || 'Sense descripció',
        metadata: {
            hora: new Date(workshop.data_inici).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(new Date(workshop.data_inici).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Fake duration if not provided
            centre: workshop.centre.nom,
            adreca: workshop.centre.adreca,
            id_assignacio: workshop.id_assignacio
        }
    };
    setSelectedWorkshop(formattedEvent);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }



  return (

    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Professional Header - Matches Agenda Aesthetic */}
        <View className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mr-2">
              {new Date().toLocaleDateString('ca-ES', { weekday: 'long' })}
            </Text>
            <Text className="text-gray-300 text-xs font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString('ca-ES', { day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 leading-tight mt-1">
            Hola, {userName}
          </Text>
        </View>

        <View className="px-6">
          
          {/* Section: Project Status - Apple Style - KEPT */}
          <View className="w-full bg-gray-100 rounded-2xl p-4 flex-row items-center justify-between mb-8">
             <View>
                 <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Fase Actual</Text>
                 <Text className="text-xl font-bold text-slate-900 tracking-tight">
                    {fases.find(f => f.activa)?.nom || 'Càrrega de dades'}
                 </Text>
             </View>
             <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-xs font-semibold text-gray-600">Actiu</Text>
             </View>
          </View>

          {/* Section: Next Session - Hero Card Style */}
          <Text className="text-slate-900 text-lg font-bold mb-4">Propera Sessió</Text>

          {nextWorkshop ? (
             <TouchableOpacity 
               onPress={() => handleWorkshopClick(nextWorkshop)}
               activeOpacity={0.9}
               className="w-full bg-slate-900 rounded-3xl p-6 shadow-lg shadow-slate-200 relative overflow-hidden mb-8"
             >
                {/* Decorative circle */}
                <View className="absolute -right-6 -top-6 w-32 h-32 bg-slate-800 rounded-full opacity-50" />
                
                <View>
                    {/* Top Row: Time & Status */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                           <Ionicons name="time" size={14} color="#94A3B8" />
                           <Text className="text-gray-200 text-xs font-bold ml-2">
                              {nextWorkshop.hora_inici 
                                ? `${nextWorkshop.hora_inici}${nextWorkshop.hora_fi ? ' - ' + nextWorkshop.hora_fi : ''}`
                                : new Date(nextWorkshop.data_inici).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                           </Text>
                        </View>
                        {isPhaseActive(PHASES.EJECUCION) && (
                            <View className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                                <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-wide">En Curs</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-black text-white mb-2 leading-tight" numberOfLines={2}>
                        {nextWorkshop.taller.titol}
                    </Text>

                    {/* Location */}
                    <View className="flex-row items-center mb-6">
                        <Ionicons name="location" size={16} color="#94A3B8" />
                        <Text className="text-slate-400 text-sm font-medium ml-1.5" numberOfLines={1}>
                            {nextWorkshop.centre.nom}
                        </Text>
                    </View>

                    {/* Action Footer */}
                    <View className="flex-row justify-between items-center pt-4 border-t border-slate-800">
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                           {isPhaseActive(PHASES.EJECUCION) ? 'Gestionar Sessió' : 'Veure Detalls'}
                        </Text>
                        <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                            <Ionicons name="arrow-forward" size={18} color="white" />
                        </View>
                    </View>
                </View>
             </TouchableOpacity>
          ) : (
            <View className="w-full items-center justify-center py-10 rounded-2xl border-2 border-dashed border-gray-300 mb-8">
               <Text className="text-gray-400 font-medium text-sm">No tens tallers propers</Text>
            </View>
          )}





          <View className="h-6" /> 

        </View>
      </ScrollView>
      <WorkshopDetailModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        event={selectedWorkshop} 
      />
    </View>
  );
}

// Helper to check for active sessions today
const hasActiveSession = (assignments: any[]) => {
   const today = new Date().toLocaleDateString();
   return assignments.some(a => new Date(a.data_inici).toLocaleDateString() === today);
};