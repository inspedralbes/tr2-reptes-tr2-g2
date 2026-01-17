import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';

export default function PerfilScreen() {
  const [notifications, setNotifications] = React.useState(true);

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="p-6 pt-10 border-b-2 border-gray-900">
        <View className="flex-row items-center mb-6">
          <View className="w-8 h-2 bg-primary mr-3" />
          <Text className="text-2xl font-black uppercase tracking-tight">MI CUENTA</Text>
        </View>
      </View>

      <View className="p-6 pt-10">
        {/* User Info Section */}
        <View className="bg-gray-50 p-8 border-2 border-gray-900 mb-10 flex-row items-center">
          <View className="w-20 h-20 bg-primary items-center justify-center mr-8">
            <Text className="text-3xl font-black text-white">MF</Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Marc Font</Text>
            <Text className="text-primary font-black text-[10px] uppercase tracking-[2px] mt-2">Profesor Referente</Text>
            <Text className="text-gray-500 font-bold text-[9px] uppercase tracking-widest mt-1">Inst. Martí i Pous</Text>
          </View>
        </View>

        {/* Settings Section */}
        <Text className="text-sm font-black text-gray-900 uppercase tracking-[2px] mb-6">CONFIGURACIÓN</Text>
        
        <View className="bg-white border-2 border-gray-900 mb-6">
          <View className="p-6 flex-row justify-between items-center border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={20} color="black" />
              <Text className="ml-4 font-black text-xs uppercase tracking-widest text-gray-900">Notificaciones Push</Text>
            </View>
            <Switch 
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#D1D5DB', true: THEME.colors.primary }}
              thumbColor="white"
            />
          </View>
          
          <TouchableOpacity className="p-6 flex-row justify-between items-center border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="lock-closed-outline" size={20} color="black" />
              <Text className="ml-4 font-black text-xs uppercase tracking-widest text-gray-900">Cambiar Contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="p-6 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={20} color="black" />
              <Text className="ml-4 font-black text-xs uppercase tracking-widest text-gray-900">Centro de Ayuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="bg-accent py-5 items-center mt-10"
        >
          <Text className="text-white font-black text-sm uppercase tracking-[3px]">CERRAR SESIÓN</Text>
        </TouchableOpacity>

        <View className="mt-12 items-center">
          <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Iter App v1.0.0</Text>
          <Text className="text-[9px] text-gray-300 font-bold mt-2 uppercase">© 2026 Consorci d'Educació de Barcelona</Text>
        </View>
      </View>
    </ScrollView>
  );
}
