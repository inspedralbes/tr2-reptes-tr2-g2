import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';
import { CalendarEvent } from './EventDetailModal'; // Reuse type

interface WorkshopDetailModalProps {
  visible: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

const WorkshopDetailModal: React.FC<WorkshopDetailModalProps> = ({ visible, onClose, event }) => {
  const router = useRouter();

  if (!event) return null;

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet" 
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#F9FAFB]">
          
          {/* Header - Clean Light Style */}
          <View className="pt-6 pb-2 px-6 bg-white border-b border-gray-100">
             {/* Close & Action Bar */}
             <View className="flex-row justify-between items-center mb-4">
                 <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <Text className="text-blue-700 text-xs font-bold uppercase tracking-widest">
                       {event.type === 'assignment' ? 'TALLER PRÀCTIC' : 'SESSIÓ'}
                    </Text>
                 </View>
                 <TouchableOpacity 
                   onPress={onClose} 
                   className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                 >
                    <Ionicons name="close" size={24} color="#374151" />
                 </TouchableOpacity>
             </View>

             {/* Main Title Block */}
             <View className="mb-4">
                 <Text className="text-gray-900 text-3xl font-extrabold leading-tight mb-2 tracking-tight">
                    {event.title}
                 </Text>
                 <Text className="text-gray-500 text-lg font-medium">
                    {new Date(event.date).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                 </Text>
             </View>
          </View>

          <ScrollView className="px-6 py-6 flex-1" showsVerticalScrollIndicator={false}>
             
             {/* STATS GRID - "Widget Style" */}
             <View className="flex-row flex-wrap justify-between mb-6">
                 {/* Stat 1: Time */}
                 <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                    <View className="w-10 h-10 bg-orange-50 rounded-lg items-center justify-center mb-3">
                        <Ionicons name="time" size={20} color="#F97316" />
                    </View>
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Horari</Text>
                    <Text className="text-gray-900 font-bold text-lg">
                        {event.metadata?.hora || 'Tot el dia'}
                    </Text>
                 </View>

                 {/* Stat 2: Location */}
                 <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                    <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mb-3">
                        <Ionicons name="location" size={20} color="#3B82F6" />
                    </View>
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Aula</Text>
                    <Text className="text-gray-900 font-bold text-lg" numberOfLines={1}>
                        {event.metadata?.centre || 'N/A'}
                    </Text>
                 </View>
                 
                 {/* Stat 3: Group/Class */}
                 <View className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="people" size={18} color="#6366F1" className="mr-2" />
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Grup Assignat</Text>
                    </View>
                    <Text className="text-gray-900 font-medium text-base">
                        Grup de Pràctiques A2 • Enginyeria
                    </Text>
                 </View>
             </View>

             {/* DESCRIPTION CARD */}
             {event.description && (
                 <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                     <Text className="text-gray-900 font-bold text-lg mb-3">Objectius de la Sessió</Text>
                     <Text className="text-gray-500 text-base leading-7">
                        {event.description}
                     </Text>
                 </View>
             )}
             
             {/* ADDRESS CARD */}
             {event.metadata?.adreca && (
                 <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-24">
                     <Text className="text-gray-900 font-bold text-lg mb-3">Direcció</Text>
                     <View className="flex-row items-center">
                         <Ionicons name="map" size={20} color="#9CA3AF" className="mr-3" />
                         <Text className="text-gray-600 text-base flex-1">
                            {event.metadata.adreca}
                         </Text>
                     </View>
                 </View>
             )}

          </ScrollView>

           {/* FIXED BOTTOM ACTION */}
           {event.type === 'assignment' && event.metadata?.id_assignacio && (
               <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                    <TouchableOpacity 
                       onPress={() => {
                         onClose();
                         router.push(`/(professor)/sesion/${event.metadata.id_assignacio}`);
                       }}
                       className="w-full bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
                    >
                        <Text className="text-white text-lg font-bold tracking-wide uppercase">Començar Sessió</Text>
                    </TouchableOpacity>
               </View>
           )}
      </View>
    </Modal>
  );
};

export default WorkshopDetailModal;
