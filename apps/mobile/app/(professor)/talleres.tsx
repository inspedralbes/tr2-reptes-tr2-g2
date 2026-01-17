import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';

export default function AgendaScreen() {
  const router = useRouter();

  const workshops = [
    {
      id: 1,
      title: 'Taller de Robótica Avanzada',
      place: 'Carrer de la Llacuna, 162, 08018 Barcelona',
      schedule: '09:00 - 13:00',
      date: 'LUNES, 19 ENE',
      lat: 41.4036,
      lng: 2.1937,
    },
    {
      id: 2,
      title: 'Impresión 3D y Prototipado',
      place: 'Gran Via de les Corts Catalanes, 585, 08007 Barcelona',
      schedule: '15:00 - 18:00',
      date: 'MIÉRCOLES, 21 ENE',
      lat: 41.3871,
      lng: 2.1641,
    },
    {
      id: 3,
      title: 'Electrónica Modular',
      place: 'Avinguda Diagonal, 647, 08028 Barcelona',
      schedule: '08:30 - 12:30',
      date: 'VIERNES, 23 ENE',
      lat: 41.3843,
      lng: 2.1186,
    },
  ];

  const openMaps = (item) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${item.lat},${item.lng}`;
    const label = item.title;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }) => (
    <View className="bg-white p-6 border-b-4 border-gray-100 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[10px] font-black text-secondary uppercase tracking-[2px]">{item.date}</Text>
        <View className="w-1 h-6 bg-secondary" />
      </View>
      
      <Text className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-tight">{item.title}</Text>
      
      <View className="flex-row items-center mb-4">
        <Ionicons name="time-outline" size={14} color="#6B7280" />
        <Text className="text-gray-500 font-bold ml-3 text-[10px] uppercase tracking-wider">{item.schedule}</Text>
      </View>

      <TouchableOpacity 
        onPress={() => openMaps(item)}
        className="flex-row items-center bg-gray-50 p-4 border border-gray-100 mb-6"
      >
        <Ionicons name="location-outline" size={16} color={THEME.colors.secondary} />
        <Text className="text-gray-900 font-bold ml-3 flex-1 text-xs" numberOfLines={1}>
          {item.place}
        </Text>
      </TouchableOpacity>

      <View className="flex-row space-x-3">
        <TouchableOpacity 
          onPress={() => router.push(`/sesion/${item.id}`)}
          className="flex-1 bg-primary py-4 items-center"
        >
          <Text className="text-white font-black text-[10px] uppercase tracking-widest">Asistencia</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push(`/evaluacion/${item.id}`)}
          className="flex-1 border-2 border-primary py-4 items-center"
        >
          <Text className="text-primary font-black text-[10px] uppercase tracking-widest">Evaluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={workshops}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
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
