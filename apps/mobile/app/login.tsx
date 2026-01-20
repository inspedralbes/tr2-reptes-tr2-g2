import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { THEME } from '@iter/shared';
import { login } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Per favor, omple tots els camps.');
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      const { token, user } = response.data;

      // Save token and user info
      if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
      }

      router.replace('/(professor)');
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
            <View className="w-16 h-4 bg-accent mb-6" />
            <Text className="text-5xl font-black text-gray-900 leading-[50px] uppercase tracking-tighter">
              INICI DE{"\n"}SESSICÓ
            </Text>
            <View className="flex-row items-center mt-4">
              <Text className="text-primary font-black text-xs uppercase tracking-widest">Plataforma Iter</Text>
              <View className="h-[1px] flex-1 bg-gray-200 ml-4" />
            </View>
          </View>

          {/* Form */}
          <View className="space-y-6">
            <View>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1">Correu Electrònic</Text>
              <View className="flex-row items-center border-2 border-gray-900 p-4 bg-gray-50">
                <Ionicons name="mail-outline" size={20} color="#00426B" />
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
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1">Contrasenya</Text>
              <View className="flex-row items-center border-2 border-gray-900 p-4 bg-gray-50">
                <Ionicons name="lock-closed-outline" size={20} color="#00426B" />
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

          <View className="mt-12">
            <TouchableOpacity 
              className={`bg-primary py-5 items-center justify-center shadow-[6px_6px_0px_0px_rgba(242,97,120,0.3)] ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-sm uppercase tracking-[3px]">Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-8 items-center">
              <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">He oblidat la contrasenya</Text>
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
