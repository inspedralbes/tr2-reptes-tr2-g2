import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';

export default function ProfessorTabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#64748B',
        tabBarStyle: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderTopColor: isDark ? '#334155' : '#e5e7eb',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tauler',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="talleres"
        options={{
          title: 'Calendari',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="coordinacion"
        options={{
          title: 'Col·laboració',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}