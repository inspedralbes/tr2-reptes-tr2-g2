import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Stack, router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Login successful, redirect to main app (tabs)
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error de Login', result.error || 'Credenciales inválidas. Inténtalo de nuevo.');
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Iniciar Sesión</Text>

      <TextInput
        className="w-full max-w-sm p-3 mb-4 border border-gray-300 rounded-lg text-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        className="w-full max-w-sm p-3 mb-6 border border-gray-300 rounded-lg text-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="Contraseña"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        className="w-full max-w-sm p-3 bg-blue-600 rounded-lg flex-row items-center justify-center disabled:opacity-50"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-xl font-semibold">Entrar</Text>
        )}
      </Pressable>
    </View>
  );
}
