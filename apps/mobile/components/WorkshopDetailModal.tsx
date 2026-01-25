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
      <View className="flex-1 bg-background-page">
          
          {/* Header - Clean Light Style */}
          <View className="pt-6 pb-2 px-6 bg-background-surface border-b border-border-subtle">
             {/* Close & Action Bar */}
             <View className="flex-row justify-between items-center mb-4">
                 <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <Text className="text-primary text-xs font-bold uppercase tracking-widest">
                       {event.type === 'assignment' ? 'TALLER PRÀCTIC' : 'SESSIÓ'}
                    </Text>
                 </View>
                 <TouchableOpacity 
                   onPress={onClose} 
                   className="w-10 h-10 bg-background-subtle rounded-full items-center justify-center"
                 >
                    <Ionicons name="close" size={24} color={THEME.colors.primary} />
                 </TouchableOpacity>
             </View>

             {/* Main Title Block */}
             <View className="mb-4">
                 <Text className="text-text-primary text-3xl font-extrabold leading-tight mb-2 tracking-tight">
                    {event.title}
                 </Text>
                 <Text className="text-text-secondary text-lg font-medium">
                    {new Date(event.date).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                 </Text>
             </View>
          </View>

          <ScrollView className="px-6 py-6 flex-1" showsVerticalScrollIndicator={false}>
             
             {/* STATS GRID - "Widget Style" */}
             <View className="flex-row flex-wrap justify-between mb-6">
                 {/* Stat 1: Time */}
                 <View className="w-[48%] bg-background-surface p-4 rounded-xl shadow-sm border border-border-subtle mb-4">
                    <View className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg items-center justify-center mb-3">
                        <Ionicons name="time" size={20} color="#F97316" />
                    </View>
                    <Text className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Horari</Text>
                    <Text className="text-text-primary font-bold text-lg">
                        {event.metadata?.hora || 'Tot el dia'}
                    </Text>
                 </View>

                 {/* Stat 2: Location */}
                 <View className="w-[48%] bg-background-surface p-4 rounded-xl shadow-sm border border-border-subtle mb-4">
                    <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center mb-3">
                        <Ionicons name="location" size={20} color={THEME.colors.primary} />
                    </View>
                    <Text className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Aula</Text>
                    <Text className="text-text-primary font-bold text-lg" numberOfLines={1}>
                        {event.metadata?.centre || 'N/A'}
                    </Text>
                 </View>
                 
                 {/* Stat 3: Group/Class */}
                 <View className="w-full bg-background-surface p-4 rounded-xl shadow-sm border border-border-subtle">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="people" size={18} color={THEME.colors.secondary} className="mr-2" />
                        <Text className="text-text-muted text-xs font-bold uppercase tracking-wider">Grup Assignat</Text>
                    </View>
                    <Text className="text-text-primary font-medium text-base">
                        Grup de Pràctiques A2 • Enginyeria
                    </Text>
                 </View>
             </View>

             {/* DESCRIPTION CARD */}
             {event.description && (
                 <View className="bg-background-surface p-6 rounded-2xl shadow-sm border border-border-subtle mb-6">
                     <Text className="text-text-primary font-bold text-lg mb-3">Objectius de la Sessió</Text>
                     <Text className="text-text-secondary text-base leading-7">
                        {event.description}
                     </Text>
                 </View>
             )}
             
             {/* ADDRESS CARD */}
             {event.metadata?.adreca && (
                 <View className="bg-background-surface p-6 rounded-2xl shadow-sm border border-border-subtle mb-24">
                     <Text className="text-text-primary font-bold text-lg mb-3">Direcció</Text>
                     <View className="flex-row items-center">
                         <Ionicons name="map" size={20} color={THEME.colors.gray} className="mr-3" />
                         <Text className="text-text-secondary text-base flex-1">
                            {event.metadata.adreca}
                         </Text>
                     </View>
                 </View>
             )}

          </ScrollView>

           {/* FIXED BOTTOM ACTION */}
           {event.type === 'assignment' && event.metadata?.id_assignacio && (
               <View className="absolute bottom-0 left-0 right-0 p-6 bg-background-surface border-t border-border-subtle">
                     <TouchableOpacity 
                        onPress={() => {
                          if (event.metadata.isEvaluated) return; // Prevent action if evaluated
                          onClose();
                          if (event.metadata.isEvaluation) {
                              router.push(`/(professor)/questionari/${event.metadata.id_assignacio}`);
                          } else {
                              router.push(`/(professor)/sesion/${event.metadata.id_assignacio}`);
                          }
                        }}
                        className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg shadow-slate-200 ${
                            event.metadata.isEvaluation 
                                ? (event.metadata.isEvaluated ? 'bg-green-600' : 'bg-orange-500') 
                                : 'bg-slate-900 dark:bg-primary'
                        }`}
                        disabled={event.metadata.isEvaluated}
                     >
                         {event.metadata.isEvaluated ? (
                             <View className="flex-row items-center">
                                 <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                                 <Text className="text-white text-lg font-bold tracking-wide uppercase">Taller Valorat</Text>
                             </View>
                         ) : (
                             <Text className="text-white text-lg font-bold tracking-wide uppercase">
                                 {event.metadata.isEvaluation ? 'Valorar Taller' : 'Gestionar Sessió / Assistència'}
                             </Text>
                         )}
                     </TouchableOpacity>
               </View>
           )}
      </View>
    </Modal>
  );
};

export default WorkshopDetailModal;
