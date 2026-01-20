import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../../services/api';

export default function CoordinacionScreen() {
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
      <View key={prof.id_professor} className="bg-white p-6 border border-gray-200 mb-6">
        <View className="flex-row items-center mb-6">
          <View className="p-3 bg-blue-50 mr-4 border border-blue-100">
            <Ionicons name="star" size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</Text>
            <Text className="text-xl font-bold text-gray-900 tracking-tight">{prof.nom}</Text>
          </View>
        </View>

        <View className="flex-row space-x-3">
          {prof.contacte && (
            <TouchableOpacity 
              onPress={() => handleCall(prof.contacte)}
              className="flex-1 bg-primary py-3 flex-row items-center justify-center"
            >
              <Ionicons name="call" size={16} color="white" />
              <Text className="text-white font-bold text-xs uppercase tracking-wider ml-3">Trucar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => handleEmail(prof.email || 'info@consorci.cat')}
            className="flex-1 border border-primary py-3 flex-row items-center justify-center"
          >
            <Ionicons name="mail" size={16} color={THEME.colors.primary} />
            <Text className="text-primary font-bold text-xs uppercase tracking-wider ml-3">Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#F9FAFB] pt-4" showsVerticalScrollIndicator={false}>

      <View className="p-6 pt-10">
        {assignments.length > 0 ? (
          assignments.map((assig) => (
            <View key={assig.id_assignacio} className="mb-10">
              <View className="flex-row items-center mb-6 border-b border-gray-100 pb-2">
                <View className="bg-indigo-50 px-3 py-1 mr-3 border border-indigo-100">
                   <Text className="text-indigo-600 font-bold text-[8px] tracking-widest">TALLER</Text>
                </View>
                <Text className="flex-1 text-gray-900 font-bold text-xs tracking-wide">{assig.taller.titol}</Text>
              </View>
              
              {renderReferent(assig.prof1, 'Referent Principal')}
              {renderReferent(assig.prof2, 'Referent Secundari')}

              {!assig.prof1 && !assig.prof2 && (
                <View className="p-4 border-2 border-dashed border-gray-200">
                   <Text className="text-gray-400 font-bold text-[10px] uppercase text-center">Sin referentes asignados todavía</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="items-center py-20 bg-white border border-gray-100">
             <Text className="text-gray-400 font-bold uppercase tracking-widest text-center">No hi ha contactes encara</Text>
          </View>
        )}

        <View className="bg-white p-8 border border-gray-200 items-center mt-6">
          <View className="bg-blue-50 p-4 border border-blue-100 mb-4">
            <Ionicons name="chatbubbles-outline" size={24} color="#3B82F6" />
          </View>
          <Text className="text-gray-400 font-medium text-center text-xs leading-5">
            Properament: Xat grupal per a la sessió activa.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
