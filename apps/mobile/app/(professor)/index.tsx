import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { THEME, PHASES } from '@iter/shared';
import api, { getMyAssignments, getFases } from '../../services/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [fases, setFases] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndFetchData = async () => {
      try {
        // Verificar rol antes de cargar nada
        let userData = null;
        try {
          userData = Platform.OS === 'web' 
            ? localStorage.getItem('user') 
            : await SecureStore.getItemAsync('user');
        } catch (storageError) {
          console.warn("⚠️ [Dashboard] Error accedint al magatzem:", storageError);
          // Si fallamos al leer, forzamos login por seguridad
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
        // Si el error es de autenticación, el interceptor ya manejará la redirección
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
    // Simple logic: sort by start date and find the first one in the future or today
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
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        {/* Welcome Section */}
        <View className="mb-10 pt-4">
          <Text className="text-sm font-black uppercase tracking-[3px] text-primary mb-2">PANEL DOCENTE</Text>
          <Text className="text-4xl font-bold text-gray-900 tracking-tighter leading-none">¡Hola!</Text>
        </View>

        {/* Section Title */}
        <View className="flex-row items-center mb-6">
          <View className="w-2 h-8 bg-primary mr-3" />
          <Text className="text-xl font-bold text-gray-900 uppercase tracking-widest">Próxima Sesión</Text>
        </View>

        {/* Next Workshop Card */}
        {nextWorkshop ? (
          <View className="bg-white border-2 border-gray-900 p-6 mb-10 shadow-[8px_8px_0px_0px_rgba(0,66,107,0.1)]">
            <View className="flex-row justify-between items-start mb-6">
              <View className="bg-primary p-3">
                <Ionicons name="hardware-chip" size={24} color="white" />
              </View>
              <View className="border border-green-600 px-3 py-1">
                <Text className="text-green-700 text-[10px] font-black uppercase tracking-widest">
                  {isPhaseActive(PHASES.EJECUCION) ? 'EN CURSO' : 'PENDIENTE'}
                </Text>
              </View>
            </View>
            
            <Text className="text-2xl font-black text-gray-900 mb-4 leading-tight uppercase tracking-tight">
              {nextWorkshop.taller.titol}
            </Text>
            
            <View className="space-y-3 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                <Text className="text-gray-600 font-bold ml-3 text-xs tracking-wider uppercase">
                  {new Date(nextWorkshop.data_inici).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#4B5563" />
                <Text className="text-gray-600 font-bold ml-3 text-xs tracking-wider">09:00 - 13:00</Text> 
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => openMaps(nextWorkshop)}
              className="flex-row items-center bg-gray-50 p-4 border border-gray-200 mb-6"
            >
              <Ionicons name="location-outline" size={16} color={THEME.colors.secondary} />
              <Text className="text-gray-900 font-bold ml-3 flex-1 text-xs" numberOfLines={1}>
                {nextWorkshop.centre.nom} - {nextWorkshop.centre.adreca || 'Sin dirección'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => isPhaseActive(PHASES.EJECUCION) ? router.push(`/(professor)/sesion/${nextWorkshop.id_assignacio}`) : alert('El període d\'execució encara no ha començat')}
              className={`py-5 items-center ${isPhaseActive(PHASES.EJECUCION) ? 'bg-primary active:bg-blue-900' : 'bg-gray-200'}`}
            >
              <Text className="text-white font-black text-sm uppercase tracking-[2px]">
                {isPhaseActive(PHASES.EJECUCION) ? 'GESTIONAR ASISTENCIA' : 'SESIÓN PENDIENTE'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-gray-50 p-8 border-2 border-dashed border-gray-300 items-center mb-10">
            <Text className="text-gray-500 font-bold uppercase tracking-widest text-center">No tienes talleres asignados próximamente</Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <View className="w-2 h-8 bg-accent mr-3" />
            <Text className="text-xl font-bold text-gray-900 uppercase tracking-widest">Alertas</Text>
          </View>
        </View>

        <View className="bg-white p-5 border border-gray-200 mb-4 flex-row items-start">
          <View className="bg-accent p-2 mr-4">
            <Ionicons name="notifications" size={18} color="white" />
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-black text-gray-900 text-xs uppercase tracking-wider">FASE ACTUAL</Text>
            </View>
            <Text className="text-gray-600 text-xs leading-5">
              Estamos en la fase de {fases.find(f => f.activa)?.nom || 'Carga de datos'}.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}