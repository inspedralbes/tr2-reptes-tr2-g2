import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME, PHASES } from '@iter/shared';
import api, { getMyAssignments, getFases } from '../../../services/api';

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
    const sorted = [...assignments].sort((a, b) => 
      new Date(a.data_inici || 0).getTime() - new Date(b.data_inici || 0).getTime()
    );
    
    // Find next upcoming or today, else last one
    return sorted.find(a => new Date(a.data_inici).getTime() >= now.getTime() - 86400000) || sorted[0];
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
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (

    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Professional Header */}
        <View className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 mb-6">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text className="text-3xl font-extrabold text-slate-900 leading-tight">
            Hola, {userName}
          </Text>
        </View>

        <View className="px-6">
          
          {/* Section: Next Session */}
          <Text className="text-slate-900 text-lg font-bold mb-4">Propera Sessió</Text>

          {/* Hero Card */}
          {nextWorkshop ? (
             <TouchableOpacity 
               onPress={() => handleWorkshopClick(nextWorkshop)}
               activeOpacity={0.9}
               className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mb-8"
             >
                {/* Accent Bar */}
                <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                
                <View className="ml-3">
                    {/* Top Row: Time & Status */}
                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-md">
                           <Ionicons name="time" size={14} color="#64748B" />
                           <Text className="text-gray-600 text-xs font-bold ml-1.5">
                              {new Date(nextWorkshop.data_inici).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </Text>
                        </View>
                        {isPhaseActive(PHASES.EJECUCION) && (
                            <View className="bg-green-100 px-2.5 py-1 rounded-full">
                                <Text className="text-green-700 text-[10px] font-extrabold uppercase tracking-wide">En Curs</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text className="text-xl font-black text-slate-900 mb-1 leading-tight" numberOfLines={2}>
                        {nextWorkshop.taller.titol}
                    </Text>

                    {/* Location */}
                    <View className="flex-row items-center mb-5">
                        <Ionicons name="location" size={16} color="#94A3B8" />
                        <Text className="text-slate-500 text-sm font-medium ml-1.5" numberOfLines={1}>
                            {nextWorkshop.centre.nom}
                        </Text>
                    </View>

                    {/* Action Footer */}
                    <View className="flex-row justify-between items-center pt-4 border-t border-gray-50">
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                           {isPhaseActive(PHASES.EJECUCION) ? 'Gestionar Sessió' : 'Veure Detalls'}
                        </Text>
                        <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center">
                            <Ionicons name="arrow-forward" size={16} color="white" />
                        </View>
                    </View>
                </View>
             </TouchableOpacity>
          ) : (
            <View className="bg-white rounded-2xl p-8 border-dashed border-2 border-gray-200 items-center justify-center mb-8">
               <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-3">
                  <Ionicons name="calendar" size={24} color="#CBD5E1" />
               </View>
               <Text className="text-gray-400 font-medium text-center">No tens tallers propers.</Text>
            </View>
          )}

          {/* Section: Project Status */}
          <Text className="text-slate-900 text-lg font-bold mb-4">Estat Actual</Text>
          
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-row items-center mb-8">
             <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center mr-4 border border-orange-100">
                <Ionicons name="flag" size={24} color="#F97316" />
             </View>
             <View className="flex-1">
                 <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Fase del Projecte</Text>
                 <Text className="text-lg font-bold text-slate-900">
                    {fases.find(f => f.activa)?.nom || 'Càrrega de dades'}
                 </Text>
             </View>
             <View className="bg-gray-50 w-8 h-8 rounded-full items-center justify-center">
                 <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
             </View>
          </View>

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