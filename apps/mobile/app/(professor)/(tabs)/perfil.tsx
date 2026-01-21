import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Professional Header */}
        <View className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 mb-6">
           <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
             Espai Personal
           </Text>
           <Text className="text-3xl font-extrabold text-slate-900 leading-tight">
             El Meu Perfil
           </Text>
        </View>

        <View className="px-6"> 
          
          {/* User ID Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex-row items-center">
             <View className="w-20 h-20 rounded-full bg-slate-900 items-center justify-center mr-6 border-4 border-gray-50 shadow-sm">
                <Text className="text-2xl font-black text-white">{getUserInitials()}</Text>
             </View>
             <View className="flex-1">
                <Text className="text-2xl font-extrabold text-slate-900 leading-tight mb-1" numberOfLines={1}>
                  {user?.nom_complet || 'Carregant...'}
                </Text>
                <View className="bg-blue-50 self-start px-2 py-1 rounded-md border border-blue-100">
                   <Text className="text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                     {user?.role === 'PROFESSOR' ? 'Professorat' : 'Administrador'}
                   </Text>
                </View>
             </View>
          </View>

          {/* Settings Group */}
          <Text className="text-slate-900 text-lg font-bold mb-4">Configuració</Text>
          
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8 shadow-sm">
             
             {/* Notificacions */}
             <View className="p-4 flex-row justify-between items-center border-b border-gray-50">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                   <Ionicons name="notifications" size={20} color="#64748B" />
                 </View>
                 <Text className="font-bold text-sm text-slate-700">Notificacions Push</Text>
               </View>
               <Switch 
                 value={notifications}
                 onValueChange={setNotifications}
                 trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                 thumbColor="white"
               />
             </View>
             
             {/* Change Password */}
             <TouchableOpacity className="p-4 flex-row justify-between items-center border-b border-gray-50">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                   <Ionicons name="lock-closed" size={20} color="#64748B" />
                 </View>
                 <Text className="font-bold text-sm text-slate-700">Seguretat i Contrasenya</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
             </TouchableOpacity>

             {/* Help Center */}
             <TouchableOpacity className="p-4 flex-row justify-between items-center">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                   <Ionicons name="help-buoy" size={20} color="#64748B" />
                 </View>
                 <Text className="font-bold text-sm text-slate-700">Suport i Ajuda</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
             </TouchableOpacity>

          </View>

          {/* Logout Button */}
           <TouchableOpacity 
             onPress={handleLogout} 
             className="bg-red-50 rounded-2xl p-4 border border-red-100 flex-row items-center justify-center mb-10"
           >
             <Ionicons name="log-out" size={20} color="#EF4444" className="mr-2" />
             <Text className="text-red-600 font-bold text-sm uppercase tracking-wider ml-2">Tancar Sessió</Text>
           </TouchableOpacity>

           {/* Version Footer */}
           <View className="items-center pb-8">
              <Text className="text-xs text-gray-400 font-bold uppercase tracking-widest">Iter App v1.0.0</Text>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}
