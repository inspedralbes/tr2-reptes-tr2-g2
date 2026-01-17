import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';

export default function DashboardScreen() {
  const router = useRouter();

  const nextWorkshop = {
    id: 1,
    title: 'Taller de Robótica Avanzada',
    place: 'Carrer de la Llacuna, 162, 08018 Barcelona',
    schedule: '09:00 - 13:00',
    date: 'LUNES, 19 ENERO',
    lat: 41.4036,
    lng: 2.1937,
  };

  const notifications = [
    { id: 1, title: 'Cambio de horario', message: 'La sesión del viernes se ha desplazado a las 10:00.', time: 'HACE 2H' },
    { id: 2, title: 'Recordatorio de evaluación', message: 'No olvides completar la rúbrica del Taller de Impresión 3D.', time: 'HACE 5H' },
  ];

  const openMaps = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${nextWorkshop.lat},${nextWorkshop.lng}`;
    const label = nextWorkshop.title;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        {/* Welcome Section */}
        <View className="mb-10 pt-4">
          <Text className="text-sm font-black uppercase tracking-[3px] text-primary mb-2">PANEL DOCENTE</Text>
          <Text className="text-4xl font-bold text-gray-900 tracking-tighter leading-none">¡Hola, Marc!</Text>
        </View>

        {/* Section Title */}
        <View className="flex-row items-center mb-6">
          <View className="w-2 h-8 bg-primary mr-3" />
          <Text className="text-xl font-bold text-gray-900 uppercase tracking-widest">Próxima Sesión</Text>
        </View>

        {/* Next Workshop Card - Square & Static */}
        <View 
          className="bg-white border-2 border-gray-900 p-6 mb-10 shadow-[8px_8px_0px_0px_rgba(0,66,107,0.1)]"
        >
          <View className="flex-row justify-between items-start mb-6">
            <View className="bg-primary p-3">
              <Ionicons name="hardware-chip" size={24} color="white" />
            </View>
            <View className="border border-green-600 px-3 py-1">
              <Text className="text-green-700 text-[10px] font-black uppercase tracking-widest">En Curso</Text>
            </View>
          </View>
          
          <Text className="text-2xl font-black text-gray-900 mb-4 leading-tight uppercase tracking-tight">{nextWorkshop.title}</Text>
          
          <View className="space-y-3 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#4B5563" />
              <Text className="text-gray-600 font-bold ml-3 text-xs tracking-wider">{nextWorkshop.date}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#4B5563" />
              <Text className="text-gray-600 font-bold ml-3 text-xs tracking-wider">{nextWorkshop.schedule}</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={openMaps}
            className="flex-row items-center bg-gray-50 p-4 border border-gray-200 mb-6"
          >
            <Ionicons name="location-outline" size={16} color={THEME.colors.secondary} />
            <Text className="text-gray-900 font-bold ml-3 flex-1 text-xs" numberOfLines={1}>
              {nextWorkshop.place}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(`/sesion/${nextWorkshop.id}`)}
            className="bg-primary py-5 items-center active:bg-blue-900"
          >
            <Text className="text-white font-black text-sm uppercase tracking-[2px]">GESTIONAR ASISTENCIA</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <View className="w-2 h-8 bg-accent mr-3" />
            <Text className="text-xl font-bold text-gray-900 uppercase tracking-widest">Alertas</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-primary font-black text-[10px] uppercase tracking-widest">Ver Todo</Text>
          </TouchableOpacity>
        </View>

        {notifications.map((notif) => (
          <View key={notif.id} className="bg-white p-5 border border-gray-200 mb-4 flex-row items-start">
            <View className="bg-accent p-2 mr-4">
              <Ionicons name="notifications" size={18} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-black text-gray-900 text-xs uppercase tracking-wider">{notif.title}</Text>
                <Text className="text-[10px] text-gray-400 font-bold">{notif.time}</Text>
              </View>
              <Text className="text-gray-600 text-xs leading-5">{notif.message}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
