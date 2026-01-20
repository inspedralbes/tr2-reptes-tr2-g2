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
          tabBarActiveTintColor: THEME.colors.secondary,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarStyle: {
            borderTopWidth: 0,
            height: 70,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor: THEME.colors.primary,
            borderRadius: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Helvetica Neue',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,
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
