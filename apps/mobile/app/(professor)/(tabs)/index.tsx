import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { THEME, PHASES } from '@iter/shared';
import api, { getMyAssignments, getFases } from '../../../services/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [fases, setFases] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    
    return sorted.find(a => new Date(a.data_inici).getTime() >= now.getTime() - 86400000) || sorted[0];
  };

  const nextWorkshop = getNextSession();

  const openMaps = (workshop: any) => {
    if (!workshop?.centre?.adreca) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const label = workshop.taller.titol;
    const url = Platform.select({
      ios: `${scheme}${label}@${workshop.centre.adreca}`,
      android: `${scheme}0,0?q=${workshop.centre.adreca}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F9FAFB]" showsVerticalScrollIndicator={false}>
      <View className="p-6 pt-4">

        {/* Section Title */}
        <View className="flex-row items-center mb-6">
          <Text className="text-lg font-bold text-gray-800 tracking-tight">Propera Sessió</Text>
        </View>

        {/* Next Workshop Card */}
        {nextWorkshop ? (
          <View className="bg-white border border-gray-200 p-6 mb-10">
            <View className="flex-row items-center mb-6">
              <View className="bg-blue-50 p-3 mr-4">
                <Ionicons name="hardware-chip" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 leading-tight">
                  {nextWorkshop.taller.titol}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-green-100 px-2 py-0.5">
                    <Text className="text-green-700 text-[9px] font-bold uppercase tracking-wider">
                      {isPhaseActive(PHASES.EJECUCION) ? 'EN CURS' : 'PENDENT'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View className="space-y-4 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text className="text-gray-600 font-medium ml-3 text-xs">
                  {new Date(nextWorkshop.data_inici).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#64748B" />
                <Text className="text-gray-600 font-medium ml-3 text-xs" numberOfLines={1}>
                  {nextWorkshop.centre.nom} • {nextWorkshop.centre.adreca || 'Sense adreça'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => isPhaseActive(PHASES.EJECUCION) ? router.push(`/(professor)/sesion/${nextWorkshop.id_assignacio}`) : alert('El període d\'execució encara no ha començat')}
              className={`py-4 items-center ${isPhaseActive(PHASES.EJECUCION) ? 'bg-primary' : 'bg-gray-100'}`}
            >
              <Text className={`${isPhaseActive(PHASES.EJECUCION) ? 'text-white' : 'text-gray-400'} font-bold text-sm uppercase tracking-wider`}>
                Gestionar sessió
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white p-8 border border-gray-200 items-center mb-10">
            <Text className="text-gray-400 font-medium text-center">No tens tallers assignats properament</Text>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 tracking-tight">Alertes</Text>
        </View>

        <View className="bg-white p-5 border border-gray-200 mb-4 flex-row items-center">
          <View className="bg-orange-50 p-3 mr-4">
            <Ionicons name="notifications" size={20} color="#F97316" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-sm">Fase Actual</Text>
            <Text className="text-gray-500 text-xs mt-1">
              Estem en la fase de {fases.find(f => f.activa)?.nom || 'Càrrega de dades'}.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}