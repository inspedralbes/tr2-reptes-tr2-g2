import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Taller } from '../services/tallerService';

interface WorkshopCardProps {
  item: Taller;
  onPress: () => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ item, onPress }) => {
  const imageSource = (item as any).imatge 
    ? { uri: (item as any).imatge } 
    : { uri: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop" }; // Imagen genérica de oficina/taller

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-2xl shadow-sm mb-6 border border-slate-100 overflow-hidden"
    >
      <View className="h-48 w-full bg-slate-200 relative">
        <Image 
          source={imageSource}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full border border-slate-200">
          <Text className="text-[#00426b] text-[10px] font-bold uppercase">
            {item.modalitat}
          </Text>
        </View>
      </View>

      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
            <Text
            className="text-[#00426b] font-bold text-xl flex-1 mr-2 leading-6"
            numberOfLines={2}
            >
            {item.titol}
            </Text>
        </View>

        <Text
          className="text-slate-500 text-sm leading-5 mb-4"
          numberOfLines={2}
        >
          {item.detalls_tecnics?.descripcio || "Sense descripció disponible."}
        </Text>
        
        <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
            <View className="flex-row items-center">
                <Ionicons name="people-outline" size={16} color="#64748b" />
                <Text className="text-slate-500 text-xs ml-1 font-medium">
                    {item.detalls_tecnics?.places_maximes ?? "-"} plazas
                </Text>
            </View>

            <View className="bg-[#00426b] px-4 py-2 rounded-lg">
                <Text className="text-white text-xs font-bold">Ver Taller</Text>
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default WorkshopCard;