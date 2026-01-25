import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, ROLES } from '@iter/shared';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';


export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();
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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Professional Header */}
        <View className="px-6 pb-6 pt-4 bg-background-surface border-b border-border-subtle mb-6">
           <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
             Espai Personal
           </Text>
           <Text className="text-3xl font-extrabold text-text-primary leading-tight">
             El Meu Perfil
           </Text>
        </View>

        <View className="px-6"> 
          
          {/* User ID Card */}
          <View className="bg-background-surface rounded-2xl p-4 shadow-sm border border-border-subtle flex-row">
             <View className="w-20 items-center justify-center border-r border-border-subtle mr-5 pr-5">
                <View className="w-16 h-16 rounded-full bg-primary items-center justify-center border-4 border-background-surface shadow-sm">
                   <Text className="text-xl font-black text-white">{getUserInitials()}</Text>
                </View>
             </View>
             <View className="flex-1 justify-center">
                <Text className="text-xl font-extrabold text-text-primary leading-tight mb-1.5" numberOfLines={1}>
                  {user?.nom_complet || 'Carregant...'}
                </Text>
                <View className="bg-background-subtle self-start px-2.5 py-1 rounded-md border border-border-subtle">
                   <Text className="text-primary dark:text-white text-[10px] font-bold uppercase tracking-wide">
                     {user?.rol?.nom_rol === ROLES.PROFESOR ? 'Professorat' : 'Administrador'}
                   </Text>
                </View>
             </View>
          </View>

          {/* Settings Group */}
          <Text className="text-text-primary text-xl font-extrabold mb-4 mt-8 uppercase tracking-tight">Preferències</Text>
          
          <View className="bg-background-surface rounded-2xl border border-border-subtle overflow-hidden mb-8 shadow-sm">
             
             {/* Notificacions */}
             <View className="p-4 flex-row justify-between items-center border-b border-border-subtle">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl bg-background-subtle items-center justify-center mr-4 border border-border-subtle shadow-sm">
                   <Ionicons name="notifications" size={18} color="#64748B" />
                 </View>
                 <Text className="font-bold text-sm text-text-primary">Notificacions Push</Text>
               </View>
               <Switch 
                 value={notifications}
                 onValueChange={setNotifications}
                 trackColor={{ false: '#E2E8F0', true: '#00426B' }}
                 thumbColor="white"
               />
             </View>

             {/* Apariència selector */}
             <View className="p-4 border-b border-border-subtle">
               <View className="flex-row items-center mb-4">
                 <View className="w-10 h-10 rounded-xl bg-background-subtle items-center justify-center mr-4 border border-border-subtle shadow-sm">
                   <Ionicons name="color-palette" size={18} color="#64748B" />
                 </View>
                 <Text className="font-bold text-sm text-text-primary">Apariència</Text>
               </View>
               
               <View className="flex-row bg-background-subtle rounded-xl p-0.5 border border-border-subtle gap-0.5">
                 {[
                   { id: 'light' as const, label: 'Clar', icon: 'sunny' },
                   { id: 'dark' as const, label: 'Fosc', icon: 'moon' },
                   { id: 'system' as const, label: 'Sistema', icon: 'desktop' },
                 ].map((t) => {
                   const isActive = colorScheme === t.id;
                   return (
                     <TouchableOpacity 
                       key={t.id}
                       onPress={() => setColorScheme(t.id)}
                       activeOpacity={0.7}
                       style={{
                          flex: 1,
                          paddingVertical: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          flexDirection: 'row',
                          gap: 6,
                          backgroundColor: isActive ? '#00426B' : 'transparent', // using literal for test
                       }}
                     >
                       <Ionicons 
                         name={t.icon as any} 
                         size={12} 
                         color={isActive ? 'white' : '#64748B'} 
                       />
                       <Text className={`text-[9px] font-black uppercase tracking-widest ${
                         isActive ? 'text-white' : 'text-text-muted'
                       }`}>
                         {t.label}
                       </Text>
                     </TouchableOpacity>
                   );
                 })}
               </View>
             </View>

             
             {/* Change Password */}
             <TouchableOpacity className="p-4 flex-row justify-between items-center border-b border-border-subtle">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl bg-background-subtle items-center justify-center mr-4 border border-border-subtle shadow-sm">
                   <Ionicons name="lock-closed" size={18} color="#64748B" />
                 </View>
                 <Text className="font-bold text-sm text-text-primary">Seguretat i Contrasenya</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
             </TouchableOpacity>

             {/* Help Center */}
             <TouchableOpacity className="p-4 flex-row justify-between items-center">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl bg-background-subtle items-center justify-center mr-4 border border-border-subtle shadow-sm">
                   <Ionicons name="help-buoy" size={18} color="#64748B" />
                 </View>
                 <Text className="font-bold text-sm text-text-primary">Suport i Ajuda</Text>
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
