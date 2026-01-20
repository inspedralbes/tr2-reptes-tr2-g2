import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../services/api';

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
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  const renderReferent = (prof: any, label: string) => {
    if (!prof) return null;
    return (
      <View key={prof.id_professor} className="bg-white p-6 border-2 border-gray-900 mb-4 shadow-[8px_8px_0px_0px_rgba(0,66,107,0.05)]">
        <View className="flex-row items-center mb-6">
          <View className="w-14 h-14 bg-gray-100 items-center justify-center mr-6 border-2 border-gray-900">
            <Ionicons name="star" size={24} color={THEME.colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-black text-primary uppercase tracking-[2px] mb-1">{label}</Text>
            <Text className="text-xl font-black text-gray-900 uppercase tracking-tight">{prof.nom}</Text>
          </View>
        </View>

        <View className="flex-row space-x-3">
          {prof.contacte && (
            <TouchableOpacity 
              onPress={() => handleCall(prof.contacte)}
              className="flex-1 bg-primary py-4 flex-row items-center justify-center"
            >
              <Ionicons name="call" size={16} color="white" />
              <Text className="text-white font-black text-[10px] uppercase tracking-widest ml-3">Llamar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => handleEmail(prof.email || 'info@consorci.cat')}
            className="flex-1 border-2 border-gray-900 py-4 flex-row items-center justify-center"
          >
            <Ionicons name="mail" size={16} color="black" />
            <Text className="text-gray-900 font-black text-[10px] uppercase tracking-widest ml-3">Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="p-6 pt-10 border-b-2 border-gray-900">
        <View className="flex-row items-center mb-6">
          <View className="w-8 h-2 bg-secondary mr-3" />
          <Text className="text-2xl font-black uppercase tracking-tight">COLABORACIÓN</Text>
        </View>
        <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Contactos referentes para incidencias en talleres</Text>
      </View>

      <View className="p-6 pt-10">
        {assignments.length > 0 ? (
          assignments.map((assig) => (
            <View key={assig.id_assignacio} className="mb-10">
              <View className="flex-row items-center mb-4">
                <View className="bg-primary px-3 py-1 mr-3">
                   <Text className="text-white font-black text-[8px] tracking-widest">TALLER</Text>
                </View>
                <Text className="flex-1 text-gray-900 font-black text-xs uppercase tracking-[1px]">{assig.taller.titol}</Text>
              </View>
              
              {renderReferent(assig.prof1, 'Referente Principal')}
              {renderReferent(assig.prof2, 'Referente Secundario')}

              {!assig.prof1 && !assig.prof2 && (
                <View className="p-4 border-2 border-dashed border-gray-200">
                   <Text className="text-gray-400 font-bold text-[10px] uppercase text-center">Sin referentes asignados todavía</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="items-center p-10">
             <Text className="text-gray-400 font-bold uppercase tracking-widest text-center">No hay contactos de colaboración todavía</Text>
          </View>
        )}

        <View className="bg-gray-50 p-8 border-2 border-dashed border-gray-300 items-center">
          <Ionicons name="chatbubbles-outline" size={32} color="#9CA3AF" />
          <Text className="text-gray-400 font-bold text-center mt-4 text-xs leading-5 uppercase tracking-widest">
            Próximamente: Chat grupal para la sesión activa.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
