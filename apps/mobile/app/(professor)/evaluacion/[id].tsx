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
    { title: 'COMPETENCIAS TRANSVERSALES', score: transversal, setScore: setTransversal, description: 'Trabajo en equipo, puntualidad y actitud.' },
    { title: 'COMPETENCIAS TÉCNICAS', score: technical, setScore: setTechnical, description: 'Uso de herramientas y comprensión de conceptos.' },
  ];

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="p-6 pt-10 border-b-2 border-gray-900">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-6">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-black uppercase tracking-tight">RÚBRICA DIGITAL</Text>
        </View>
        <Text className="text-secondary font-black text-xs uppercase tracking-widest mb-1">Evaluación Semanal</Text>
        <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Taller de Robótica Avanzada</Text>
      </View>

      <View className="p-6 pt-10">
        {competencies.map((comp, index) => (
          <View key={index} className="mb-12">
            <View className="flex-row items-center mb-4">
              <View className="w-2 h-8 bg-primary mr-3" />
              <Text className="text-lg font-black text-gray-900 tracking-tight uppercase">{comp.title}</Text>
            </View>
            <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-[1px] mb-6 leading-4">{comp.description}</Text>
            
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => comp.setScore(num)}
                  className={`w-14 h-14 items-center justify-center border-2 ${comp.score === num ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-xl font-black ${comp.score === num ? 'text-white' : 'text-gray-400'}`}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="mb-12">
          <View className="flex-row items-center mb-4">
            <View className="w-2 h-8 bg-accent mr-3" />
            <Text className="text-lg font-black text-gray-900 tracking-tight uppercase">Feedback Semanal</Text>
          </View>
          <TextInput
            className="bg-gray-50 border-2 border-gray-200 p-6 h-40 text-gray-900 font-bold text-xs"
            multiline
            placeholder="Observaciones sobre el grupo o sesiones..."
            textAlignVertical="top"
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>

        <TouchableOpacity 
          className="bg-primary py-5 items-center mb-10"
          onPress={() => router.back()}
        >
          <Text className="text-white font-black text-sm uppercase tracking-[2px]">GUARDAR EVALUACIÓN</Text>
        </TouchableOpacity>

        <View className="bg-beige/20 p-8 border-l-8 border-beige mb-12">
          <Text className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Encuesta Final de Proyecto</Text>
          <Text className="text-gray-600 font-bold text-xs mb-6 leading-5">Solo debe completarse una vez finalizado el taller completo.</Text>
          <TouchableOpacity 
            onPress={() => Linking.openURL('https://forms.gle/example')}
            className="flex-row items-center"
          >
            <Text className="text-primary font-black text-xs uppercase tracking-widest">IR AL FORMULARIO</Text>
            <Ionicons name="open-outline" size={16} color={THEME.colors.primary} className="ml-2" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
