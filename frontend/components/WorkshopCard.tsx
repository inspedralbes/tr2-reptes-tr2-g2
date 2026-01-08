import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Taller } from '../services/tallerService';

interface WorkshopCardProps {
  item: Taller;
  onPress: () => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-1 bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-3 min-h-[140px] justify-between"
    >
      <View>
        <Text
          className="text-[#00426b] font-bold text-base mb-1 leading-5"
          numberOfLines={2}
        >
          {item.titol}
        </Text>
        <Text
          className="text-slate-500 text-xs leading-4"
          numberOfLines={3}
        >
          {item.detalls_tecnics?.descripcio || "Sense descripció disponible."}
        </Text>
      </View>
      
      <View className="mt-3 pt-2 border-t border-slate-100 flex-row justify-between items-center">
        <Text className="text-slate-400 text-[10px] font-medium uppercase">
          {item.modalitat}
        </Text>
        <Text className="text-[#003B5C] text-xs font-bold">
          Plazas: {item.detalls_tecnics?.places_maximes ?? "-"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default WorkshopCard;
