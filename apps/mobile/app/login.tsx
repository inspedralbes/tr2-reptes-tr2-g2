import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { THEME, ROLES } from '@iter/shared';
import { login } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Per favor, omple tots els camps.');
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      const { token, user } = response.data;

      // Restricció de rol: Només els PROFESSORS poden entrar a l'app mòbil
      if (user.rol?.nom_rol !== ROLES.PROFESOR) {
        setLoading(false);
        setRoleError('Aquesta aplicació és d\'ús exclusiu per a professors. Els administradors i coordinadors han d\'utilitzar la plataforma web.');
        return;
      }

      setRoleError(null);

      // Save token and user info
      if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
      }

      router.replace('/(professor)' as any);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Error en iniciar sessió. Revisa les teves credencials.';
      Alert.alert('Error de Login', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-24 pb-12">
          {/* Logo / Header Area */}
          <View className="mb-16">
            <View className="w-16 h-2 bg-accent mb-6" />
            <Text className="text-4xl font-bold text-[#00426B] leading-[45px] tracking-tight">
              Inici de{"\n"}Sessió
            </Text>
            <View className="flex-row items-center mt-4">
              <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Plataforma Iter</Text>
              <View className="h-[1px] flex-1 bg-gray-100 ml-4" />
            </View>
          </View>

          {/* Form */}
          <View className="space-y-6">
            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Correu Electrònic</Text>
              <View className="flex-row items-center border border-gray-200 p-4 bg-gray-50">
                <Ionicons name="mail-outline" size={20} color="#64748B" />
                <TextInput
                  className="flex-1 ml-4 font-bold text-gray-900"
                  placeholder="exemple@email.cat"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Contrasenya</Text>
              <View className="flex-row items-center border border-gray-200 p-4 bg-gray-50">
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                <TextInput
                  className="flex-1 ml-4 font-bold text-gray-900"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {roleError && (
            <View className="my-6 p-5 bg-[#F26178]/10 border-l-4 border-[#F26178]">
              <View className="flex-row items-center mb-2">
                <Ionicons name="warning-outline" size={18} color="#F26178" />
                <Text className="ml-2 font-black text-[10px] text-[#F26178] uppercase tracking-widest">Accés Restringit</Text>
              </View>
              <Text className="text-xs font-bold text-gray-600 leading-relaxed mb-4">
                {roleError}
              </Text>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://iter.consorci.cat')}
                className="flex-row items-center border-b border-[#F26178] self-start pb-0.5"
              >
                <Text className="text-[#F26178] font-black text-[10px] uppercase tracking-widest">Anar a la Plataforma Web</Text>
                <Ionicons name="arrow-forward" size={12} color="#F26178" className="ml-2" />
              </TouchableOpacity>
            </View>
          )}

          <View className="mt-12">
            <TouchableOpacity 
              className={`bg-primary py-4 items-center justify-center ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-sm uppercase tracking-wider">Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-8 items-center">
              <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">He oblidat la contrasenya</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Branding */}
          <View className="mt-auto items-center">
            <Text className="text-[9px] font-black text-gray-300 uppercase tracking-[4px]">
              Consorci d'Educació de Barcelona
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
