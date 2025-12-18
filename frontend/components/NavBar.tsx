import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NativeStackHeaderProps } from '@react-navigation/native-stack';

export default function NavBar({ options, navigation, back }: NativeStackHeaderProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const title = options.title;

   return (
    <View 
      style={{ paddingTop: insets.top + 10 }}
      className="bg-white flex-row items-center justify-between px-4 pb-4 border-b border-gray-200 shadow-sm"
    >
      <View className="flex-1 items-start justify-center">
        {back && (
          <TouchableOpacity 
            onPress={navigation.goBack}
            className="p-2 -ml-2 rounded-full active:bg-gray-100"
          >
            <Text className="text-blue-600 font-medium text-base">← Volver</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-2 items-center justify-center">
        <Text className="font-bold text-lg text-gray-800">
          {String(title)}
        </Text>
      </View>

      <View className="flex-1 items-end justify-center">
        {/* Aquí podrías poner un botón de menú o configuración */}
      </View>
    </View>
  );
}