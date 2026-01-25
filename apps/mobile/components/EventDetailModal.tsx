import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: any;
}

interface EventDetailModalProps {
  visible: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ visible, onClose, event }) => {
  const router = useRouter();

  if (!event) return null;

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone': return THEME.colors.primary;
      case 'deadline': return THEME.colors.accent;
      case 'assignment': return THEME.colors.secondary;
      default: return THEME.colors.gray;
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet" 
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
          {/* Header / Actions */}
          <View className="flex-row justify-end items-center px-6 pt-6 pb-2">
             <TouchableOpacity 
               onPress={onClose} 
               className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
             >
                <Ionicons name="close" size={24} color="#374151" />
             </TouchableOpacity>
          </View>

          <ScrollView className="px-6 flex-1">
            <View className="pb-10">
              {/* Title Section */}
              <View className="mb-8">
                <View className="flex-row items-center mb-3">
                  <View 
                    className="px-3 py-1 rounded-full self-start mr-2"
                    style={{ backgroundColor: getEventColor(event.type) + '20' }} // 20% opacity
                  >
                    <Text 
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: getEventColor(event.type) }}
                    >
                      {event.type === 'assignment' ? 'Taller' : event.type}
                    </Text>
                  </View>
                  {event.type === 'assignment' && (
                     <View className="px-3 py-1 bg-green-100 rounded-full self-start">
                        <Text className="text-green-700 text-xs font-bold uppercase tracking-wider">PENDENT</Text>
                     </View>
                  )}
                </View>
                
                <Text className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                  {event.title}
                </Text>
                
                <Text className="text-lg text-gray-500 font-medium">
                   {new Date(event.date).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>


              {/* Modern Info Cards */}
              <View className="space-y-6">
                 
                 {/* Time Row */}
                 <View className="flex-row items-start">
                    <View className="w-12 h-12 rounded-2xl bg-orange-50 items-center justify-center mr-4">
                       <Ionicons name="time" size={24} color="#F97316" />
                    </View>
                    <View className="flex-1 pt-1">
                       <Text className="text-gray-900 font-bold text-lg mb-0.5">Horari</Text>
                       <Text className="text-gray-500 text-base">
                          {event.metadata?.hora || 'Tot el dia'}
                       </Text>
                    </View>
                 </View>

                 {/* Location Row */}
                 {event.metadata?.adreca && (
                     <View className="flex-row items-start">
                        <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
                           <Ionicons name="location" size={24} color="#3B82F6" />
                        </View>
                        <View className="flex-1 pt-1">
                           <Text className="text-gray-900 font-bold text-lg mb-0.5">Ubicació</Text>
                           <Text className="text-gray-800 text-base font-medium">{event.metadata.centre}</Text>
                           <Text className="text-gray-500 text-sm mt-0.5 leading-5">{event.metadata.adreca}</Text>
                        </View>
                     </View>
                 )}
                 
                 {/* Description/Notes Row */}
                 {event.description && (
                     <View className="flex-row items-start">
                        <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mr-4">
                           <Ionicons name="document-text" size={24} color="#8B5CF6" />
                        </View>
                        <View className="flex-1 pt-1">
                           <Text className="text-gray-900 font-bold text-lg mb-0.5">Descripció</Text>
                           <Text className="text-gray-500 text-base leading-6">
                              {event.description}
                           </Text>
                        </View>
                     </View>
                 )}
              </View>
              
              {/* Action Buttons */}
              <View className="mt-10 space-y-3">
                 {event.type === 'assignment' && event.metadata?.id_assignacio && (
                    <TouchableOpacity 
                       onPress={() => {
                         onClose();
                         router.push(`/(professor)/sesion/${event.metadata.id_assignacio}`);
                       }}
                       className="w-full bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
                    >
                        <Text className="text-white text-lg font-bold tracking-wide uppercase">Gestionar Sessió</Text>
                    </TouchableOpacity>
                 )}

                <TouchableOpacity className="w-full h-14 rounded-2xl items-center justify-center border border-gray-100 bg-gray-50">
                    <Text className="text-gray-600 text-base font-semibold">Afegir al Calendari</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="w-full h-12 items-center justify-center mt-2">
                    <Text className="text-red-400 text-sm font-medium">Eliminar esdeveniment</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
      </View>
    </Modal>
  );
};

export default EventDetailModal;
