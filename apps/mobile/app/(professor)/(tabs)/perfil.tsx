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
    <ScrollView className="flex-1 bg-[#F9FAFB] pt-4" showsVerticalScrollIndicator={false}>

      <View className="p-6 pt-10">
        {/* User Info Section */}
        <View className="bg-white p-8 border border-gray-200 mb-10 flex-row items-center">
          <View className="w-20 h-20 bg-blue-50 items-center justify-center mr-8 border border-blue-100">
            <Text className="text-3xl font-bold text-[#3B82F6]">{getUserInitials()}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 tracking-tight">{user?.nom_complet || 'Usuari'}</Text>
            <Text className="text-primary font-bold text-xs mt-1 uppercase tracking-wider">{user?.role === 'PROFESSOR' ? 'Professor' : 'Administrador'}</Text>
            <Text className="text-gray-400 font-medium text-[10px] mt-1">Connectat a Iter</Text>
          </View>
        </View>

        {/* Settings Section */}
        <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6">Configuració</Text>
        
        <View className="bg-white border border-gray-200 mb-6">
          <View className="p-6 flex-row justify-between items-center border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="bg-gray-50 p-2 mr-4">
                <Ionicons name="notifications-outline" size={18} color="#64748B" />
              </View>
              <Text className="font-bold text-xs text-gray-700">Notificacions Push</Text>
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
              <View className="bg-gray-50 p-2 mr-4">
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
              </View>
              <Text className="font-bold text-xs text-gray-700">Canviar Contrasenya</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity className="p-6 flex-row justify-between items-center border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="bg-gray-50 p-2 mr-4">
                <Ionicons name="help-circle-outline" size={18} color="#64748B" />
              </View>
              <Text className="font-bold text-xs text-gray-700">Centre d'Ajuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} className="p-6 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-red-50 p-2 mr-4">
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              </View>
              <Text className="font-bold text-xs text-red-500">Tancar Sessió</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FEE2E2" />
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
          <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Iter App v1.0.0</Text>
          <Text className="text-[9px] text-gray-300 font-bold mt-2 uppercase">© 2026 Consorci d'Educació de Barcelona</Text>
        </View>
      </View>
    </ScrollView>
  );
}
