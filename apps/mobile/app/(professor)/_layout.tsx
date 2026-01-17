import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { THEME } from '@iter/shared';
import MobileNavbar from '../../components/MobileNavbar';

export default function ProfessorLayout() {
  return (
    <View style={{ flex: 1 }}>
      <MobileNavbar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: THEME.colors.primary,
          tabBarInactiveTintColor: THEME.colors.text.secondary,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: THEME.colors.neutral,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: 'white',
            borderRadius: 0, // Ensure square edges
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="talleres"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="coordinacion"
          options={{
            title: 'Colaboración',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        {/* Hidden internal screens should be kept here as routes if they are parts of this group but not tabs */}
        <Tabs.Screen
          name="sesion/[id]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="evaluacion/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
