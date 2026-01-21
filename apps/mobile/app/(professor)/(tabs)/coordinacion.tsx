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
      <View key={prof.id_professor} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4 border border-blue-100">
            <Text className="text-blue-600 font-bold text-lg">{prof.nom.charAt(0)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</Text>
            <Text className="text-lg font-extrabold text-slate-900 leading-tight">{prof.nom}</Text>
          </View>
        </View>

        <View className="flex-row space-x-3">
          {prof.contacte && (
            <TouchableOpacity 
              onPress={() => handleCall(prof.contacte)}
              className="flex-1 bg-slate-900 py-3 rounded-xl flex-row items-center justify-center shadow-sm"
            >
              <Ionicons name="call" size={16} color="white" />
              <Text className="text-white font-bold text-xs uppercase tracking-wider ml-2">Trucar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => handleEmail(prof.email || 'info@consorci.cat')}
            className={`flex-1 border border-gray-200 py-3 rounded-xl flex-row items-center justify-center ${!prof.contacte ? 'bg-slate-50' : 'bg-white'}`}
          >
            <Ionicons name="mail" size={16} color="#475569" />
            <Text className="text-slate-600 font-bold text-xs uppercase tracking-wider ml-2">Email</Text>
          </TouchableOpacity>
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
              <View key={assig.id_assignacio} className="mb-8">
                {/* Section Header */}
                <View className="flex-row items-center mb-4 ml-1">
                   <View className="bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 mr-3">
                      <Text className="text-indigo-700 font-bold text-[10px] uppercase tracking-wide">Equip Docent</Text>
                   </View>
                   <Text className="flex-1 text-slate-500 font-bold text-xs uppercase tracking-wide" numberOfLines={1}>{assig.taller.titol}</Text>
                </View>
                
                {renderReferent(assig.prof1, 'Referent Principal')}
                {renderReferent(assig.prof2, 'Referent Secundari')}

                {!assig.prof1 && !assig.prof2 && (
                  <View className="p-6 bg-white rounded-2xl border-2 border-dashed border-gray-200 items-center">
                     <Ionicons name="people-outline" size={24} color="#94A3B8" className="mb-2" />
                     <Text className="text-gray-400 font-bold text-xs uppercase text-center">Sense referents assignats</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="items-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mx-4">
               <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="school-outline" size={32} color="#CBD5E1" />
               </View>
               <Text className="text-gray-400 font-bold uppercase tracking-widest text-center">No hi ha contactes encara</Text>
            </View>
          )}

          <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center mt-2 shadow-sm">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-3 border border-blue-100">
              <Ionicons name="chatbubbles" size={20} color="#3B82F6" />
            </View>
            <Text className="text-slate-500 font-medium text-center text-sm">
              <Text className="font-bold text-slate-900">Properament:</Text> Xat grupal directe amb els referents de cada taller.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
