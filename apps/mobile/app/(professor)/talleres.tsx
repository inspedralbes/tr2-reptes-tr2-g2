import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../services/api';

export default function AgendaScreen() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssignments()
      .then(res => setAssignments(res.data))
      .catch(err => console.error("Error fetching assignments:", err))
      .finally(() => setLoading(false));
  }, []);

  const openMaps = (item: any) => {
    if (!item?.centre?.adreca) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const label = item.taller.titol;
    const url = Platform.select({
      ios: `${scheme}${label}@${item.centre.adreca}`,
      android: `${scheme}0,0?q=${item.centre.adreca}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-6 border-b-4 border-gray-100 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[10px] font-black text-secondary uppercase tracking-[2px]">
          {new Date(item.data_inici).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </Text>
        <View className="w-1 h-6 bg-secondary" />
      </View>
      
      <Text className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-tight">{item.taller.titol}</Text>
      <Text className="text-gray-500 font-bold mb-4 text-[11px] uppercase tracking-wider">{item.centre.nom}</Text>
      
      <View className="flex-row items-center mb-4">
        <Ionicons name="time-outline" size={14} color="#6B7280" />
        <Text className="text-gray-500 font-bold ml-3 text-[10px] uppercase tracking-wider">09:00 - 13:00</Text>
      </View>

      <TouchableOpacity 
        onPress={() => openMaps(item)}
        className="flex-row items-center bg-gray-50 p-4 border border-gray-100 mb-6"
      >
        <Ionicons name="location-outline" size={16} color={THEME.colors.secondary} />
        <Text className="text-gray-900 font-bold ml-3 flex-1 text-xs" numberOfLines={1}>
          {item.centre.adreca || 'Sin dirección registrada'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row space-x-3">
        <TouchableOpacity 
          onPress={() => router.push(`/(professor)/sesion/${item.id_assignacio}`)}
          className="flex-1 bg-primary py-4 items-center"
        >
          <Text className="text-white font-black text-[10px] uppercase tracking-widest">Asistencia</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push(`/(professor)/evaluacion/${item.id_assignacio}`)}
          className="flex-1 border-2 border-primary py-4 items-center"
        >
          <Text className="text-primary font-black text-[10px] uppercase tracking-widest">Evaluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_assignacio.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View className="p-10 items-center">
            <Text className="text-gray-400 font-bold uppercase tracking-widest text-center">No tienes talleres asignados</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="p-6 pt-10 mb-2">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-2 bg-primary mr-3" />
              <Text className="text-3xl font-black text-gray-900 tracking-tighter uppercase">TU AGENDA</Text>
            </View>
            <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest">Talleres asignados para el trimestre</Text>
          </View>
        )}
      />
    </View>
  );
}
