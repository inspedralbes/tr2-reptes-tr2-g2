import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '@iter/shared';

export default function EvaluacionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [transversal, setTransversal] = useState(0);
  const [technical, setTechnical] = useState(0);
  const [feedback, setFeedback] = useState('');

  const competencies = [
    { title: 'COMPETÈNCIES TRANSVERSALS', score: transversal, setScore: setTransversal, description: 'Treball en equip, puntualitat i actitud.' },
    { title: 'COMPETÈNCIES TÈCNIQUES', score: technical, setScore: setTechnical, description: 'Ús d\'eines i comprensió de conceptes.' },
  ];

  return (
    <ScrollView className="flex-1 bg-[#F9FAFB] pt-4" showsVerticalScrollIndicator={false}>

      <View className="p-6 pt-10">
        {competencies.map((comp, index) => (
          <View key={index} className="mb-12 bg-white p-6 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className={`p-3 mr-4 ${index === 0 ? 'bg-indigo-50' : 'bg-blue-50'}`}>
                <Ionicons name={index === 0 ? 'people' : 'construct'} size={20} color={index === 0 ? '#6366F1' : '#3B82F6'} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 tracking-tight">{comp.title}</Text>
              </View>
            </View>
            <Text className="text-gray-500 font-medium text-xs mb-6 leading-4">{comp.description}</Text>
            
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => comp.setScore(num)}
                  className={`w-12 h-12 items-center justify-center border ${comp.score === num ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}
                >
                  <Text className={`text-lg font-bold ${comp.score === num ? 'text-white' : 'text-gray-400'}`}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="mb-12 bg-white p-6 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="bg-orange-50 p-3 mr-4">
              <Ionicons name="chatbox-ellipses" size={20} color="#F97316" />
            </View>
            <Text className="text-lg font-bold text-gray-900 tracking-tight">Feedback Setmanal</Text>
          </View>
          <TextInput
            className="bg-gray-50 border border-gray-200 p-4 h-40 text-gray-900 font-medium text-sm"
            multiline
            placeholder="Observacions sobre el grup o sessions..."
            textAlignVertical="top"
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>

        <TouchableOpacity 
          className="bg-primary py-4 items-center mb-10"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-sm uppercase tracking-wider">Guardar Avaluació</Text>
        </TouchableOpacity>

        <View className="bg-white p-8 border border-gray-200 mb-12">
          <View className="flex-row items-center mb-4">
            <View className="bg-green-50 p-3 mr-4">
              <Ionicons name="document-text" size={20} color="#10B981" />
            </View>
            <Text className="text-sm font-bold text-gray-900 tracking-tight">Enquesta Final de Projecte</Text>
          </View>
          <Text className="text-gray-500 font-medium text-xs mb-6 leading-5">Només s'ha de completar un cop finalitzat el taller complet.</Text>
          <TouchableOpacity 
            onPress={() => Linking.openURL('https://forms.gle/example')}
            className="bg-gray-50 py-3 items-center border border-gray-100 flex-row justify-center"
          >
            <Text className="text-primary font-bold text-xs uppercase tracking-wider mr-2">Anar al formulari</Text>
            <Ionicons name="open-outline" size={16} color={THEME.colors.primary} className="ml-2" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
