import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Stack, router } from 'expo-router';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | null>(null);
  const { register } = useAuth();

  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        setNotificationMessage(null);
        setNotificationType(null);
      }, 8002); // Clear notification after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
  };

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    if (!email.includes('@')) {
      showNotification('El formato del email no es válido. Debe contener un "@".', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await register(nombre, email, password);
      setLoading(false);

      if (result.success) {
        showNotification('Tu cuenta ha sido creada. Redirigiendo a iniciar sesión...', 'success');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500); // Redirect after a short delay
      } else {
        // Handle specific errors from the backend
        if (result.error && result.error.includes('contraseña')) {
          showNotification(result.error, 'error');
        } else if (result.error && result.error.includes('usuario ya existe')) {
          showNotification('Este correo electrónico ya está en uso.', 'error');
        } else {
          showNotification(result.error || 'No se pudo crear la cuenta.', 'error');
        }
      }
    } catch (error: any) {
      setLoading(false);
      showNotification(error.message || 'Ocurrió un error inesperado.', 'error');
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Crear Cuenta</Text>

      {notificationMessage && (
        <View
          className={`w-full max-w-sm p-3 mb-4 rounded-lg 
            ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {notificationMessage}
          </Text>
        </View>
      )}

      <TextInput
        className="w-full max-w-sm p-3 mb-4 border border-gray-300 rounded-lg text-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="Nombre"
        placeholderTextColor="#9ca3af"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
      />

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
        className="w-full max-w-sm p-3 bg-blue-600 rounded-lg flex-row items-center justify-center disabled:opacity-50 mb-4"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-xl font-semibold">Registrarse</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text className="text-blue-600 text-base dark:text-blue-400">
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </Pressable>
    </View>
  );
}
