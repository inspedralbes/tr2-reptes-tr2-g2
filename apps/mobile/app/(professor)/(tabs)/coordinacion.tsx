import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CoordinacionScreen() {
  const insets = useSafeAreaInsets();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssignments()
      .then(res => setAssignments(res.data))
      .catch(err => console.error("Error fetching assignments for coordination:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCall = (number: string) => {
    if (number) Linking.openURL(`tel:${number}`);
  };

  const handleEmail = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  const renderReferent = (prof: any, label: string) => {
    if (!prof) return null;
    return (
      <View key={prof.id_professor} className="bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-200 flex-row">
        {/* Left Column - Avatar Style */}
        <View className="w-14 items-center justify-center border-r border-gray-200 mr-4 pr-4">
           <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200 shadow-sm">
             <Text className="text-slate-700 font-bold text-base">{prof.nom.charAt(0)}</Text>
           </View>
        </View>

        {/* Right Content */}
        <View className="flex-1 justify-center">
            
            <View className="mb-2">
               <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</Text>
               <Text className="text-base font-extrabold text-slate-900 leading-tight">{prof.nom}</Text>
            </View>

            {/* Actions Footer */}
            <View className="flex-row items-center pt-3 border-t border-gray-200 border-dashed space-x-4">
               {prof.contacte && (
                 <TouchableOpacity 
                   onPress={() => handleCall(prof.contacte)}
                   className="flex-row items-center"
                 >
                   <Ionicons name="call" size={12} color="#475569" />
                   <Text className="text-slate-600 font-bold text-[10px] uppercase tracking-wider ml-1.5">Trucar</Text>
                 </TouchableOpacity>
               )}
               <TouchableOpacity 
                 onPress={() => handleEmail(prof.email || 'info@consorci.cat')}
                 className="flex-row items-center"
               >
                 <Ionicons name="mail" size={12} color="#475569" />
                 <Text className="text-slate-600 font-bold text-[10px] uppercase tracking-wider ml-1.5">Email</Text>
               </TouchableOpacity>
            </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Professional Header */}
        <View className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 mb-6">
           <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
             Espai Docent
           </Text>
           <Text className="text-3xl font-extrabold text-slate-900 leading-tight">
             Col·laboració
           </Text>
        </View>

        <View className="px-6 pb-10">
          {assignments.length > 0 ? (
            assignments.map((assig) => (
              <View key={assig.id_assignacio} className="mb-6">
                {/* Section Header */}
                <View className="flex-row items-center mb-3 ml-1">
                   <View className="bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 mr-2">
                      <Text className="text-indigo-700 font-bold text-[9px] uppercase tracking-wide">Equip Docent</Text>
                   </View>
                   <Text className="flex-1 text-slate-400 font-bold text-[10px] uppercase tracking-wide" numberOfLines={1}>{assig.taller.titol}</Text>
                </View>
                
                {renderReferent(assig.prof1, 'Referent Principal')}
                {renderReferent(assig.prof2, 'Referent Secundari')}

                {!assig.prof1 && !assig.prof2 && (
                  <View className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 items-center">
                     <Ionicons name="people-outline" size={24} color="#94A3B8" className="mb-2" />
                     <Text className="text-gray-400 font-bold text-xs uppercase text-center">Sense referents assignats</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="items-center py-20 bg-gray-50 rounded-3xl border border-gray-200 shadow-sm mx-0">
               <View className="w-14 h-14 bg-white rounded-full items-center justify-center mb-3 border border-gray-100 shadow-sm">
                  <Ionicons name="school-outline" size={28} color="#CBD5E1" />
               </View>
               <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] text-center">No hi ha contactes encara</Text>
            </View>
          )}

          <View className="bg-gray-50 rounded-2xl p-5 border border-gray-200 items-center mt-6 shadow-sm flex-row">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-4 border border-blue-100">
              <Ionicons name="chatbubbles" size={18} color="#3B82F6" />
            </View>
            <Text className="text-slate-500 font-medium text-xs flex-1">
              <Text className="font-bold text-slate-900">Properament: </Text>
              Xat grupal directe amb els referents de cada taller.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
