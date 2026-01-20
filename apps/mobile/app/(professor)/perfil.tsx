import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        let userData = null;
        if (Platform.OS === 'web') {
          userData = localStorage.getItem('user');
        } else {
          userData = await SecureStore.getItemAsync('user');
        }
        if (userData) setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error loading user", e);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('user');
        }
        router.replace('/login');
      } catch (e) {
        console.error("Error during logout", e);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Estàs segur que vols tancar la sessió?')) {
        await performLogout();
      }
    } else {
      Alert.alert(
        'Tancar Sessió',
        'Estàs segur que vols tancar la teva sessió actual?',
        [
          { text: 'Cancel·lar', style: 'cancel' },
          { text: 'Tancar Sessió', style: 'destructive', onPress: performLogout }
        ]
      );
    }
  };

  const getUserInitials = () => {
    if (!user?.nom_complet) return '??';
    return user.nom_complet.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="p-6 pt-10 border-b-2 border-gray-900">
        <View className="flex-row items-center mb-6">
          <View className="w-8 h-2 bg-primary mr-3" />
          <Text className="text-2xl font-black uppercase tracking-tight">EL MEU COMPTE</Text>
        </View>
      </View>

      <View className="p-6 pt-10">
        {/* User Info Section */}
        <View className="bg-gray-50 p-8 border-2 border-gray-900 mb-10 flex-row items-center">
          <View className="w-20 h-20 bg-primary items-center justify-center mr-8">
            <Text className="text-3xl font-black text-white">{getUserInitials()}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{user?.nom_complet || 'Usuario'}</Text>
            <Text className="text-primary font-black text-[10px] uppercase tracking-[2px] mt-2">{user?.role === 'PROFESSOR' ? 'Professor' : 'Administrador'}</Text>
            <Text className="text-gray-500 font-bold text-[9px] uppercase tracking-widest mt-1">Connectat a Iter</Text>
          </View>
        </View>

        {/* Settings Section */}
        <Text className="text-sm font-black text-gray-900 uppercase tracking-[2px] mb-6">CONFIGURACIÓ</Text>
        
        <View className="bg-white border-2 border-gray-900 mb-6">
          <View className="p-6 flex-row justify-between items-center border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={20} color="black" />
              <Text className="ml-4 font-black text-xs uppercase tracking-widest text-gray-900">Notificacions Push</Text>
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
              <Text className="ml-4 font-black text-xs uppercase tracking-widest text-gray-900">Canviar Contrasenya</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="p-6 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={20} color="black" />
              <Text className="ml-4 font-black text-xs uppercase tracking-widest text-gray-900">Centre d'Ajuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-accent py-5 items-center mt-10 active:opacity-80 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
        >
          <Text className="text-white font-black text-sm uppercase tracking-[3px]">TANCAR SESSIÓ</Text>
        </TouchableOpacity>

        <View className="mt-12 items-center">
          <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Iter App v1.0.0</Text>
          <Text className="text-[9px] text-gray-300 font-bold mt-2 uppercase">© 2026 Consorci d'Educació de Barcelona</Text>
        </View>
      </View>
    </ScrollView>
  );
}
