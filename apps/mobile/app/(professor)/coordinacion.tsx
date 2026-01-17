import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@enginy/shared';

export default function CoordinacionScreen() {
  const referents = [
    { id: 1, name: 'Sonia Jiménez', role: 'Referente Inst. Martí i Pous', email: 'sjimenez@ejemplo.com', phone: '600111222' },
    { id: 2, name: 'Joan Tardà', role: 'Referente Inst. Bosc de Montjuïc', email: 'jtarda@ejemplo.com', phone: '600333444' },
  ];

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="p-6 pt-10 border-b-2 border-gray-900">
        <View className="flex-row items-center mb-6">
          <View className="w-8 h-2 bg-secondary mr-3" />
          <Text className="text-2xl font-black uppercase tracking-tight">COLABORACIÓN</Text>
        </View>
        <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Contactos de profesores referentes en este taller</Text>
      </View>

      <View className="p-6 pt-10">
        {referents.map((person) => (
          <View key={person.id} className="bg-white p-6 border-2 border-gray-900 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
            <View className="flex-row items-center mb-6">
              <View className="w-14 h-14 bg-gray-100 items-center justify-center mr-6 border-2 border-gray-900">
                <Ionicons name="person" size={24} color={THEME.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-black text-gray-900 uppercase tracking-tight">{person.name}</Text>
                <Text className="text-gray-500 font-black text-[9px] uppercase tracking-widest mt-1">{person.role}</Text>
              </View>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={() => handleCall(person.phone)}
                className="flex-1 bg-primary py-4 flex-row items-center justify-center"
              >
                <Ionicons name="call" size={16} color="white" />
                <Text className="text-white font-black text-[10px] uppercase tracking-widest ml-3">Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleEmail(person.email)}
                className="flex-1 border-2 border-gray-900 py-4 flex-row items-center justify-center"
              >
                <Ionicons name="mail" size={16} color="black" />
                <Text className="text-gray-900 font-black text-[10px] uppercase tracking-widest ml-3">Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

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
